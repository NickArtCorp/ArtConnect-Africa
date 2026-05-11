"""
Multi-level Statistics Routes for ArtConnect Africa
Supports: Subregion → Country → City → Sector → Domain → Gender
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Dict, Any, Optional # Corrected
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from datetime import datetime, timedelta
from typing import List, Dict, Any
from collections import defaultdict
import uuid

# Import from database and auth modules
from database import User, Project, Post, Like, Comment, Message, VisitorView, get_db
from auth_utils import get_current_user, require_paid_partner, get_optional_user

# Import cache utilities
from statistics_cache import (
    get_cached_statistics, 
    set_cached_statistics, 
    clear_country_cache,
    StatisticsCache
)

stats_router = APIRouter(prefix="/api/statistics", tags=["Statistics V2"])

# ============ HELPER FUNCTIONS ============

def get_subregion_from_country(country: str) -> str:
    """Map country to African subregion"""
    regions = {
        # West Africa
        "Benin": "West Africa", "Burkina Faso": "West Africa", "Cape Verde": "West Africa",
        "Côte d'Ivoire": "West Africa", "Gambia": "West Africa", "Ghana": "West Africa",
        "Guinea": "West Africa", "Guinea-Bissau": "West Africa", "Liberia": "West Africa",
        "Mali": "West Africa", "Niger": "West Africa", "Nigeria": "West Africa",
        "Senegal": "West Africa", "Sierra Leone": "West Africa", "Togo": "West Africa",
        # Central Africa
        "Angola": "Central Africa", "Cameroon": "Central Africa", "Central African Republic": "Central Africa",
        "Chad": "Central Africa", "Republic of the Congo": "Central Africa", "Democratic Republic of the Congo": "Central Africa",
        "Equatorial Guinea": "Central Africa", "Gabon": "Central Africa", "São Tomé and Príncipe": "Central Africa",
        # East Africa
        "Burundi": "East Africa", "Comoros": "East Africa", "Djibouti": "East Africa",
        "Eritrea": "East Africa", "Ethiopia": "East Africa", "Kenya": "East Africa",
        "Madagascar": "East Africa", "Malawi": "East Africa", "Mauritius": "East Africa",
        "Mozambique": "East Africa", "Rwanda": "East Africa", "Seychelles": "East Africa",
        "Somalia": "East Africa", "South Sudan": "East Africa", "Tanzania": "East Africa",
        "Uganda": "East Africa", "Zambia": "East Africa", "Zimbabwe": "East Africa",
        # Southern Africa
        "Botswana": "Southern Africa", "Eswatini": "Southern Africa", "Lesotho": "Southern Africa",
        "Namibia": "Southern Africa", "South Africa": "Southern Africa",
        # North Africa
        "Algeria": "North Africa", "Egypt": "North Africa", "Libya": "North Africa",
        "Morocco": "North Africa", "Sudan": "North Africa", "Tunisia": "North Africa",
    }
    return regions.get(country, "Unknown")


def calculate_gender_distribution(users_query) -> Dict[str, int]:
    """Calculate gender distribution"""
    result = users_query.group_by(User.gender).all()
    return {(row[0] or "other"): row[1] for row in result}

def _normalize_profile_tag(tag: str | None) -> str | None:
    if not tag:
        return None
    t = str(tag).strip().lower()
    if t in {"artist", "artiste"}:
        return "artist"
    if t in {"professional", "professionnel", "pro"}:
        return "professional"
    if t in {"media", "média"}:
        return "media"
    return t

def _apply_scope_security(user: dict | None, country: str | None) -> str | None:
    """
    Enforce: an artist can only see their own country.
    Institutions/Admin can see all.
    """
    if not user:
        return country
    role = user.get("role")
    if role in {"admin", "institution"}:
        return country
    # Default: restrict to user's country
    return user.get("country") or country

def _base_users_query(db: Session):
    # Keep consistent with the rest of V2: "registered creators" on the platform.
    # We exclude visitors (if present) and require non-null country for geographic metrics.
    return db.query(User).filter(User.role != "visitor")

def _norm_db(col):
    """Normalize a text column for comparisons (trim + lower)."""
    return func.lower(func.trim(func.coalesce(col, "")))

def _norm_param(val: str | None) -> str | None:
    if val is None:
        return None
    v = str(val).strip()
    return v if v else None

def _gender_aliases(gender: str | None) -> list[str] | None:
    """
    Map UI-friendly values to DB variations.
    UI sends: men|women|other
    DB may store: male|female|men|women|non-binary|other|...
    """
    if not gender:
        return None
    g = str(gender).strip().lower()
    if g in {"men", "male", "m", "man", "homme"}:
        return ["men", "male", "m", "man", "homme"]
    if g in {"women", "female", "f", "woman", "femme"}:
        return ["women", "female", "f", "woman", "femme"]
    return [g]

def _fold_gender_key(g: str | None) -> str:
    g = (g or "").strip().lower()
    if g in {"women", "female", "f", "woman", "femme"}:
        return "Female"
    if g in {"men", "male", "m", "man", "homme"}:
        return "Male"
    return "Unknown"


def get_artists_by_engagement(db: Session, country: str = None, city: str = None, limit: int = 20) -> List[Dict]:
    """Get top artists by engagement (views + messages + likes + comments)"""
    query = db.query(User).filter(User.role.in_(["personne_physique", "personne_morale"]))
    
    if country:
        query = query.filter(User.country == country)
    if city:
        query = query.filter(User.city == city)
    
    artists = query.all()
    engagement_scores = []
    
    for artist in artists:
        # Count messages received
        messages = db.query(func.count(Message.id)).filter(Message.receiver_id == artist.id).scalar() or 0
        # Count likes on posts
        likes = db.query(func.count(Like.id)).join(Post).filter(Post.author_id == artist.id).scalar() or 0
        # Count visitor views
        views = db.query(func.count(VisitorView.id)).filter(VisitorView.artist_id == artist.id).scalar() or 0
        # Count collaborations
        collabs = db.query(func.count(Project.id)).filter(Project.creator_id == artist.id).scalar() or 0
        
        engagement_score = messages + likes + views + (collabs * 2)
        
        if engagement_score > 0:
            engagement_scores.append({
                "artist_id": artist.id,
                "name": f"{artist.first_name} {artist.last_name}",
                "avatar": artist.avatar,
                "domain": artist.domain or "Unknown",
                "sector": artist.sector or "Unknown",
                "country": artist.country or "Unknown",
                "city": artist.city or "Unknown",
                "engagement_score": engagement_score,
                "messages": messages,
                "likes": likes,
                "views": views,
                "collaborations": collabs
            })
    
    return sorted(engagement_scores, key=lambda x: x["engagement_score"], reverse=True)[:limit]


# ============ ROUTE 1: STATISTICS BY COUNTRY ============

@stats_router.get("/by-country/{country}")
async def get_statistics_by_country(
    country: str,
    user = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """
    Get comprehensive statistics for a specific country
    Hierarchical: Country → City → Sector → Domain → Gender
    """
    # Check cache
    cached = get_cached_statistics(db, "by_country", country=country)
    if cached:
        return cached
    
    # Verify user has access (artists can only see their country, institutions/admins see all)
    if user and user.get("role") not in ["admin", "institution"]:
        if user.get("country") != country:
            # Optional: allow artists to see other countries but marked as public data
            pass
    
    # Base queries
    users_query = db.query(User).filter(
        User.country == country,
        User.role.in_(["personne_physique", "personne_morale"])
    )
    
    projects_query = db.query(Project).join(User, Project.creator_id == User.id).filter(User.country == country)
    
    # Count artists
    total_artists = users_query.count()
    
    # Gender distribution
    gender_dist = users_query.with_entities(
        User.gender, func.count(User.id)
    ).group_by(User.gender).all()
    by_gender = {(g[0] or "other"): g[1] for g in gender_dist}
    
    # By city
    city_dist = users_query.with_entities(
        User.city, func.count(User.id)
    ).filter(User.city != None).group_by(User.city).order_by(func.count(User.id).desc()).all()
    by_city = [{"city": c[0], "artist_count": c[1]} for c in city_dist]
    
    # By sector
    sector_dist = users_query.with_entities(
        User.sector, func.count(User.id)
    ).filter(User.sector != None).group_by(User.sector).order_by(func.count(User.id).desc()).all()
    by_sector = [{"sector": s[0], "artist_count": s[1]} for s in sector_dist]
    
    # By domain
    domain_dist = users_query.with_entities(
        User.domain, func.count(User.id)
    ).filter(User.domain != None).group_by(User.domain).order_by(func.count(User.id).desc()).limit(20).all()
    by_domain = [{"domain": d[0], "artist_count": d[1]} for d in domain_dist]
    
    # Collaborations
    local_collabs = projects_query.filter(Project.collaboration_type == "local").count()
    intra_african = projects_query.filter(Project.collaboration_type == "intra_african").count()
    
    # Engagement metrics
    total_views = db.query(func.count(VisitorView.id)).join(User, VisitorView.artist_id == User.id).filter(User.country == country).scalar() or 0
    total_messages = db.query(func.count(Message.id)).join(User, Message.receiver_id == User.id).filter(User.country == country).scalar() or 0
    total_posts = db.query(func.count(Post.id)).join(User, Post.author_id == User.id).filter(User.country == country).scalar() or 0
    
    # Top artists
    top_artists = get_artists_by_engagement(db, country=country, limit=20)
    
    result = {
        "country": country,
        "subregion": get_subregion_from_country(country),
        "overview": {
            "total_artists": total_artists,
            "by_gender": by_gender,
            "total_posts": total_posts,
            "total_views": total_views,
            "total_messages": total_messages,
            "collaborations": {
                "local": local_collabs,
                "intra_african": intra_african,
                "total": local_collabs + intra_african
            }
        },
        "by_city": by_city[:15],
        "by_sector": by_sector[:10],
        "by_domain": by_domain,
        "top_artists": top_artists,
        "cached": False
    }
    
    # Cache result
    set_cached_statistics(db, "by_country", result, country=country)
    
    return result


# ============ ROUTE 2: STATISTICS BY CITY ============

@stats_router.get("/by-city/{country}/{city}")
async def get_statistics_by_city(
    country: str,
    city: str,
    user = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """
    Get statistics for a specific city within a country
    City → Sector → Domain → Gender
    """
    # Check cache
    cached = get_cached_statistics(db, "by_city", country=country, city=city)
    if cached:
        return cached
    
    # Base queries
    users_query = db.query(User).filter(
        User.country == country,
        User.city == city,
        User.role.in_(["personne_physique", "personne_morale"])
    )
    
    projects_query = db.query(Project).join(User, Project.creator_id == User.id).filter(
        and_(User.country == country, User.city == city)
    )
    
    total_artists = users_query.count()
    
    # By gender
    gender_dist = users_query.with_entities(
        User.gender, func.count(User.id)
    ).group_by(User.gender).all()
    by_gender = {(g[0] or "other"): g[1] for g in gender_dist}
    
    # By sector
    sector_dist = users_query.with_entities(
        User.sector, func.count(User.id)
    ).filter(User.sector != None).group_by(User.sector).order_by(func.count(User.id).desc()).all()
    by_sector = [{"sector": s[0], "artist_count": s[1], "engagement": get_sector_engagement(db, country, city, s[0])} for s in sector_dist]
    
    # By domain
    domain_dist = users_query.with_entities(
        User.domain, func.count(User.id)
    ).filter(User.domain != None).group_by(User.domain).order_by(func.count(User.id).desc()).limit(15).all()
    by_domain = [{"domain": d[0], "artist_count": d[1]} for d in domain_dist]
    
    # Collaborations
    local_collabs = projects_query.filter(Project.collaboration_type == "local").count()
    intra_african = projects_query.filter(Project.collaboration_type == "intra_african").count()
    
    # Engagement
    total_views = db.query(func.count(VisitorView.id)).join(User, VisitorView.artist_id == User.id).filter(
        and_(User.country == country, User.city == city)
    ).scalar() or 0
    total_messages = db.query(func.count(Message.id)).join(User, Message.receiver_id == User.id).filter(
        and_(User.country == country, User.city == city)
    ).scalar() or 0
    
    # Top artists in city
    top_artists = get_artists_by_engagement(db, country=country, city=city, limit=15)
    
    result = {
        "country": country,
        "city": city,
        "overview": {
            "total_artists": total_artists,
            "by_gender": by_gender,
            "total_views": total_views,
            "total_messages": total_messages,
            "collaborations": {
                "local": local_collabs,
                "intra_african": intra_african,
                "total": local_collabs + intra_african
            }
        },
        "by_sector": by_sector,
        "by_domain": by_domain,
        "top_artists": top_artists
    }
    
    set_cached_statistics(db, "by_city", result, country=country, city=city)
    
    return result


# ============ ROUTE 3: STATISTICS BY SECTOR (PER COUNTRY) ============

@stats_router.get("/by-country/{country}/sector/{sector}")
async def get_statistics_by_sector(
    country: str,
    sector: str,
    user = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """
    Get statistics for a specific sector within a country
    """
    # Check cache
    cached = get_cached_statistics(db, "by_sector", country=country, sector=sector)
    if cached:
        return cached
    
    users_query = db.query(User).filter(
        User.country == country,
        User.sector == sector,
        User.role.in_(["personne_physique", "personne_morale"])
    )
    
    projects_query = db.query(Project).join(User, Project.creator_id == User.id).filter(
        and_(User.country == country, User.sector == sector)
    )
    
    total_artists = users_query.count()
    
    # By gender
    gender_dist = users_query.with_entities(
        User.gender, func.count(User.id)
    ).group_by(User.gender).all()
    by_gender = {(g[0] or "other"): g[1] for g in gender_dist}
    
    # By city
    city_dist = users_query.with_entities(
        User.city, func.count(User.id)
    ).filter(User.city != None).group_by(User.city).order_by(func.count(User.id).desc()).all()
    by_city = [{"city": c[0], "artist_count": c[1]} for c in city_dist]
    
    # By domain
    domain_dist = users_query.with_entities(
        User.domain, func.count(User.id)
    ).filter(User.domain != None).group_by(User.domain).order_by(func.count(User.id).desc()).all()
    by_domain = [{"domain": d[0], "artist_count": d[1]} for d in domain_dist]
    
    # Collaborations
    local_collabs = projects_query.filter(Project.collaboration_type == "local").count()
    intra_african_total = db.query(Project).filter(
        Project.collaboration_type == "intra_african",
        or_(
            Project.creator_id.in_(db.query(User.id).filter(and_(User.country == country, User.sector == sector))),
            Project.collaborators.contains(sector)  # Rough match
        )
    ).count()
    
    # Top artists in this sector
    top_artists = get_artists_by_engagement(db, country=country, limit=15)
    top_artists = [a for a in top_artists if a["sector"] == sector][:10]
    
    result = {
        "country": country,
        "sector": sector,
        "overview": {
            "total_artists": total_artists,
            "by_gender": by_gender,
            "collaborations": {
                "local": local_collabs,
                "intra_african": intra_african_total
            }
        },
        "by_city": by_city,
        "by_domain": by_domain,
        "top_artists": top_artists
    }
    
    set_cached_statistics(db, "by_sector", result, country=country, sector=sector)
    
    return result


# ============ ROUTE 4: TIMELINE (MONTHLY EVOLUTION) ============

@stats_router.get("/timeline/{country}")
async def get_timeline_by_country(
    country: str,
    months: int = Query(12, ge=1, le=36),
    user = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """
    Get monthly evolution of statistics for a country
    Last N months of: new artists, posts, collaborations, engagement
    """
    # Check cache
    cached = get_cached_statistics(db, "timeline", country=country, months=str(months))
    if cached:
        return cached
    
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=30 * months)
    
    timeline = []
    
    for i in range(months):
        period_start = start_date + timedelta(days=30 * i)
        period_end = start_date + timedelta(days=30 * (i + 1))
        month_str = period_start.strftime("%Y-%m")
        
        # New artists in this month
        new_artists = db.query(func.count(User.id)).filter(
            and_(
                User.country == country,
                User.created_at >= period_start,
                User.created_at < period_end,
                User.role.in_(["personne_physique", "personne_morale"])
            )
        ).scalar() or 0
        
        # Posts created
        posts = db.query(func.count(Post.id)).join(User, Post.author_id == User.id).filter(
            and_(
                User.country == country,
                Post.created_at >= period_start,
                Post.created_at < period_end
            )
        ).scalar() or 0
        
        # Collaborations started
        collabs = db.query(func.count(Project.id)).join(User, Project.creator_id == User.id).filter(
            and_(
                User.country == country,
                Project.start_date >= period_start,
                Project.start_date < period_end
            )
        ).scalar() or 0
        
        # Engagement (views + messages)
        views = db.query(func.count(VisitorView.id)).join(User, VisitorView.artist_id == User.id).filter(
            and_(
                User.country == country,
                VisitorView.viewed_at >= period_start,
                VisitorView.viewed_at < period_end
            )
        ).scalar() or 0
        
        timeline.append({
            "month": month_str,
            "new_artists": new_artists,
            "posts": posts,
            "collaborations": collabs,
            "engagement": views
        })
    
    result = {
        "country": country,
        "timeline": timeline,
        "period": f"Last {months} months"
    }
    
    set_cached_statistics(db, "timeline", result, country=country, ttl_hours=24)
    
    return result


# ============ ROUTE 5: COMPARISON (MULTI-COUNTRY) ============

@stats_router.get("/compare")
async def compare_countries(
    countries: str = Query(..., description="Comma-separated country names"),
    user = Depends(require_paid_partner),
    db: Session = Depends(get_db)
):
    """
    Compare statistics across multiple countries
    Only available for paid institutions and admins
    """
    country_list = [c.strip() for c in countries.split(",")][:5]  # Max 5 countries
    
    # Check cache
    cache_key = "compare_" + "_".join(sorted(country_list))
    cached = get_cached_statistics(db, "compare", **{"countries": cache_key})
    if cached:
        return cached
    
    comparison = {}
    
    for country in country_list:
        users_query = db.query(User).filter(
            User.country == country,
            User.role.in_(["personne_physique", "personne_morale"])
        )
        
        total_artists = users_query.count()
        
        gender_dist = users_query.with_entities(
            User.gender, func.count(User.id)
        ).group_by(User.gender).all()
        by_gender = {(g[0] or "other"): g[1] for g in gender_dist}
        
        projects = db.query(func.count(Project.id)).join(User, Project.creator_id == User.id).filter(
            User.country == country
        ).scalar() or 0
        
        views = db.query(func.count(VisitorView.id)).join(User, VisitorView.artist_id == User.id).filter(
            User.country == country
        ).scalar() or 0
        
        comparison[country] = {
            "total_artists": total_artists,
            "gender_distribution": by_gender,
            "projects": projects,
            "visitor_views": views,
            "engagement_per_artist": round(views / max(total_artists, 1), 2)
        }
    
    result = {
        "countries": country_list,
        "comparison": comparison
    }
    
    set_cached_statistics(db, "compare", result, ttl_hours=24)
    
    return result


# ============ HELPER FUNCTION FOR SECTOR ENGAGEMENT ============

def get_sector_engagement(db: Session, country: str, city: str, sector: str) -> int:
    """Calculate engagement score for a sector in a city"""
    artists = db.query(User.id).filter(
        and_(
            User.country == country,
            User.city == city,
            User.sector == sector
        )
    ).all()
    
    if not artists:
        return 0
    
    artist_ids = [a[0] for a in artists]
    
    views = db.query(func.count(VisitorView.id)).filter(
        VisitorView.artist_id.in_(artist_ids)
    ).scalar() or 0
    
    messages = db.query(func.count(Message.id)).filter(
        Message.receiver_id.in_(artist_ids)
    ).scalar() or 0
    
    return views + messages


# ============ ROUTE 6: FILTER OPTIONS (CITIES / SECTORS / DOMAINS) ============

@stats_router.get("/v2/filters/cities")
async def list_cities_for_country(
    country: str = Query(...),
    user=Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    country = _apply_scope_security(user, country)
    country = _norm_param(country)
    q = _base_users_query(db).filter(_norm_db(User.country) == country.lower(), User.city != None)
    rows = q.with_entities(User.city, func.count(User.id)).group_by(User.city).order_by(func.count(User.id).desc()).all()
    return {"country": country, "cities": [{"name": r[0], "users_count": r[1]} for r in rows if r[0]]}


@stats_router.get("/v2/filters/sectors")
async def list_sectors(
    country: Optional[str] = Query(None),
    city: Optional[str] = Query(None),
    profile_tag: Optional[str] = Query(None),
    user=Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    country = _apply_scope_security(user, country)
    country = _norm_param(country)
    city = _norm_param(city)
    q = _base_users_query(db).filter(User.sector != None)
    if country:
        q = q.filter(_norm_db(User.country) == country.lower())
    if city:
        q = q.filter(_norm_db(User.city) == city.lower())
    if profile_tag:
        q = q.filter(func.lower(User.profile_tag) == _normalize_profile_tag(profile_tag))
    rows = q.with_entities(User.sector, func.count(User.id)).group_by(User.sector).order_by(func.count(User.id).desc()).all()
    return {"sectors": [{"name": r[0], "users_count": r[1]} for r in rows if r[0]]}


@stats_router.get("/v2/filters/domains")
async def list_domains(
    country: Optional[str] = Query(None),
    city: Optional[str] = Query(None),
    sector: Optional[str] = Query(None),
    profile_tag: Optional[str] = Query(None),
    user=Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    country = _apply_scope_security(user, country)
    country = _norm_param(country)
    city = _norm_param(city)
    sector = _norm_param(sector)
    q = _base_users_query(db).filter(User.domain != None)
    if country:
        q = q.filter(_norm_db(User.country) == country.lower())
    if city:
        q = q.filter(_norm_db(User.city) == city.lower())
    if sector:
        q = q.filter(_norm_db(User.sector) == sector.lower())
    if profile_tag:
        q = q.filter(func.lower(User.profile_tag) == _normalize_profile_tag(profile_tag))
    rows = q.with_entities(User.domain, func.count(User.id)).group_by(User.domain).order_by(func.count(User.id).desc()).all()
    return {"domains": [{"name": r[0], "users_count": r[1]} for r in rows if r[0]]}


# ============ ROUTE 7: EXPLORER (DRILLDOWN COUNTS) ============

@stats_router.get("/v2/explorer")
async def statistics_explorer(
    country: Optional[str] = Query(None),
    city: Optional[str] = Query(None),
    sector: Optional[str] = Query(None),
    domain: Optional[str] = Query(None),
    gender: Optional[str] = Query(None, description="women|men|other"),
    profile_tag: Optional[str] = Query(None, description="artist|professional|media"),
    user=Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """
    A single, UX-friendly endpoint to answer questions like:
    - how many cities/countries/sectors exist among registered users
    - how many men/women in the whole platform / country / city / sector / (sector+country+city)
    - how many artists/professionals/media for the same scopes
    """
    country = _apply_scope_security(user, country)
    profile_tag = _normalize_profile_tag(profile_tag)
    country = _norm_param(country)
    city = _norm_param(city)
    sector = _norm_param(sector)
    domain = _norm_param(domain)
    gender = _norm_param(gender)

    # Cache: key depends on all filters
    cached = get_cached_statistics(
        db,
        "explorer",
        country=country,
        city=city,
        sector=sector,
        domain=domain,
        gender=gender,
        profile_tag=profile_tag
    )
    if cached:
        return cached

    q = _base_users_query(db)
    if country:
        q = q.filter(_norm_db(User.country) == country.lower())
    if city:
        q = q.filter(_norm_db(User.city) == city.lower())
    if sector:
        q = q.filter(_norm_db(User.sector) == sector.lower())
    if domain:
        q = q.filter(_norm_db(User.domain) == domain.lower())
    if gender and gender != "all":
        aliases = _gender_aliases(gender)
        if aliases:
            q = q.filter(_norm_db(User.gender).in_([a.lower() for a in aliases]))
    if profile_tag and profile_tag != "all":
        q = q.filter(func.lower(func.coalesce(User.profile_tag, "")) == profile_tag)

    total_users = q.count()

    # Distinct counts (within the current scope)
    countries_count = q.with_entities(func.count(func.distinct(User.country))).scalar() or 0
    cities_count = q.with_entities(func.count(func.distinct(User.city))).scalar() or 0
    sectors_count = q.with_entities(func.count(func.distinct(User.sector))).scalar() or 0
    domains_count = q.with_entities(func.count(func.distinct(User.domain))).scalar() or 0

    # Gender distribution (within the current scope)
    gender_rows = q.with_entities(
        _norm_db(User.gender).label("gender"),
        func.count(User.id).label("count")
    ).group_by("gender").all()
    # Fold DB variants into women/men/other for consistent UI
    by_gender = {"Male": 0, "Female": 0}
    for g, c in gender_rows:
        key = _fold_gender_key(g)
        if key in by_gender:
            by_gender[key] = by_gender.get(key, 0) + (c or 0)

    # Profile tag distribution (within the current scope)
    tag_rows = q.with_entities(
        func.lower(func.coalesce(User.profile_tag, "unknown")).label("profile_tag"),
        func.count(User.id).label("count")
    ).group_by("profile_tag").all()
    by_profile_tag = {r[0]: r[1] for r in tag_rows}

    # Top breakdowns (within the current scope)
    top_cities = q.with_entities(User.city, func.count(User.id)).filter(User.city != None).group_by(User.city).order_by(func.count(User.id).desc()).limit(10).all()
    top_sectors = q.with_entities(User.sector, func.count(User.id)).filter(User.sector != None).group_by(User.sector).order_by(func.count(User.id).desc()).limit(10).all()
    top_domains = q.with_entities(User.domain, func.count(User.id)).filter(User.domain != None).group_by(User.domain).order_by(func.count(User.id).desc()).limit(10).all()

    result = {
        "scope": {
            "country": country,
            "city": city,
            "sector": sector,
            "domain": domain,
            "gender": gender,
            "profile_tag": profile_tag
        },
        "kpis": {
            "total_users": total_users,
            "countries_count": countries_count,
            "cities_count": cities_count,
            "sectors_count": sectors_count,
            "domains_count": domains_count
        },
        "by_gender": by_gender,
        "by_profile_tag": by_profile_tag,
        "top": {
            "cities": [{"name": r[0], "users_count": r[1]} for r in top_cities if r[0]],
            "sectors": [{"name": r[0], "users_count": r[1]} for r in top_sectors if r[0]],
            "domains": [{"name": r[0], "users_count": r[1]} for r in top_domains if r[0]],
        },
        "cached": False
    }

    set_cached_statistics(
        db,
        "explorer",
        result,
        country=country,
        city=city,
        sector=sector,
        domain=domain,
        gender=gender,
        profile_tag=profile_tag,
        ttl_hours=24
    )

    return result
