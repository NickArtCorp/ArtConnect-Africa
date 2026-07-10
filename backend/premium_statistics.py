"""
Premium Statistics Routes for Paid Organizations (Partenaires)
Detailed analytics with KPIs, engagement metrics, and market insights
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_, cast, String
from datetime import datetime, timedelta
from collections import defaultdict
import json

from database import User, Project, Post, Like, Comment, Message, VisitorView, get_db
from auth_utils import require_paid_partner, get_current_user

premium_stats_router = APIRouter(prefix="/api/premium", tags=["Premium Statistics"])


# ============ HELPER FUNCTIONS ============

def get_subregion_from_country(country: str) -> str:
    """Map country to African subregion"""
    regions = {
        "Benin": "West Africa", "Burkina Faso": "West Africa", "Cape Verde": "West Africa",
        "Côte d'Ivoire": "West Africa", "Gambia": "West Africa", "Ghana": "West Africa",
        "Guinea": "West Africa", "Guinea-Bissau": "West Africa", "Liberia": "West Africa",
        "Mali": "West Africa", "Niger": "West Africa", "Nigeria": "West Africa",
        "Senegal": "West Africa", "Sierra Leone": "West Africa", "Togo": "West Africa",
        "Angola": "Central Africa", "Cameroon": "Central Africa", "Central African Republic": "Central Africa",
        "Chad": "Central Africa", "Republic of the Congo": "Central Africa", "Democratic Republic of the Congo": "Central Africa",
        "Equatorial Guinea": "Central Africa", "Gabon": "Central Africa", "São Tomé and Príncipe": "Central Africa",
        "Burundi": "East Africa", "Comoros": "East Africa", "Djibouti": "East Africa",
        "Eritrea": "East Africa", "Ethiopia": "East Africa", "Kenya": "East Africa",
        "Madagascar": "East Africa", "Malawi": "East Africa", "Mauritius": "East Africa",
        "Mozambique": "East Africa", "Rwanda": "East Africa", "Seychelles": "East Africa",
        "Somalia": "East Africa", "South Sudan": "East Africa", "Tanzania": "East Africa",
        "Uganda": "East Africa", "Zambia": "East Africa", "Zimbabwe": "East Africa",
        "Botswana": "Southern Africa", "Eswatini": "Southern Africa", "Lesotho": "Southern Africa",
        "Namibia": "Southern Africa", "South Africa": "Southern Africa",
        "Algeria": "North Africa", "Egypt": "North Africa", "Libya": "North Africa",
        "Morocco": "North Africa", "Sudan": "North Africa", "Tunisia": "North Africa",
    }
    return regions.get(country, "Unknown")


def calculate_engagement_score(user_id: str, db: Session) -> int:
    """Calculate engagement score: messages + likes + views + (collabs * 2)"""
    messages = db.query(func.count(Message.id)).filter(Message.receiver_id == user_id).scalar() or 0
    likes = db.query(func.count(Like.id)).join(Post).filter(Post.author_id == user_id).scalar() or 0
    views = db.query(func.count(VisitorView.id)).filter(VisitorView.artist_id == user_id).scalar() or 0
    collabs = db.query(func.count(Project.id)).filter(Project.creator_id == user_id).scalar() or 0
    return messages + likes + views + (collabs * 2)


def has_project_collaborators(value: Any) -> bool:
    """Check if project has collaborators"""
    if value is None:
        return False
    if isinstance(value, str):
        try:
            value = json.loads(value)
        except (TypeError, ValueError):
            return bool(value)
    if isinstance(value, (list, tuple)):
        return len(value) > 0
    return bool(value)


# ============ ENDPOINT 1: PREMIUM DASHBOARD ============

@premium_stats_router.get("/dashboard")
async def get_premium_dashboard(
    user = Depends(require_paid_partner),
    db: Session = Depends(get_db)
):
    """
    Complete dashboard for premium organizations
    Shows global platform health and key metrics
    """
    
    # Platform Overview
    total_creators = db.query(func.count(User.id)).filter(
        User.role.in_(["personne_physique", "personne_morale"]),
        User.profile_tag.isnot(None)
    ).scalar() or 0
    
    total_projects = db.query(func.count(Project.id)).scalar() or 0
    total_collaborations = db.query(func.count(Project.id)).filter(
        func.coalesce(cast(Project.collaborators, String), "[]") != "[]"
    ).count()
    
    # Recent growth (last 30 days)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    new_users_month = db.query(func.count(User.id)).filter(
        User.created_at >= thirty_days_ago,
        User.role.in_(["personne_physique", "personne_morale"])
    ).scalar() or 0
    
    new_projects_month = db.query(func.count(Project.id)).filter(
        Project.created_at >= thirty_days_ago
    ).scalar() or 0
    
    # Engagement metrics
    total_posts = db.query(func.count(Post.id)).filter(Post.is_active == True).scalar() or 0
    total_interactions = (
        db.query(func.count(Like.id)).scalar() or 0 +
        db.query(func.count(Comment.id)).filter(Comment.is_active == True).scalar() or 0
    )
    
    # By profile tag
    by_profile = db.query(User.profile_tag, func.count(User.id)).filter(
        User.profile_tag.isnot(None)
    ).group_by(User.profile_tag).all()
    profile_distribution = {(p[0] or "other"): p[1] for p in by_profile}
    
    # By collaboration type
    collab_types = db.query(Project.collaboration_type, func.count(Project.id)).group_by(
        Project.collaboration_type
    ).all()
    collab_distribution = {(c[0] or "local"): c[1] for c in collab_types}
    
    # Top countries
    top_countries = db.query(User.country, func.count(User.id)).filter(
        User.country.isnot(None),
        User.role.in_(["personne_physique", "personne_morale"])
    ).group_by(User.country).order_by(func.count(User.id).desc()).limit(10).all()
    
    top_sectors = db.query(User.sector, func.count(User.id)).filter(
        User.sector.isnot(None)
    ).group_by(User.sector).order_by(func.count(User.id).desc()).limit(10).all()
    
    return {
        "dashboard": {
            "platform": {
                "total_creators": total_creators,
                "total_projects": total_projects,
                "active_collaborations": total_collaborations,
                "total_interactions": total_interactions,
                "total_posts": total_posts
            },
            "growth_month": {
                "new_users": new_users_month,
                "new_projects": new_projects_month,
                "growth_rate_users": round((new_users_month / max(total_creators - new_users_month, 1)) * 100, 1) if total_creators > 0 else 0
            },
            "distribution": {
                "by_profile_tag": profile_distribution,
                "by_collaboration_type": collab_distribution
            },
            "top": {
                "countries": [{"country": c[0], "creators": c[1], "subregion": get_subregion_from_country(c[0])} for c in top_countries],
                "sectors": [{"sector": s[0], "creators": s[1]} for s in top_sectors]
            },
            "generated_at": datetime.utcnow().isoformat()
        }
    }


# ============ ENDPOINT 2: DEEP DIVE BY COUNTRY ============

@premium_stats_router.get("/drill-down/country/{country}")
async def get_country_deep_dive(
    country: str,
    user = Depends(require_paid_partner),
    db: Session = Depends(get_db)
):
    """
    Deep dive analysis for a specific country
    Includes demographics, sectors, engagement, and top performers
    """
    
    users_query = db.query(User).filter(
        User.country == country,
        User.role.in_(["personne_physique", "personne_morale"])
    )
    
    total_creators = users_query.count()
    
    # Demographics
    gender_dist = users_query.with_entities(
        User.gender, func.count(User.id)
    ).group_by(User.gender).all()
    by_gender = {(g[0] or "other"): g[1] for g in gender_dist}
    
    profile_dist = users_query.with_entities(
        User.profile_tag, func.count(User.id)
    ).group_by(User.profile_tag).all()
    by_profile = {(p[0] or "other"): p[1] for p in profile_dist}
    
    # By city
    by_city = users_query.with_entities(
        User.city, func.count(User.id)
    ).filter(User.city.isnot(None)).group_by(User.city).order_by(
        func.count(User.id).desc()
    ).limit(15).all()
    
    # By sector - with engagement
    sector_data = []
    sectors = users_query.with_entities(
        User.sector
    ).filter(User.sector.isnot(None)).distinct().all()
    
    for sector_row in sectors:
        sector = sector_row[0]
        sector_users = users_query.filter(User.sector == sector)
        count = sector_users.count()
        
        # Calculate engagement for this sector
        sector_ids = [u.id for u in sector_users]
        engagement = 0
        for uid in sector_ids:
            engagement += calculate_engagement_score(uid, db)
        
        sector_data.append({
            "sector": sector,
            "creators": count,
            "avg_engagement": round(engagement / count, 1) if count > 0 else 0
        })
    
    sector_data.sort(key=lambda x: x["creators"], reverse=True)
    
    # Projects & Collaborations
    projects_query = db.query(Project).join(User, Project.creator_id == User.id).filter(
        User.country == country
    )
    
    total_projects = projects_query.count()
    local_projects = projects_query.filter(Project.collaboration_type == "local").count()
    intra_projects = projects_query.filter(Project.collaboration_type == "intra_african").count()
    
    active_collaborations = projects_query.filter(
        func.coalesce(cast(Project.collaborators, String), "[]") != "[]"
    ).count()
    
    # Engagement metrics
    total_posts = db.query(func.count(Post.id)).join(User, Post.author_id == User.id).filter(
        User.country == country,
        Post.is_active == True
    ).scalar() or 0
    
    total_messages = db.query(func.count(Message.id)).join(User, Message.receiver_id == User.id).filter(
        User.country == country
    ).scalar() or 0
    
    total_views = db.query(func.count(VisitorView.id)).join(User, VisitorView.artist_id == User.id).filter(
        User.country == country
    ).scalar() or 0
    
    # Top performers (by engagement score)
    top_performers = []
    for user_rec in users_query.limit(100):
        engagement = calculate_engagement_score(user_rec.id, db)
        if engagement > 0:
            top_performers.append({
                "id": user_rec.id,
                "name": f"{user_rec.first_name} {user_rec.last_name}",
                "sector": user_rec.sector,
                "domain": user_rec.domain,
                "city": user_rec.city,
                "engagement_score": engagement,
                "profile_tag": user_rec.profile_tag
            })
    
    top_performers.sort(key=lambda x: x["engagement_score"], reverse=True)
    top_performers = top_performers[:20]
    
    return {
        "country": country,
        "subregion": get_subregion_from_country(country),
        "overview": {
            "total_creators": total_creators,
            "total_projects": total_projects,
            "active_collaborations": active_collaborations
        },
        "demographics": {
            "by_gender": by_gender,
            "by_profile_tag": by_profile,
            "by_city": [{"city": c[0], "creators": c[1]} for c in by_city]
        },
        "sectors": sector_data,
        "collaboration": {
            "local_projects": local_projects,
            "intra_african_projects": intra_projects,
            "collaboration_rate": round((active_collaborations / max(total_projects, 1)) * 100, 1) if total_projects > 0 else 0
        },
        "engagement": {
            "total_posts": total_posts,
            "total_messages": total_messages,
            "total_views": total_views,
            "engagement_per_creator": round(total_views / max(total_creators, 1), 1) if total_creators > 0 else 0
        },
        "top_performers": top_performers,
        "generated_at": datetime.utcnow().isoformat()
    }


# ============ ENDPOINT 3: SECTOR ANALYSIS ============

@premium_stats_router.get("/drill-down/sector/{sector}")
async def get_sector_deep_dive(
    sector: str,
    country: Optional[str] = Query(None),
    user = Depends(require_paid_partner),
    db: Session = Depends(get_db)
):
    """
    Deep dive analysis for a specific sector
    Optional: filter by country
    """
    
    query = db.query(User).filter(
        User.sector == sector,
        User.role.in_(["personne_physique", "personne_morale"])
    )
    
    if country:
        query = query.filter(User.country == country)
    
    total_creators = query.count()
    
    # Geographic distribution
    geo_dist = query.with_entities(
        User.country, func.count(User.id)
    ).group_by(User.country).order_by(func.count(User.id).desc()).all()
    
    # Domains within sector
    domain_dist = query.with_entities(
        User.domain, func.count(User.id)
    ).filter(User.domain.isnot(None)).group_by(User.domain).order_by(
        func.count(User.id).desc()
    ).all()
    
    # Gender in sector
    gender_dist = query.with_entities(
        User.gender, func.count(User.id)
    ).group_by(User.gender).all()
    
    # Top performers in sector
    top_performers = []
    for user_rec in query.limit(100):
        engagement = calculate_engagement_score(user_rec.id, db)
        if engagement > 0:
            top_performers.append({
                "id": user_rec.id,
                "name": f"{user_rec.first_name} {user_rec.last_name}",
                "country": user_rec.country,
                "domain": user_rec.domain,
                "engagement_score": engagement
            })
    
    top_performers.sort(key=lambda x: x["engagement_score"], reverse=True)
    top_performers = top_performers[:15]
    
    # Projects in sector
    projects = db.query(func.count(Project.id)).join(User, Project.creator_id == User.id).filter(
        User.sector == sector
    )
    if country:
        projects = projects.filter(User.country == country)
    total_projects = projects.scalar() or 0
    
    return {
        "sector": sector,
        "filters": {
            "country": country or "All"
        },
        "overview": {
            "total_creators": total_creators,
            "total_projects": total_projects
        },
        "geography": [{"country": g[0], "creators": g[1]} for g in geo_dist],
        "domains": [{"domain": d[0], "creators": d[1]} for d in domain_dist],
        "gender_distribution": {(g[0] or "other"): g[1] for g in gender_dist},
        "top_performers": top_performers,
        "generated_at": datetime.utcnow().isoformat()
    }


# ============ ENDPOINT 4: COLLABORATION INSIGHTS ============

@premium_stats_router.get("/collaboration/insights")
async def get_collaboration_insights(
    country: Optional[str] = Query(None),
    sector: Optional[str] = Query(None),
    user = Depends(require_paid_partner),
    db: Session = Depends(get_db)
):
    """
    Detailed collaboration analytics
    Shows collaboration rates, success metrics, and trends
    """
    
    query = db.query(Project)
    
    if country:
        query = query.join(User, Project.creator_id == User.id).filter(User.country == country)
    
    if sector:
        query = query.join(User, Project.creator_id == User.id).filter(User.sector == sector)
    
    total_projects = query.count()
    
    # By type
    by_type = query.with_entities(
        Project.collaboration_type, func.count(Project.id)
    ).group_by(Project.collaboration_type).all()
    
    # With collaborators
    with_collabs = query.filter(
        func.coalesce(cast(Project.collaborators, String), "[]") != "[]"
    ).count()
    
    # By status
    by_status = query.with_entities(
        Project.status, func.count(Project.id)
    ).group_by(Project.status).all()
    
    # Average collaborators per project
    collab_counts = []
    for proj in query.all():
        collabs = proj.collaborators if proj.collaborators else []
        if isinstance(collabs, str):
            try:
                collabs = json.loads(collabs)
            except:
                collabs = []
        collab_counts.append(len(collabs) if isinstance(collabs, list) else 0)
    
    avg_collabs = round(sum(collab_counts) / max(len(collab_counts), 1), 1) if collab_counts else 0
    
    return {
        "filters": {
            "country": country or "All",
            "sector": sector or "All"
        },
        "overview": {
            "total_projects": total_projects,
            "with_active_collaborators": with_collabs,
            "collaboration_rate": round((with_collabs / max(total_projects, 1)) * 100, 1) if total_projects > 0 else 0,
            "avg_collaborators_per_project": avg_collabs
        },
        "by_type": {t[0] or "local": t[1] for t in by_type},
        "by_status": {s[0] or "open": s[1] for s in by_status},
        "generated_at": datetime.utcnow().isoformat()
    }


# ============ ENDPOINT 5: TIME SERIES ============

@premium_stats_router.get("/timeline/monthly")
async def get_monthly_timeline(
    months: int = Query(12, ge=1, le=36),
    country: Optional[str] = Query(None),
    sector: Optional[str] = Query(None),
    user = Depends(require_paid_partner),
    db: Session = Depends(get_db)
):
    """
    Monthly trends over specified period
    """
    
    timeline = []
    now = datetime.utcnow()
    
    for i in range(months - 1, -1, -1):
        period_end = now - timedelta(days=i * 30)
        period_start = period_end - timedelta(days=30)
        
        month_str = period_start.strftime("%B %Y")
        
        # New creators
        users_query = db.query(func.count(User.id)).filter(
            User.created_at >= period_start,
            User.created_at < period_end,
            User.role.in_(["personne_physique", "personne_morale"])
        )
        
        if country:
            users_query = users_query.filter(User.country == country)
        if sector:
            users_query = users_query.filter(User.sector == sector)
        
        new_creators = users_query.scalar() or 0
        
        # New projects
        projects_query = db.query(func.count(Project.id)).filter(
            Project.created_at >= period_start,
            Project.created_at < period_end
        )
        
        if country:
            projects_query = projects_query.join(User, Project.creator_id == User.id).filter(User.country == country)
        if sector:
            projects_query = projects_query.join(User, Project.creator_id == User.id).filter(User.sector == sector)
        
        new_projects = projects_query.scalar() or 0
        
        # Interactions
        interactions = db.query(func.count(Message.id)).filter(
            Message.created_at >= period_start,
            Message.created_at < period_end
        ).scalar() or 0
        
        timeline.append({
            "period": month_str,
            "new_creators": new_creators,
            "new_projects": new_projects,
            "interactions": interactions
        })
    
    return {
        "timeline": timeline,
        "filters": {
            "months": months,
            "country": country or "All",
            "sector": sector or "All"
        },
        "generated_at": datetime.utcnow().isoformat()
    }
