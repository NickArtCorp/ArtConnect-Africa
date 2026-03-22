from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, Form, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any, Literal
import uuid
from datetime import datetime, timezone
import hashlib
import secrets
import shutil

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Create uploads directory
UPLOADS_DIR = ROOT_DIR / 'uploads'
UPLOADS_DIR.mkdir(exist_ok=True)
(UPLOADS_DIR / 'documents').mkdir(exist_ok=True)
(UPLOADS_DIR / 'images').mkdir(exist_ok=True)
(UPLOADS_DIR / 'posts').mkdir(exist_ok=True)
(UPLOADS_DIR / 'avatars').mkdir(exist_ok=True)

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI(title="Art Connect Africa API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer(auto_error=False)
active_tokens = {}

# ============== CONSTANTS ==============

ROLES = ['admin', 'artist', 'institution']

AFRICAN_COUNTRIES = [
    {"name": "Algeria", "name_fr": "Algérie", "subregion": "North Africa", "subregion_fr": "Afrique du Nord"},
    {"name": "Egypt", "name_fr": "Égypte", "subregion": "North Africa", "subregion_fr": "Afrique du Nord"},
    {"name": "Libya", "name_fr": "Libye", "subregion": "North Africa", "subregion_fr": "Afrique du Nord"},
    {"name": "Morocco", "name_fr": "Maroc", "subregion": "North Africa", "subregion_fr": "Afrique du Nord"},
    {"name": "Tunisia", "name_fr": "Tunisie", "subregion": "North Africa", "subregion_fr": "Afrique du Nord"},
    {"name": "Western Sahara", "name_fr": "Sahara Occidental", "subregion": "North Africa", "subregion_fr": "Afrique du Nord"},
    {"name": "Sudan", "name_fr": "Soudan", "subregion": "North Africa", "subregion_fr": "Afrique du Nord"},
    {"name": "Benin", "name_fr": "Bénin", "subregion": "West Africa", "subregion_fr": "Afrique de l'Ouest"},
    {"name": "Burkina Faso", "name_fr": "Burkina Faso", "subregion": "West Africa", "subregion_fr": "Afrique de l'Ouest"},
    {"name": "Cape Verde", "name_fr": "Cap-Vert", "subregion": "West Africa", "subregion_fr": "Afrique de l'Ouest"},
    {"name": "Côte d'Ivoire", "name_fr": "Côte d'Ivoire", "subregion": "West Africa", "subregion_fr": "Afrique de l'Ouest"},
    {"name": "Gambia", "name_fr": "Gambie", "subregion": "West Africa", "subregion_fr": "Afrique de l'Ouest"},
    {"name": "Ghana", "name_fr": "Ghana", "subregion": "West Africa", "subregion_fr": "Afrique de l'Ouest"},
    {"name": "Guinea", "name_fr": "Guinée", "subregion": "West Africa", "subregion_fr": "Afrique de l'Ouest"},
    {"name": "Guinea-Bissau", "name_fr": "Guinée-Bissau", "subregion": "West Africa", "subregion_fr": "Afrique de l'Ouest"},
    {"name": "Liberia", "name_fr": "Libéria", "subregion": "West Africa", "subregion_fr": "Afrique de l'Ouest"},
    {"name": "Mali", "name_fr": "Mali", "subregion": "West Africa", "subregion_fr": "Afrique de l'Ouest"},
    {"name": "Mauritania", "name_fr": "Mauritanie", "subregion": "West Africa", "subregion_fr": "Afrique de l'Ouest"},
    {"name": "Niger", "name_fr": "Niger", "subregion": "West Africa", "subregion_fr": "Afrique de l'Ouest"},
    {"name": "Nigeria", "name_fr": "Nigéria", "subregion": "West Africa", "subregion_fr": "Afrique de l'Ouest"},
    {"name": "Senegal", "name_fr": "Sénégal", "subregion": "West Africa", "subregion_fr": "Afrique de l'Ouest"},
    {"name": "Sierra Leone", "name_fr": "Sierra Leone", "subregion": "West Africa", "subregion_fr": "Afrique de l'Ouest"},
    {"name": "Togo", "name_fr": "Togo", "subregion": "West Africa", "subregion_fr": "Afrique de l'Ouest"},
    {"name": "Angola", "name_fr": "Angola", "subregion": "Central Africa", "subregion_fr": "Afrique Centrale"},
    {"name": "Cameroon", "name_fr": "Cameroun", "subregion": "Central Africa", "subregion_fr": "Afrique Centrale"},
    {"name": "Central African Republic", "name_fr": "République Centrafricaine", "subregion": "Central Africa", "subregion_fr": "Afrique Centrale"},
    {"name": "Chad", "name_fr": "Tchad", "subregion": "Central Africa", "subregion_fr": "Afrique Centrale"},
    {"name": "Democratic Republic of the Congo", "name_fr": "République Démocratique du Congo", "subregion": "Central Africa", "subregion_fr": "Afrique Centrale"},
    {"name": "Republic of the Congo", "name_fr": "République du Congo", "subregion": "Central Africa", "subregion_fr": "Afrique Centrale"},
    {"name": "Equatorial Guinea", "name_fr": "Guinée Équatoriale", "subregion": "Central Africa", "subregion_fr": "Afrique Centrale"},
    {"name": "Gabon", "name_fr": "Gabon", "subregion": "Central Africa", "subregion_fr": "Afrique Centrale"},
    {"name": "São Tomé and Príncipe", "name_fr": "São Tomé-et-Príncipe", "subregion": "Central Africa", "subregion_fr": "Afrique Centrale"},
    {"name": "Burundi", "name_fr": "Burundi", "subregion": "East Africa", "subregion_fr": "Afrique de l'Est"},
    {"name": "Comoros", "name_fr": "Comores", "subregion": "East Africa", "subregion_fr": "Afrique de l'Est"},
    {"name": "Djibouti", "name_fr": "Djibouti", "subregion": "East Africa", "subregion_fr": "Afrique de l'Est"},
    {"name": "Eritrea", "name_fr": "Érythrée", "subregion": "East Africa", "subregion_fr": "Afrique de l'Est"},
    {"name": "Ethiopia", "name_fr": "Éthiopie", "subregion": "East Africa", "subregion_fr": "Afrique de l'Est"},
    {"name": "Kenya", "name_fr": "Kenya", "subregion": "East Africa", "subregion_fr": "Afrique de l'Est"},
    {"name": "Madagascar", "name_fr": "Madagascar", "subregion": "East Africa", "subregion_fr": "Afrique de l'Est"},
    {"name": "Malawi", "name_fr": "Malawi", "subregion": "East Africa", "subregion_fr": "Afrique de l'Est"},
    {"name": "Mauritius", "name_fr": "Maurice", "subregion": "East Africa", "subregion_fr": "Afrique de l'Est"},
    {"name": "Mozambique", "name_fr": "Mozambique", "subregion": "East Africa", "subregion_fr": "Afrique de l'Est"},
    {"name": "Rwanda", "name_fr": "Rwanda", "subregion": "East Africa", "subregion_fr": "Afrique de l'Est"},
    {"name": "Seychelles", "name_fr": "Seychelles", "subregion": "East Africa", "subregion_fr": "Afrique de l'Est"},
    {"name": "Somalia", "name_fr": "Somalie", "subregion": "East Africa", "subregion_fr": "Afrique de l'Est"},
    {"name": "South Sudan", "name_fr": "Soudan du Sud", "subregion": "East Africa", "subregion_fr": "Afrique de l'Est"},
    {"name": "Tanzania", "name_fr": "Tanzanie", "subregion": "East Africa", "subregion_fr": "Afrique de l'Est"},
    {"name": "Uganda", "name_fr": "Ouganda", "subregion": "East Africa", "subregion_fr": "Afrique de l'Est"},
    {"name": "Zambia", "name_fr": "Zambie", "subregion": "East Africa", "subregion_fr": "Afrique de l'Est"},
    {"name": "Zimbabwe", "name_fr": "Zimbabwe", "subregion": "East Africa", "subregion_fr": "Afrique de l'Est"},
    {"name": "Botswana", "name_fr": "Botswana", "subregion": "Southern Africa", "subregion_fr": "Afrique Australe"},
    {"name": "Eswatini", "name_fr": "Eswatini", "subregion": "Southern Africa", "subregion_fr": "Afrique Australe"},
    {"name": "Lesotho", "name_fr": "Lesotho", "subregion": "Southern Africa", "subregion_fr": "Afrique Australe"},
    {"name": "Namibia", "name_fr": "Namibie", "subregion": "Southern Africa", "subregion_fr": "Afrique Australe"},
    {"name": "South Africa", "name_fr": "Afrique du Sud", "subregion": "Southern Africa", "subregion_fr": "Afrique Australe"},
]

SUBREGIONS = [
    {"name": "North Africa", "name_fr": "Afrique du Nord"},
    {"name": "West Africa", "name_fr": "Afrique de l'Ouest"},
    {"name": "Central Africa", "name_fr": "Afrique Centrale"},
    {"name": "East Africa", "name_fr": "Afrique de l'Est"},
    {"name": "Southern Africa", "name_fr": "Afrique Australe"},
]

ARTISTIC_SECTORS = [
    {"name": "Visual Arts", "name_fr": "Arts Visuels"},
    {"name": "Performing Arts", "name_fr": "Arts du Spectacle"},
    {"name": "Music", "name_fr": "Musique"},
    {"name": "Literature", "name_fr": "Littérature"},
    {"name": "Cinema & Audiovisual", "name_fr": "Cinéma & Audiovisuel"},
    {"name": "Fashion & Design", "name_fr": "Mode & Design"},
    {"name": "Craftsmanship", "name_fr": "Artisanat"},
    {"name": "Digital Arts", "name_fr": "Arts Numériques"},
    {"name": "Cultural Heritage", "name_fr": "Patrimoine Culturel"},
]

ARTISTIC_DOMAINS = {
    "Visual Arts": [
        {"name": "Painting", "name_fr": "Peinture"},
        {"name": "Sculpture", "name_fr": "Sculpture"},
        {"name": "Photography", "name_fr": "Photographie"},
        {"name": "Drawing", "name_fr": "Dessin"},
        {"name": "Printmaking", "name_fr": "Gravure"},
        {"name": "Installation Art", "name_fr": "Art d'Installation"},
        {"name": "Street Art", "name_fr": "Art Urbain"},
        {"name": "Mixed Media", "name_fr": "Techniques Mixtes"},
    ],
    "Performing Arts": [
        {"name": "Theater", "name_fr": "Théâtre"},
        {"name": "Dance", "name_fr": "Danse"},
        {"name": "Circus Arts", "name_fr": "Arts du Cirque"},
        {"name": "Puppetry", "name_fr": "Marionnettes"},
        {"name": "Storytelling", "name_fr": "Conte"},
        {"name": "Performance Art", "name_fr": "Art Performance"},
    ],
    "Music": [
        {"name": "Traditional Music", "name_fr": "Musique Traditionnelle"},
        {"name": "Afrobeat", "name_fr": "Afrobeat"},
        {"name": "Hip-Hop/Rap", "name_fr": "Hip-Hop/Rap"},
        {"name": "Jazz", "name_fr": "Jazz"},
        {"name": "Gospel", "name_fr": "Gospel"},
        {"name": "Reggae", "name_fr": "Reggae"},
        {"name": "R&B/Soul", "name_fr": "R&B/Soul"},
        {"name": "Electronic", "name_fr": "Électronique"},
        {"name": "Classical", "name_fr": "Classique"},
        {"name": "Music Production", "name_fr": "Production Musicale"},
    ],
    "Literature": [
        {"name": "Poetry", "name_fr": "Poésie"},
        {"name": "Novel Writing", "name_fr": "Roman"},
        {"name": "Short Stories", "name_fr": "Nouvelles"},
        {"name": "Playwriting", "name_fr": "Dramaturgie"},
        {"name": "Journalism", "name_fr": "Journalisme"},
        {"name": "Essays", "name_fr": "Essais"},
        {"name": "Children's Literature", "name_fr": "Littérature Jeunesse"},
    ],
    "Cinema & Audiovisual": [
        {"name": "Film Direction", "name_fr": "Réalisation"},
        {"name": "Screenwriting", "name_fr": "Scénario"},
        {"name": "Documentary", "name_fr": "Documentaire"},
        {"name": "Animation", "name_fr": "Animation"},
        {"name": "Cinematography", "name_fr": "Direction Photo"},
        {"name": "Video Production", "name_fr": "Production Vidéo"},
        {"name": "Acting", "name_fr": "Jeu d'Acteur"},
    ],
    "Fashion & Design": [
        {"name": "Fashion Design", "name_fr": "Stylisme"},
        {"name": "Textile Design", "name_fr": "Design Textile"},
        {"name": "Jewelry Design", "name_fr": "Joaillerie"},
        {"name": "Graphic Design", "name_fr": "Design Graphique"},
        {"name": "Interior Design", "name_fr": "Design d'Intérieur"},
        {"name": "Product Design", "name_fr": "Design Produit"},
    ],
    "Craftsmanship": [
        {"name": "Pottery/Ceramics", "name_fr": "Poterie/Céramique"},
        {"name": "Weaving", "name_fr": "Tissage"},
        {"name": "Woodworking", "name_fr": "Ébénisterie"},
        {"name": "Metalwork", "name_fr": "Ferronnerie"},
        {"name": "Leatherwork", "name_fr": "Maroquinerie"},
        {"name": "Basketry", "name_fr": "Vannerie"},
        {"name": "Beadwork", "name_fr": "Perlage"},
    ],
    "Digital Arts": [
        {"name": "Digital Illustration", "name_fr": "Illustration Numérique"},
        {"name": "3D Art", "name_fr": "Art 3D"},
        {"name": "NFT Art", "name_fr": "Art NFT"},
        {"name": "Game Design", "name_fr": "Game Design"},
        {"name": "Web Design", "name_fr": "Web Design"},
        {"name": "Motion Graphics", "name_fr": "Motion Design"},
        {"name": "VR/AR Art", "name_fr": "Art VR/AR"},
    ],
    "Cultural Heritage": [
        {"name": "Museum Curation", "name_fr": "Conservation Muséale"},
        {"name": "Restoration", "name_fr": "Restauration"},
        {"name": "Cultural Research", "name_fr": "Recherche Culturelle"},
        {"name": "Traditional Knowledge", "name_fr": "Savoirs Traditionnels"},
        {"name": "Heritage Tourism", "name_fr": "Tourisme Patrimonial"},
    ],
}

GENDERS = [
    {"name": "Male", "name_fr": "Homme"},
    {"name": "Female", "name_fr": "Femme"},
    {"name": "Non-binary", "name_fr": "Non-binaire"},
    {"name": "Prefer not to say", "name_fr": "Préfère ne pas préciser"},
]

# ============== HELPER FUNCTIONS ==============

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def generate_token() -> str:
    return secrets.token_urlsafe(32)

def sanitize_user(user: dict) -> dict:
    """Remove sensitive fields from user data"""
    safe_fields = ['id', 'first_name', 'last_name', 'country', 'subregion', 'gender', 
                   'sector', 'domain', 'year_started', 'bio', 'additional_info', 
                   'website', 'avatar', 'role', 'is_featured', 'is_verified', 'created_at']
    return {k: v for k, v in user.items() if k in safe_fields}

# ============== AUTH DEPENDENCIES ==============

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = credentials.credentials
    if token not in active_tokens:
        raise HTTPException(status_code=401, detail="Invalid token")
    user_id = active_tokens[token]
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

async def get_optional_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        return None
    token = credentials.credentials
    if token not in active_tokens:
        return None
    user_id = active_tokens[token]
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
    return user

async def require_artist_or_admin(user = Depends(get_current_user)):
    """Only artists and admins can create content"""
    if user.get("role") not in ["artist", "admin"]:
        raise HTTPException(status_code=403, detail="Only artists can perform this action")
    return user

async def require_institution_or_admin(user = Depends(get_current_user)):
    """Only institutions and admins can access detailed stats"""
    if user.get("role") not in ["institution", "admin"]:
        raise HTTPException(status_code=403, detail="Institutional access required")
    return user

async def require_admin(user = Depends(get_current_user)):
    """Admin only actions"""
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

# ============== PYDANTIC MODELS ==============

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    country: str
    subregion: str
    gender: str
    sector: str
    domain: str
    year_started: int
    bio: Optional[str] = ""
    additional_info: Optional[str] = ""
    website: Optional[str] = ""
    role: Literal['artist', 'institution'] = 'artist'
    organization_name: Optional[str] = None  # For institutions

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    country: Optional[str] = None
    subregion: Optional[str] = None
    gender: Optional[str] = None
    sector: Optional[str] = None
    domain: Optional[str] = None
    year_started: Optional[int] = None
    bio: Optional[str] = None
    additional_info: Optional[str] = None
    website: Optional[str] = None
    avatar: Optional[str] = None

class PostCreate(BaseModel):
    content_type: Literal['text', 'image', 'video']
    text_content: Optional[str] = None
    media_url: Optional[str] = None

class CommentCreate(BaseModel):
    content: str

class MessageCreate(BaseModel):
    receiver_id: str
    content: str

class ProjectCreate(BaseModel):
    title: str
    description: str
    sector: str
    looking_for: List[str]
    status: str = "open"

# ============== REFERENCE DATA ROUTES ==============

@api_router.get("/reference/countries")
async def get_countries():
    return AFRICAN_COUNTRIES

@api_router.get("/reference/subregions")
async def get_subregions():
    return SUBREGIONS

@api_router.get("/reference/sectors")
async def get_sectors():
    return ARTISTIC_SECTORS

@api_router.get("/reference/domains")
async def get_domains(sector: Optional[str] = None):
    if sector and sector in ARTISTIC_DOMAINS:
        return ARTISTIC_DOMAINS[sector]
    return ARTISTIC_DOMAINS

@api_router.get("/reference/genders")
async def get_genders():
    return GENDERS

# ============== AUTH ROUTES ==============

@api_router.post("/auth/register")
async def register(user_data: UserCreate):
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "email": user_data.email,
        "password": hash_password(user_data.password),
        "first_name": user_data.first_name,
        "last_name": user_data.last_name,
        "country": user_data.country,
        "subregion": user_data.subregion,
        "gender": user_data.gender,
        "sector": user_data.sector,
        "domain": user_data.domain,
        "year_started": user_data.year_started,
        "bio": user_data.bio or "",
        "additional_info": user_data.additional_info or "",
        "website": user_data.website or "",
        "avatar": f"https://api.dicebear.com/7.x/initials/svg?seed={user_data.first_name}%20{user_data.last_name}",
        "portfolio": {"documents": [], "images": [], "videos": []},
        "created_at": datetime.now(timezone.utc).isoformat(),
        "role": user_data.role,
        "organization_name": user_data.organization_name if user_data.role == 'institution' else None,
        "is_verified": False,
        "is_featured": False
    }
    
    await db.users.insert_one(user_doc)
    
    token = generate_token()
    active_tokens[token] = user_id
    
    user_doc.pop("password")
    user_doc.pop("_id", None)
    
    return {"token": token, "user": user_doc}

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email})
    if not user or user["password"] != hash_password(credentials.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = generate_token()
    active_tokens[token] = user["id"]
    
    user.pop("password")
    user.pop("_id", None)
    
    return {"token": token, "user": user}

@api_router.post("/auth/logout")
async def logout(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if credentials and credentials.credentials in active_tokens:
        del active_tokens[credentials.credentials]
    return {"message": "Logged out"}

@api_router.get("/auth/me")
async def get_me(user = Depends(get_current_user)):
    return user

# ============== ARTIST ROUTES ==============

@api_router.get("/artists")
async def get_artists(
    search: Optional[str] = None,
    country: Optional[str] = None,
    subregion: Optional[str] = None,
    sector: Optional[str] = None,
    domain: Optional[str] = None,
    gender: Optional[str] = None,
    limit: int = 50,
    skip: int = 0
):
    # Only show artists, not institutions or admins
    query = {"role": "artist"}
    
    if search:
        query["$or"] = [
            {"first_name": {"$regex": search, "$options": "i"}},
            {"last_name": {"$regex": search, "$options": "i"}},
            {"bio": {"$regex": search, "$options": "i"}}
        ]
    if country:
        query["country"] = country
    if subregion:
        query["subregion"] = subregion
    if sector:
        query["sector"] = sector
    if domain:
        query["domain"] = domain
    if gender:
        query["gender"] = gender
    
    artists = await db.users.find(query, {"_id": 0, "password": 0, "email": 0}).skip(skip).limit(limit).to_list(limit)
    total = await db.users.count_documents(query)
    
    return {"artists": artists, "total": total}

@api_router.get("/artists/featured")
async def get_featured_artists(limit: int = 6):
    artists = await db.users.find(
        {"is_featured": True, "role": "artist"}, 
        {"_id": 0, "password": 0, "email": 0}
    ).limit(limit).to_list(limit)
    return artists

@api_router.get("/artists/{artist_id}")
async def get_artist(artist_id: str):
    artist = await db.users.find_one({"id": artist_id, "role": "artist"}, {"_id": 0, "password": 0, "email": 0})
    if not artist:
        raise HTTPException(status_code=404, detail="Artist not found")
    return artist

@api_router.put("/artists/me")
async def update_profile(update_data: UserUpdate, user = Depends(get_current_user)):
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    if update_dict:
        await db.users.update_one({"id": user["id"]}, {"$set": update_dict})
    
    updated_user = await db.users.find_one({"id": user["id"]}, {"_id": 0, "password": 0})
    return updated_user

@api_router.post("/artists/me/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    user = Depends(get_current_user)
):
    """Upload profile avatar image"""
    allowed_types = [".jpg", ".jpeg", ".png", ".gif", ".webp"]
    file_ext = Path(file.filename).suffix.lower()
    
    if file_ext not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid image type. Allowed: jpg, jpeg, png, gif, webp")
    
    # Check file size (max 5MB)
    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Maximum 5MB")
    
    # Save file
    file_id = str(uuid.uuid4())
    file_path = UPLOADS_DIR / 'avatars' / f"{file_id}{file_ext}"
    
    with open(file_path, "wb") as buffer:
        buffer.write(contents)
    
    avatar_url = f"/uploads/avatars/{file_id}{file_ext}"
    
    # Update user avatar
    await db.users.update_one({"id": user["id"]}, {"$set": {"avatar": avatar_url}})
    
    updated_user = await db.users.find_one({"id": user["id"]}, {"_id": 0, "password": 0})
    return updated_user

# ============== FEED / POSTS ROUTES ==============

@api_router.post("/posts")
async def create_post(post_data: PostCreate, user = Depends(require_artist_or_admin)):
    """Create a new post - Artists and Admins only"""
    post_doc = {
        "id": str(uuid.uuid4()),
        "author_id": user["id"],
        "content_type": post_data.content_type,
        "text_content": post_data.text_content,
        "media_url": post_data.media_url,
        "likes_count": 0,
        "comments_count": 0,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "is_active": True
    }
    
    await db.posts.insert_one(post_doc)
    post_doc.pop("_id", None)
    
    # Add author info
    post_doc["author"] = sanitize_user(user)
    
    return post_doc

@api_router.post("/posts/upload")
async def upload_post_media(
    file: UploadFile = File(...),
    content_type: str = Form(...),
    text_content: str = Form(""),
    user = Depends(require_artist_or_admin)
):
    """Upload media and create post - Artists and Admins only"""
    allowed_image_types = [".jpg", ".jpeg", ".png", ".gif", ".webp"]
    allowed_video_types = [".mp4", ".mov", ".avi", ".webm"]
    
    file_ext = Path(file.filename).suffix.lower()
    
    if content_type == "image" and file_ext not in allowed_image_types:
        raise HTTPException(status_code=400, detail="Invalid image type")
    if content_type == "video" and file_ext not in allowed_video_types:
        raise HTTPException(status_code=400, detail="Invalid video type")
    
    # Save file
    file_id = str(uuid.uuid4())
    file_path = UPLOADS_DIR / 'posts' / f"{file_id}{file_ext}"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    media_url = f"/uploads/posts/{file_id}{file_ext}"
    
    # Create post
    post_doc = {
        "id": str(uuid.uuid4()),
        "author_id": user["id"],
        "content_type": content_type,
        "text_content": text_content,
        "media_url": media_url,
        "likes_count": 0,
        "comments_count": 0,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "is_active": True
    }
    
    await db.posts.insert_one(post_doc)
    post_doc.pop("_id", None)
    post_doc["author"] = sanitize_user(user)
    
    return post_doc

@api_router.get("/posts")
async def get_posts(
    limit: int = 20,
    before: Optional[str] = None,  # Cursor-based pagination
    author_id: Optional[str] = None,
    user = Depends(get_optional_user)
):
    """Get feed posts - All users can view"""
    query = {"is_active": True}
    
    if before:
        query["created_at"] = {"$lt": before}
    if author_id:
        query["author_id"] = author_id
    
    posts = await db.posts.find(query, {"_id": 0}).sort("created_at", -1).limit(limit).to_list(limit)
    
    # Enrich with author data and like status
    for post in posts:
        author = await db.users.find_one({"id": post["author_id"]}, {"_id": 0, "password": 0, "email": 0})
        post["author"] = author
        
        # Check if current user liked the post
        if user:
            like = await db.likes.find_one({"post_id": post["id"], "user_id": user["id"]})
            post["is_liked"] = like is not None
        else:
            post["is_liked"] = False
    
    return posts

@api_router.get("/posts/{post_id}")
async def get_post(post_id: str, user = Depends(get_optional_user)):
    """Get single post with details"""
    post = await db.posts.find_one({"id": post_id, "is_active": True}, {"_id": 0})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    author = await db.users.find_one({"id": post["author_id"]}, {"_id": 0, "password": 0, "email": 0})
    post["author"] = author
    
    if user:
        like = await db.likes.find_one({"post_id": post_id, "user_id": user["id"]})
        post["is_liked"] = like is not None
    else:
        post["is_liked"] = False
    
    return post

@api_router.delete("/posts/{post_id}")
async def delete_post(post_id: str, user = Depends(get_current_user)):
    """Delete a post - Owner or Admin only"""
    post = await db.posts.find_one({"id": post_id})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    if post["author_id"] != user["id"] and user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.posts.update_one({"id": post_id}, {"$set": {"is_active": False}})
    return {"message": "Post deleted"}

# ============== LIKES ROUTES ==============

@api_router.post("/posts/{post_id}/like")
async def toggle_like(post_id: str, user = Depends(require_artist_or_admin)):
    """Toggle like on a post - Artists and Admins only"""
    post = await db.posts.find_one({"id": post_id, "is_active": True})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    existing_like = await db.likes.find_one({"post_id": post_id, "user_id": user["id"]})
    
    if existing_like:
        # Unlike
        await db.likes.delete_one({"id": existing_like["id"]})
        await db.posts.update_one({"id": post_id}, {"$inc": {"likes_count": -1}})
        return {"liked": False, "likes_count": post["likes_count"] - 1}
    else:
        # Like
        like_doc = {
            "id": str(uuid.uuid4()),
            "post_id": post_id,
            "user_id": user["id"],
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.likes.insert_one(like_doc)
        await db.posts.update_one({"id": post_id}, {"$inc": {"likes_count": 1}})
        return {"liked": True, "likes_count": post["likes_count"] + 1}

# ============== COMMENTS ROUTES ==============

@api_router.post("/posts/{post_id}/comments")
async def create_comment(post_id: str, comment_data: CommentCreate, user = Depends(require_artist_or_admin)):
    """Create a comment - Artists and Admins only"""
    post = await db.posts.find_one({"id": post_id, "is_active": True})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    comment_doc = {
        "id": str(uuid.uuid4()),
        "post_id": post_id,
        "author_id": user["id"],
        "content": comment_data.content,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "is_active": True
    }
    
    await db.comments.insert_one(comment_doc)
    await db.posts.update_one({"id": post_id}, {"$inc": {"comments_count": 1}})
    
    comment_doc.pop("_id", None)
    comment_doc["author"] = sanitize_user(user)
    
    return comment_doc

@api_router.get("/posts/{post_id}/comments")
async def get_comments(post_id: str, limit: int = 50):
    """Get comments for a post - All users can view"""
    comments = await db.comments.find(
        {"post_id": post_id, "is_active": True}, 
        {"_id": 0}
    ).sort("created_at", 1).limit(limit).to_list(limit)
    
    for comment in comments:
        author = await db.users.find_one({"id": comment["author_id"]}, {"_id": 0, "password": 0, "email": 0})
        comment["author"] = author
    
    return comments

@api_router.delete("/comments/{comment_id}")
async def delete_comment(comment_id: str, user = Depends(get_current_user)):
    """Delete a comment - Owner or Admin only"""
    comment = await db.comments.find_one({"id": comment_id})
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    if comment["author_id"] != user["id"] and user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.comments.update_one({"id": comment_id}, {"$set": {"is_active": False}})
    await db.posts.update_one({"id": comment["post_id"]}, {"$inc": {"comments_count": -1}})
    
    return {"message": "Comment deleted"}

# ============== MESSAGES ROUTES ==============

@api_router.post("/messages")
async def send_message(message_data: MessageCreate, user = Depends(require_artist_or_admin)):
    """Send a message - Artists and Admins only (Institutions cannot message)"""
    receiver = await db.users.find_one({"id": message_data.receiver_id})
    if not receiver:
        raise HTTPException(status_code=404, detail="Recipient not found")
    
    if message_data.receiver_id == user["id"]:
        raise HTTPException(status_code=400, detail="Cannot send message to yourself")
    
    message_doc = {
        "id": str(uuid.uuid4()),
        "sender_id": user["id"],
        "receiver_id": message_data.receiver_id,
        "content": message_data.content,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "read": False
    }
    
    await db.messages.insert_one(message_doc)
    message_doc.pop("_id", None)
    
    return message_doc

@api_router.get("/messages/conversations")
async def get_conversations(user = Depends(get_current_user)):
    user_id = user["id"]
    
    pipeline = [
        {"$match": {"$or": [{"sender_id": user_id}, {"receiver_id": user_id}]}},
        {"$sort": {"created_at": -1}},
        {"$group": {
            "_id": {
                "$cond": [
                    {"$eq": ["$sender_id", user_id]},
                    "$receiver_id",
                    "$sender_id"
                ]
            },
            "last_message": {"$first": "$$ROOT"},
            "unread_count": {
                "$sum": {
                    "$cond": [
                        {"$and": [
                            {"$eq": ["$receiver_id", user_id]},
                            {"$eq": ["$read", False]}
                        ]},
                        1,
                        0
                    ]
                }
            }
        }}
    ]
    
    conversations_raw = await db.messages.aggregate(pipeline).to_list(100)
    
    conversations = []
    for conv in conversations_raw:
        other_user_id = conv["_id"]
        other_user = await db.users.find_one({"id": other_user_id}, {"_id": 0, "password": 0, "email": 0})
        if other_user:
            last_msg = conv["last_message"]
            last_msg.pop("_id", None)
            conversations.append({
                "user": other_user,
                "last_message": last_msg,
                "unread_count": conv["unread_count"]
            })
    
    conversations.sort(key=lambda x: x["last_message"]["created_at"] if x["last_message"] else "", reverse=True)
    
    return conversations

@api_router.get("/messages/{other_user_id}")
async def get_messages(other_user_id: str, user = Depends(get_current_user)):
    user_id = user["id"]
    
    await db.messages.update_many(
        {"sender_id": other_user_id, "receiver_id": user_id, "read": False},
        {"$set": {"read": True}}
    )
    
    messages = await db.messages.find(
        {"$or": [
            {"sender_id": user_id, "receiver_id": other_user_id},
            {"sender_id": other_user_id, "receiver_id": user_id}
        ]},
        {"_id": 0}
    ).sort("created_at", 1).to_list(500)
    
    return messages

# ============== PORTFOLIO ROUTES ==============

@api_router.post("/portfolio/upload")
async def upload_file(
    file: UploadFile = File(...),
    file_type: str = Form(...),
    title: str = Form(""),
    description: str = Form(""),
    user = Depends(require_artist_or_admin)
):
    allowed_doc_types = [".pdf", ".doc", ".docx"]
    allowed_img_types = [".jpg", ".jpeg", ".png", ".gif", ".webp"]
    
    file_ext = Path(file.filename).suffix.lower()
    
    if file_type == "document" and file_ext not in allowed_doc_types:
        raise HTTPException(status_code=400, detail="Invalid document type")
    if file_type == "image" and file_ext not in allowed_img_types:
        raise HTTPException(status_code=400, detail="Invalid image type")
    
    file_id = str(uuid.uuid4())
    folder = "documents" if file_type == "document" else "images"
    file_path = UPLOADS_DIR / folder / f"{file_id}{file_ext}"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    file_record = {
        "id": file_id,
        "filename": file.filename,
        "file_type": file_type,
        "file_ext": file_ext,
        "title": title or file.filename,
        "description": description,
        "url": f"/uploads/{folder}/{file_id}{file_ext}",
        "uploaded_at": datetime.now(timezone.utc).isoformat()
    }
    
    portfolio_key = f"portfolio.{file_type}s"
    await db.users.update_one(
        {"id": user["id"]},
        {"$push": {portfolio_key: file_record}}
    )
    
    return file_record

@api_router.post("/portfolio/video")
async def add_video_link(
    url: str = Form(...),
    title: str = Form(""),
    description: str = Form(""),
    user = Depends(require_artist_or_admin)
):
    video_record = {
        "id": str(uuid.uuid4()),
        "url": url,
        "title": title,
        "description": description,
        "added_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.update_one(
        {"id": user["id"]},
        {"$push": {"portfolio.videos": video_record}}
    )
    
    return video_record

@api_router.delete("/portfolio/{item_type}/{item_id}")
async def delete_portfolio_item(item_type: str, item_id: str, user = Depends(get_current_user)):
    if item_type not in ["documents", "images", "videos"]:
        raise HTTPException(status_code=400, detail="Invalid item type")
    
    await db.users.update_one(
        {"id": user["id"]},
        {"$pull": {f"portfolio.{item_type}": {"id": item_id}}}
    )
    
    return {"message": "Item deleted"}

# ============== PROJECTS ROUTES ==============

@api_router.post("/projects")
async def create_project(project_data: ProjectCreate, user = Depends(require_artist_or_admin)):
    project_doc = {
        "id": str(uuid.uuid4()),
        "creator_id": user["id"],
        "title": project_data.title,
        "description": project_data.description,
        "sector": project_data.sector,
        "looking_for": project_data.looking_for,
        "status": project_data.status,
        "collaborators": [],
        "applications": [],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.projects.insert_one(project_doc)
    project_doc.pop("_id", None)
    
    return project_doc

@api_router.get("/projects")
async def get_projects(
    sector: Optional[str] = None,
    status: str = "open",
    limit: int = 20,
    skip: int = 0
):
    query = {"status": status}
    if sector:
        query["sector"] = sector
    
    projects = await db.projects.find(query, {"_id": 0}).skip(skip).limit(limit).to_list(limit)
    
    for project in projects:
        creator = await db.users.find_one({"id": project["creator_id"]}, {"_id": 0, "password": 0, "email": 0})
        project["creator"] = creator
    
    return projects

@api_router.post("/projects/{project_id}/apply")
async def apply_to_project(project_id: str, message: str = "", user = Depends(require_artist_or_admin)):
    project = await db.projects.find_one({"id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if project["creator_id"] == user["id"]:
        raise HTTPException(status_code=400, detail="Cannot apply to your own project")
    
    application = {
        "user_id": user["id"],
        "message": message,
        "applied_at": datetime.now(timezone.utc).isoformat(),
        "status": "pending"
    }
    
    await db.projects.update_one(
        {"id": project_id},
        {"$push": {"applications": application}}
    )
    
    return {"message": "Application submitted"}

# ============== STATISTICS ROUTES ==============

@api_router.get("/statistics/overview")
async def get_statistics_overview(user = Depends(get_optional_user)):
    """Public overview statistics"""
    total_artists = await db.users.count_documents({"role": "artist"})
    total_posts = await db.posts.count_documents({"is_active": True})
    total_projects = await db.projects.count_documents({})
    
    # Interactions
    total_likes = await db.likes.count_documents({})
    total_comments = await db.comments.count_documents({"is_active": True})
    
    # By sector
    sector_pipeline = [
        {"$match": {"role": "artist"}},
        {"$group": {"_id": "$sector", "count": {"$sum": 1}}}
    ]
    sectors = await db.users.aggregate(sector_pipeline).to_list(20)
    
    # By subregion
    subregion_pipeline = [
        {"$match": {"role": "artist"}},
        {"$group": {"_id": "$subregion", "count": {"$sum": 1}}}
    ]
    subregions = await db.users.aggregate(subregion_pipeline).to_list(10)
    
    return {
        "total_artists": total_artists,
        "total_posts": total_posts,
        "total_projects": total_projects,
        "total_interactions": total_likes + total_comments,
        "by_sector": {s["_id"]: s["count"] for s in sectors if s["_id"]},
        "by_subregion": {s["_id"]: s["count"] for s in subregions if s["_id"]}
    }

@api_router.get("/statistics/detailed")
async def get_detailed_statistics(user = Depends(require_institution_or_admin)):
    """Detailed statistics - Institutions and Admins only"""
    
    # Gender distribution
    gender_pipeline = [
        {"$match": {"role": "artist"}},
        {"$group": {"_id": "$gender", "count": {"$sum": 1}}}
    ]
    genders = await db.users.aggregate(gender_pipeline).to_list(10)
    
    # By country
    country_pipeline = [
        {"$match": {"role": "artist"}},
        {"$group": {"_id": "$country", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    countries = await db.users.aggregate(country_pipeline).to_list(60)
    
    # By domain
    domain_pipeline = [
        {"$match": {"role": "artist"}},
        {"$group": {"_id": "$domain", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    domains = await db.users.aggregate(domain_pipeline).to_list(50)
    
    # Gender by country
    gender_country_pipeline = [
        {"$match": {"role": "artist"}},
        {"$group": {
            "_id": {"country": "$country", "gender": "$gender"},
            "count": {"$sum": 1}
        }}
    ]
    gender_by_country = await db.users.aggregate(gender_country_pipeline).to_list(300)
    
    # Gender by subregion
    gender_subregion_pipeline = [
        {"$match": {"role": "artist"}},
        {"$group": {
            "_id": {"subregion": "$subregion", "gender": "$gender"},
            "count": {"$sum": 1}
        }}
    ]
    gender_by_subregion = await db.users.aggregate(gender_subregion_pipeline).to_list(50)
    
    # Activity metrics
    total_posts = await db.posts.count_documents({"is_active": True})
    total_likes = await db.likes.count_documents({})
    total_comments = await db.comments.count_documents({"is_active": True})
    
    return {
        "by_gender": {g["_id"]: g["count"] for g in genders if g["_id"]},
        "by_country": {c["_id"]: c["count"] for c in countries if c["_id"]},
        "by_domain": {d["_id"]: d["count"] for d in domains if d["_id"]},
        "gender_by_country": gender_by_country,
        "gender_by_subregion": gender_by_subregion,
        "activity": {
            "total_posts": total_posts,
            "total_likes": total_likes,
            "total_comments": total_comments
        }
    }

# ============== ADMIN ROUTES ==============

@api_router.get("/admin/users")
async def admin_get_users(
    role: Optional[str] = None,
    limit: int = 50,
    skip: int = 0,
    user = Depends(require_admin)
):
    """Admin: Get all users"""
    query = {}
    if role:
        query["role"] = role
    
    users = await db.users.find(query, {"_id": 0, "password": 0}).skip(skip).limit(limit).to_list(limit)
    total = await db.users.count_documents(query)
    
    return {"users": users, "total": total}

@api_router.put("/admin/users/{user_id}/role")
async def admin_update_role(user_id: str, role: str, user = Depends(require_admin)):
    """Admin: Update user role"""
    if role not in ROLES:
        raise HTTPException(status_code=400, detail="Invalid role")
    
    await db.users.update_one({"id": user_id}, {"$set": {"role": role}})
    return {"message": "Role updated"}

@api_router.put("/admin/users/{user_id}/featured")
async def admin_toggle_featured(user_id: str, user = Depends(require_admin)):
    """Admin: Toggle featured status"""
    target = await db.users.find_one({"id": user_id})
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    
    new_status = not target.get("is_featured", False)
    await db.users.update_one({"id": user_id}, {"$set": {"is_featured": new_status}})
    
    return {"is_featured": new_status}

@api_router.delete("/admin/posts/{post_id}")
async def admin_delete_post(post_id: str, user = Depends(require_admin)):
    """Admin: Force delete any post"""
    await db.posts.update_one({"id": post_id}, {"$set": {"is_active": False}})
    return {"message": "Post deleted"}

# ============== SEED DATA ==============

@api_router.post("/seed")
async def seed_data():
    existing = await db.users.count_documents({})
    if existing > 0:
        return {"message": "Data already seeded"}
    
    sample_artists = [
        {
            "id": str(uuid.uuid4()),
            "email": "amara.diallo@artconnect.africa",
            "password": hash_password("password123"),
            "first_name": "Amara",
            "last_name": "Diallo",
            "country": "Senegal",
            "subregion": "West Africa",
            "gender": "Female",
            "sector": "Visual Arts",
            "domain": "Painting",
            "year_started": 2015,
            "bio": "Peintre contemporaine explorant l'identité africaine à travers des couleurs vibrantes et des motifs traditionnels revisités.",
            "additional_info": "Expositions à Dakar, Paris et New York",
            "avatar": "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400",
            "portfolio": {"documents": [], "images": [], "videos": []},
            "created_at": datetime.now(timezone.utc).isoformat(),
            "role": "artist",
            "is_featured": True,
            "is_verified": True
        },
        {
            "id": str(uuid.uuid4()),
            "email": "kwame.asante@artconnect.africa",
            "password": hash_password("password123"),
            "first_name": "Kwame",
            "last_name": "Asante",
            "country": "Ghana",
            "subregion": "West Africa",
            "gender": "Male",
            "sector": "Music",
            "domain": "Afrobeat",
            "year_started": 2012,
            "bio": "Producteur musical mélangeant les rythmes traditionnels ghanéens avec l'afrobeat moderne.",
            "additional_info": "Collaborations avec plusieurs artistes internationaux",
            "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
            "portfolio": {"documents": [], "images": [], "videos": []},
            "created_at": datetime.now(timezone.utc).isoformat(),
            "role": "artist",
            "is_featured": True,
            "is_verified": True
        },
        {
            "id": str(uuid.uuid4()),
            "email": "fatou.barry@artconnect.africa",
            "password": hash_password("password123"),
            "first_name": "Fatou",
            "last_name": "Barry",
            "country": "Côte d'Ivoire",
            "subregion": "West Africa",
            "gender": "Female",
            "sector": "Fashion & Design",
            "domain": "Fashion Design",
            "year_started": 2018,
            "bio": "Créatrice de mode alliant tissus africains traditionnels et coupes contemporaines.",
            "additional_info": "Défilés à Abidjan Fashion Week",
            "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400",
            "portfolio": {"documents": [], "images": [], "videos": []},
            "created_at": datetime.now(timezone.utc).isoformat(),
            "role": "artist",
            "is_featured": True,
            "is_verified": True
        },
        {
            "id": str(uuid.uuid4()),
            "email": "youssef.benali@artconnect.africa",
            "password": hash_password("password123"),
            "first_name": "Youssef",
            "last_name": "Ben Ali",
            "country": "Morocco",
            "subregion": "North Africa",
            "gender": "Male",
            "sector": "Cinema & Audiovisual",
            "domain": "Film Direction",
            "year_started": 2010,
            "bio": "Réalisateur de films documentaires sur le patrimoine culturel maghrébin.",
            "additional_info": "Prix du meilleur documentaire au FESPACO",
            "avatar": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
            "portfolio": {"documents": [], "images": [], "videos": []},
            "created_at": datetime.now(timezone.utc).isoformat(),
            "role": "artist",
            "is_featured": True,
            "is_verified": True
        },
        {
            "id": str(uuid.uuid4()),
            "email": "amina.mwangi@artconnect.africa",
            "password": hash_password("password123"),
            "first_name": "Amina",
            "last_name": "Mwangi",
            "country": "Kenya",
            "subregion": "East Africa",
            "gender": "Female",
            "sector": "Literature",
            "domain": "Poetry",
            "year_started": 2016,
            "bio": "Poétesse et auteure explorant les thèmes de la femme africaine moderne.",
            "additional_info": "Publications dans plusieurs anthologies panafricaines",
            "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
            "portfolio": {"documents": [], "images": [], "videos": []},
            "created_at": datetime.now(timezone.utc).isoformat(),
            "role": "artist",
            "is_featured": True,
            "is_verified": True
        },
        {
            "id": str(uuid.uuid4()),
            "email": "thabo.molefe@artconnect.africa",
            "password": hash_password("password123"),
            "first_name": "Thabo",
            "last_name": "Molefe",
            "country": "South Africa",
            "subregion": "Southern Africa",
            "gender": "Male",
            "sector": "Digital Arts",
            "domain": "3D Art",
            "year_started": 2019,
            "bio": "Artiste 3D créant des œuvres afrofuturistes mêlant tradition et technologie.",
            "additional_info": "NFT Artist avec ventes sur les grandes plateformes",
            "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
            "portfolio": {"documents": [], "images": [], "videos": []},
            "created_at": datetime.now(timezone.utc).isoformat(),
            "role": "artist",
            "is_featured": True,
            "is_verified": True
        },
        {
            "id": str(uuid.uuid4()),
            "email": "grace.okafor@artconnect.africa",
            "password": hash_password("password123"),
            "first_name": "Grace",
            "last_name": "Okafor",
            "country": "Nigeria",
            "subregion": "West Africa",
            "gender": "Female",
            "sector": "Performing Arts",
            "domain": "Dance",
            "year_started": 2014,
            "bio": "Danseuse et chorégraphe spécialisée dans la danse contemporaine africaine.",
            "additional_info": "Directrice d'une compagnie de danse à Lagos",
            "avatar": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
            "portfolio": {"documents": [], "images": [], "videos": []},
            "created_at": datetime.now(timezone.utc).isoformat(),
            "role": "artist",
            "is_featured": False,
            "is_verified": True
        },
        {
            "id": str(uuid.uuid4()),
            "email": "moussa.traore@artconnect.africa",
            "password": hash_password("password123"),
            "first_name": "Moussa",
            "last_name": "Traoré",
            "country": "Mali",
            "subregion": "West Africa",
            "gender": "Male",
            "sector": "Craftsmanship",
            "domain": "Woodworking",
            "year_started": 2008,
            "bio": "Maître artisan sculpteur perpétuant les traditions de sculpture malienne.",
            "additional_info": "Formateur au Centre Artisanal de Bamako",
            "avatar": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400",
            "portfolio": {"documents": [], "images": [], "videos": []},
            "created_at": datetime.now(timezone.utc).isoformat(),
            "role": "artist",
            "is_featured": False,
            "is_verified": True
        },
        # Institution account
        {
            "id": str(uuid.uuid4()),
            "email": "culture@gov.sn",
            "password": hash_password("institution123"),
            "first_name": "Ministère",
            "last_name": "Culture Sénégal",
            "country": "Senegal",
            "subregion": "West Africa",
            "gender": "Prefer not to say",
            "sector": "Cultural Heritage",
            "domain": "Museum Curation",
            "year_started": 2020,
            "bio": "Ministère de la Culture et de la Communication du Sénégal",
            "additional_info": "",
            "organization_name": "Ministère de la Culture du Sénégal",
            "avatar": "https://api.dicebear.com/7.x/initials/svg?seed=MC",
            "portfolio": {"documents": [], "images": [], "videos": []},
            "created_at": datetime.now(timezone.utc).isoformat(),
            "role": "institution",
            "is_featured": False,
            "is_verified": True
        },
        # Admin account
        {
            "id": str(uuid.uuid4()),
            "email": "admin@artconnect.africa",
            "password": hash_password("admin123"),
            "first_name": "Admin",
            "last_name": "ArtConnect",
            "country": "Senegal",
            "subregion": "West Africa",
            "gender": "Prefer not to say",
            "sector": "Digital Arts",
            "domain": "Web Design",
            "year_started": 2024,
            "bio": "Administrateur de la plateforme Art Connect Africa",
            "additional_info": "",
            "avatar": "https://api.dicebear.com/7.x/initials/svg?seed=AA",
            "portfolio": {"documents": [], "images": [], "videos": []},
            "created_at": datetime.now(timezone.utc).isoformat(),
            "role": "admin",
            "is_featured": False,
            "is_verified": True
        }
    ]
    
    await db.users.insert_many(sample_artists)
    
    # Create sample posts
    artist_ids = [a["id"] for a in sample_artists if a["role"] == "artist"]
    sample_posts = [
        {
            "id": str(uuid.uuid4()),
            "author_id": artist_ids[0],  # Amara
            "content_type": "image",
            "text_content": "Nouvelle toile terminée aujourd'hui ! 🎨 Inspirée par les couleurs du marché de Dakar.",
            "media_url": "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800",
            "likes_count": 24,
            "comments_count": 5,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "is_active": True
        },
        {
            "id": str(uuid.uuid4()),
            "author_id": artist_ids[1],  # Kwame
            "content_type": "video",
            "text_content": "Session studio d'hier soir. Nouveau track Afrobeat en préparation ! 🎵",
            "media_url": "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800",
            "likes_count": 45,
            "comments_count": 12,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "is_active": True
        },
        {
            "id": str(uuid.uuid4()),
            "author_id": artist_ids[2],  # Fatou
            "content_type": "image",
            "text_content": "Sneak peek de la nouvelle collection ! Wax meets modernité. 👗",
            "media_url": "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800",
            "likes_count": 67,
            "comments_count": 8,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "is_active": True
        },
        {
            "id": str(uuid.uuid4()),
            "author_id": artist_ids[4],  # Amina
            "content_type": "text",
            "text_content": "\"L'Afrique n'est pas un pays, c'est un univers de cultures, de langues, de rêves et de possibilités infinies.\"\n\n- Extrait de mon nouveau recueil 📚",
            "media_url": None,
            "likes_count": 89,
            "comments_count": 15,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "is_active": True
        }
    ]
    
    await db.posts.insert_many(sample_posts)
    
    # Create sample project
    sample_project = {
        "id": str(uuid.uuid4()),
        "creator_id": artist_ids[0],
        "title": "Exposition Panafricaine 2026",
        "description": "Recherche artistes pour une exposition collective célébrant l'art contemporain africain.",
        "sector": "Visual Arts",
        "looking_for": ["Sculpture", "Photography", "Mixed Media"],
        "status": "open",
        "collaborators": [],
        "applications": [],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.projects.insert_one(sample_project)
    
    return {"message": "Sample data seeded successfully", "artists": len(sample_artists), "posts": len(sample_posts)}

# ============== HEALTH CHECK ==============

@api_router.get("/")
async def root():
    return {"message": "Art Connect Africa API is running", "version": "2.0"}

@api_router.get("/health")
async def health():
    return {"status": "healthy"}

# ============== APP SETUP ==============

app.include_router(api_router)
# Mount uploads under /api/uploads so it goes through the API routing
app.mount("/api/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
