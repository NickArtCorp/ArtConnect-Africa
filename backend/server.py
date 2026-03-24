from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, Form, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
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
import sqlite3
import json
from sqlalchemy import create_engine, Column, String, Integer, Boolean, Text, JSON, DateTime, ForeignKey, Table
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Create uploads directory
UPLOADS_DIR = ROOT_DIR / 'uploads'
UPLOADS_DIR.mkdir(exist_ok=True)
(UPLOADS_DIR / 'documents').mkdir(exist_ok=True)
(UPLOADS_DIR / 'images').mkdir(exist_ok=True)
(UPLOADS_DIR / 'posts').mkdir(exist_ok=True)
(UPLOADS_DIR / 'avatars').mkdir(exist_ok=True)

# SQLite Connection
DATABASE_URL = os.environ.get('SQLITE_URL', f"sqlite:///{ROOT_DIR}/artconnect.db")
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Create the main app
app = FastAPI(title="Art Connect Africa API (SQLite Mode)")
api_router = APIRouter(prefix="/api")

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ============== SQL MODELS ==============

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    first_name = Column(String)
    last_name = Column(String)
    country = Column(String)
    subregion = Column(String)
    gender = Column(String)
    sector = Column(String)
    domain = Column(String)
    year_started = Column(Integer)
    bio = Column(Text, default="")
    additional_info = Column(Text, default="")
    website = Column(String, default="")
    avatar = Column(String)
    portfolio = Column(JSON, default={"documents": [], "images": [], "videos": []})
    role = Column(String, default="artist")
    organization_name = Column(String, nullable=True)
    is_verified = Column(Boolean, default=False)
    is_featured = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class Post(Base):
    __tablename__ = "posts"
    id = Column(String, primary_key=True, index=True)
    author_id = Column(String, ForeignKey("users.id"))
    content_type = Column(String)
    text_content = Column(Text, nullable=True)
    media_url = Column(String, nullable=True)
    likes_count = Column(Integer, default=0)
    comments_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)

class Like(Base):
    __tablename__ = "likes"
    id = Column(String, primary_key=True, index=True)
    post_id = Column(String, ForeignKey("posts.id"))
    user_id = Column(String, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

class Comment(Base):
    __tablename__ = "comments"
    id = Column(String, primary_key=True, index=True)
    post_id = Column(String, ForeignKey("posts.id"))
    author_id = Column(String, ForeignKey("users.id"))
    content = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)

class Message(Base):
    __tablename__ = "messages"
    id = Column(String, primary_key=True, index=True)
    sender_id = Column(String, ForeignKey("users.id"))
    receiver_id = Column(String, ForeignKey("users.id"))
    content = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    read = Column(Boolean, default=False)

class Project(Base):
    __tablename__ = "projects"
    id = Column(String, primary_key=True, index=True)
    creator_id = Column(String, ForeignKey("users.id"))
    title = Column(String)
    description = Column(Text)
    sector = Column(String)
    looking_for = Column(JSON, default=[])
    status = Column(String, default="open")
    collaborators = Column(JSON, default=[])
    applications = Column(JSON, default=[])
    created_at = Column(DateTime, default=datetime.utcnow)

# Create tables
Base.metadata.create_all(bind=engine)

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
                   'website', 'avatar', 'role', 'is_featured', 'is_verified', 'created_at', 'organization_name', 'portfolio']
    return {k: v for k, v in user.items() if k in safe_fields}

# ============== AUTH DEPENDENCIES ==============

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = credentials.credentials
    if token not in active_tokens:
        raise HTTPException(status_code=401, detail="Invalid token")
    user_id = active_tokens[token]
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    # Convert to dict for compatibility
    user_dict = {c.name: getattr(user, c.name) for c in user.__table__.columns}
    if 'password' in user_dict:
        del user_dict['password']
    return user_dict

async def get_optional_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    if not credentials:
        return None
    token = credentials.credentials
    if token not in active_tokens:
        return None
    user_id = active_tokens[token]
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None
    
    user_dict = {c.name: getattr(user, c.name) for c in user.__table__.columns}
    if 'password' in user_dict:
        del user_dict['password']
    return user_dict

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

async def require_paid_institution(user=Depends(get_current_user)):
    """
    Dependency Injection — accès stats détaillées.
    Conditions : role == 'institution' ET has_paid == True ET access_code présent.
    Les admins contournent la vérification de paiement (accès total).
    """
    role = user.get("role")
 
    if role == "admin":
        return user                                        # Admin bypass
 
    if role != "institution":
        raise HTTPException(
            status_code=403,
            detail="Accès réservé aux institutions."
        )
 
    if not user.get("has_paid", False):
        raise HTTPException(
            status_code=402,                               # Payment Required
            detail="Paiement requis pour accéder aux statistiques détaillées."
        )
 
    if not user.get("access_code"):
        raise HTTPException(
            status_code=403,
            detail="Code d'accès manquant. Veuillez contacter le support."
        )
 
    return user
 
async def require_admin(user = Depends(get_current_user)):
    """Admin only actions"""
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

# ============== PYDANTIC MODELS ==============
class MockCheckoutRequest(BaseModel):
    """Corps optionnel pour le mock checkout (extensible vers de vrais plans)."""
    plan: str = "premium"          # "basic" | "premium" | "enterprise"
    currency: str = "XAF"          # FCFA par défaut
 
 
class AccessCodeVerifyRequest(BaseModel):
    access_code: str
 
 
class PaymentStatusResponse(BaseModel):
    has_paid: bool
    access_code: Optional[str] = None
    paid_at: Optional[str] = None
    plan: Optional[str] = None

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
    organization_name: Optional[str] = None

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
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    new_user = User(
        id=user_id,
        email=user_data.email,
        password=hash_password(user_data.password),
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        country=user_data.country,
        subregion=user_data.subregion,
        gender=user_data.gender,
        sector=user_data.sector,
        domain=user_data.domain,
        year_started=user_data.year_started,
        bio=user_data.bio or "",
        additional_info=user_data.additional_info or "",
        website=user_data.website or "",
        avatar=f"https://api.dicebear.com/7.x/initials/svg?seed={user_data.first_name}%20{user_data.last_name}",
        portfolio={"documents": [], "images": [], "videos": []},
        role=user_data.role,
        organization_name=user_data.organization_name if user_data.role == 'institution' else None,
        is_verified=False,
        is_featured=False
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    token = generate_token()
    active_tokens[token] = user_id
    
    user_dict = sanitize_user({c.name: getattr(new_user, c.name) for c in new_user.__table__.columns})
    return {"token": token, "user": user_dict}

@api_router.post("/auth/login")
async def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or user.password != hash_password(credentials.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = generate_token()
    active_tokens[token] = user.id
    
    user_dict = sanitize_user({c.name: getattr(user, c.name) for c in user.__table__.columns})
    return {"token": token, "user": user_dict}

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
    skip: int = 0,
    db: Session = Depends(get_db)
):
    query = db.query(User).filter(User.role == "artist")
    
    if search:
        s = f"%{search}%"
        query = query.filter((User.first_name.ilike(s)) | (User.last_name.ilike(s)) | (User.bio.ilike(s)))
    if country: query = query.filter(User.country == country)
    if subregion: query = query.filter(User.subregion == subregion)
    if sector: query = query.filter(User.sector == sector)
    if domain: query = query.filter(User.domain == domain)
    if gender: query = query.filter(User.gender == gender)
    
    total = query.count()
    objs = query.offset(skip).limit(limit).all()
    
    artists = []
    for a in objs:
        d = sanitize_user({c.name: getattr(a, c.name) for c in a.__table__.columns})
        artists.append(d)
        
    return {"artists": artists, "total": total}

@api_router.get("/artists/featured")
async def get_featured_artists(limit: int = 6, db: Session = Depends(get_db)):
    objs = db.query(User).filter(User.role == "artist", User.is_featured == True).limit(limit).all()
    return [sanitize_user({c.name: getattr(a, c.name) for c in a.__table__.columns}) for a in objs]

@api_router.get("/artists/{artist_id}")
async def get_artist(artist_id: str, db: Session = Depends(get_db)):
    a = db.query(User).filter(User.id == artist_id, User.role == "artist").first()
    if not a:
        raise HTTPException(status_code=404, detail="Artist not found")
    return sanitize_user({c.name: getattr(a, c.name) for c in a.__table__.columns})

@api_router.put("/artists/me")
async def update_profile(update_data: UserUpdate, user = Depends(get_current_user), db: Session = Depends(get_db)):
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    if update_dict:
        db.query(User).filter(User.id == user["id"]).update(update_dict)
        db.commit()
    
    updated = db.query(User).filter(User.id == user["id"]).first()
    return sanitize_user({c.name: getattr(updated, c.name) for c in updated.__table__.columns})

@api_router.post("/artists/me/avatar")
async def upload_avatar(file: UploadFile = File(...), user = Depends(get_current_user), db: Session = Depends(get_db)):
    ext = Path(file.filename).suffix.lower()
    if ext not in [".jpg", ".jpeg", ".png", ".webp"]:
        raise HTTPException(status_code=400, detail="Invalid image type")
    
    fid = str(uuid.uuid4())
    path = UPLOADS_DIR / 'avatars' / f"{fid}{ext}"
    with open(path, "wb") as buf:
        shutil.copyfileobj(file.file, buf)
    
    url = f"/uploads/avatars/{fid}{ext}"
    db.query(User).filter(User.id == user["id"]).update({"avatar": url})
    db.commit()
    return {"avatar": url}

# ============== POSTS ROUTES ==============

@api_router.post("/posts")
async def create_post(post_data: PostCreate, user = Depends(require_artist_or_admin), db: Session = Depends(get_db)):
    pid = str(uuid.uuid4())
    new_post = Post(
        id=pid,
        author_id=user["id"],
        content_type=post_data.content_type,
        text_content=post_data.text_content,
        media_url=post_data.media_url
    )
    db.add(new_post)
    db.commit()
    db.refresh(new_post)
    
    d = {c.name: getattr(new_post, c.name) for c in new_post.__table__.columns}
    d["created_at"] = new_post.created_at.isoformat()
    d["author"] = user
    return d

@api_router.get("/posts")
async def get_posts(limit: int = 20, before: Optional[str] = None, author_id: Optional[str] = None, user = Depends(get_optional_user), db: Session = Depends(get_db)):
    query = db.query(Post).filter(Post.is_active == True)
    if before:
        dt = datetime.fromisoformat(before.replace('Z', '+00:00'))
        query = query.filter(Post.created_at < dt)
    if author_id:
        query = query.filter(Post.author_id == author_id)
        
    objs = query.order_by(Post.created_at.desc()).limit(limit).all()
    
    posts = []
    for p in objs:
        d = {c.name: getattr(p, c.name) for c in p.__table__.columns}
        d["created_at"] = p.created_at.isoformat()
        author = db.query(User).filter(User.id == p.author_id).first()
        d["author"] = sanitize_user({c.name: getattr(author, c.name) for c in author.__table__.columns}) if author else None
        
        if user:
            liked = db.query(Like).filter(Like.post_id == p.id, Like.user_id == user["id"]).first()
            d["is_liked"] = liked is not None
        else:
            d["is_liked"] = False
        posts.append(d)
    return posts

@api_router.get("/posts/{post_id}")
async def get_post(post_id: str, user = Depends(get_optional_user), db: Session = Depends(get_db)):
    p = db.query(Post).filter(Post.id == post_id, Post.is_active == True).first()
    if not p: raise HTTPException(status_code=404, detail="Post not found")
    
    d = {c.name: getattr(p, c.name) for c in p.__table__.columns}
    d["created_at"] = p.created_at.isoformat()
    author = db.query(User).filter(User.id == p.author_id).first()
    d["author"] = sanitize_user({c.name: getattr(author, c.name) for c in author.__table__.columns}) if author else None
    
    if user:
        liked = db.query(Like).filter(Like.post_id == p.id, Like.user_id == user["id"]).first()
        d["is_liked"] = liked is not None
    else: d["is_liked"] = False
    return d

@api_router.delete("/posts/{post_id}")
async def delete_post(post_id: str, user = Depends(get_current_user), db: Session = Depends(get_db)):
    p = db.query(Post).filter(Post.id == post_id).first()
    if not p: raise HTTPException(status_code=404, detail="Post not found")
    if p.author_id != user["id"] and user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Unauthorized")
    p.is_active = False
    db.commit()
    return {"message": "Deleted"}

@api_router.post("/posts/{post_id}/like")
async def toggle_like(post_id: str, user = Depends(require_artist_or_admin), db: Session = Depends(get_db)):
    p = db.query(Post).filter(Post.id == post_id).first()
    if not p: raise HTTPException(status_code=404, detail="Post not found")
    
    existing = db.query(Like).filter(Like.post_id == post_id, Like.user_id == user["id"]).first()
    if existing:
        db.delete(existing)
        p.likes_count -= 1
        db.commit()
        return {"liked": False, "likes_count": p.likes_count}
    else:
        db.add(Like(id=str(uuid.uuid4()), post_id=post_id, user_id=user["id"]))
        p.likes_count += 1
        db.commit()
        return {"liked": True, "likes_count": p.likes_count}

@api_router.post("/posts/{post_id}/comments")
async def create_comment(post_id: str, data: CommentCreate, user = Depends(require_artist_or_admin), db: Session = Depends(get_db)):
    p = db.query(Post).filter(Post.id == post_id).first()
    if not p: raise HTTPException(status_code=404, detail="Post not found")
    
    cid = str(uuid.uuid4())
    c = Comment(id=cid, post_id=post_id, author_id=user["id"], content=data.content)
    db.add(c)
    p.comments_count += 1
    db.commit()
    db.refresh(c)
    
    d = {col.name: getattr(c, col.name) for col in c.__table__.columns}
    d["created_at"] = c.created_at.isoformat()
    d["author"] = user
    return d

@api_router.get("/posts/{post_id}/comments")
async def get_comments(post_id: str, limit: int = 50, db: Session = Depends(get_db)):
    objs = db.query(Comment).filter(Comment.post_id == post_id, Comment.is_active == True).order_by(Comment.created_at.asc()).limit(limit).all()
    res = []
    for c in objs:
        d = {col.name: getattr(c, col.name) for col in c.__table__.columns}
        d["created_at"] = c.created_at.isoformat()
        a = db.query(User).filter(User.id == c.author_id).first()
        d["author"] = sanitize_user({col.name: getattr(a, col.name) for col in a.__table__.columns}) if a else None
        res.append(d)
    return res

# ============== MESSAGES ROUTES ==============

@api_router.post("/messages")
async def send_msg(data: MessageCreate, user = Depends(get_current_user), db: Session = Depends(get_db)):
    mid = str(uuid.uuid4())
    m = Message(id=mid, sender_id=user["id"], receiver_id=data.receiver_id, content=data.content)
    db.add(m)
    db.commit()
    return {"message": "Sent"}

@api_router.get("/messages/conversations")
async def get_convs(user = Depends(get_current_user), db: Session = Depends(get_db)):
    uid = user["id"]
    msgs = db.query(Message).filter((Message.sender_id == uid) | (Message.receiver_id == uid)).order_by(Message.created_at.desc()).all()
    convs = {}
    for m in msgs:
        other = m.receiver_id if m.sender_id == uid else m.sender_id
        if other not in convs:
            u = db.query(User).filter(User.id == other).first()
            if u:
                convs[other] = {
                    "user": sanitize_user({c.name: getattr(u, c.name) for c in u.__table__.columns}),
                    "last_message": {"content": m.content, "created_at": m.created_at.isoformat()},
                    "unread_count": 1 if m.receiver_id == uid and not m.read else 0
                }
    return list(convs.values())

# ============== PROJECTS ROUTES ==============

@api_router.post("/projects")
async def create_proj(data: ProjectCreate, user = Depends(require_artist_or_admin), db: Session = Depends(get_db)):
    pid = str(uuid.uuid4())
    p = Project(id=pid, creator_id=user["id"], title=data.title, description=data.description, sector=data.sector, looking_for=data.looking_for)
    db.add(p)
    db.commit()
    return {"id": pid}

@api_router.get("/projects")
async def get_projs(sector: Optional[str] = None, skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    q = db.query(Project).filter(Project.status == "open")
    if sector: q = q.filter(Project.sector == sector)
    objs = q.offset(skip).limit(limit).all()
    res = []
    for o in objs:
        d = {c.name: getattr(o, c.name) for c in o.__table__.columns}
        u = db.query(User).filter(User.id == o.creator_id).first()
        d["creator"] = sanitize_user({c.name: getattr(u, c.name) for c in u.__table__.columns}) if u else None
        res.append(d)
    return res

# ============== STATISTICS ROUTES ==============

@api_router.get("/statistics/overview")
async def stats_overview(db: Session = Depends(get_db)):
    artists = db.query(User).filter(User.role == "artist").all()
    sectors = {}
    for a in artists: sectors[a.sector] = sectors.get(a.sector, 0) + 1
    return {
        "total_artists": len(artists),
        "total_posts": db.query(Post).count(),
        "total_projects": db.query(Project).count(),
        "by_sector": sectors
    }

# ============== SEED DATA ==============

@api_router.post("/seed")
async def seed(db: Session = Depends(get_db)):
    if db.query(User).count() > 0: return {"message": "Seeded"}
    admin = User(id=str(uuid.uuid4()), email="admin@artconnect.africa", password=hash_password("admin123"), first_name="Admin", last_name="ACA", role="admin")
    db.add(admin)
    db.commit()
    return {"message": "Success"}

# ============== APP SETUP ==============

@api_router.get("/")
async def root(): return {"message": "Art Connect Africa API (SQLite Mode)"}

@api_router.get("/health")
async def health(): return {"status": "ok"}

app.include_router(api_router)
app.mount("/api/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
