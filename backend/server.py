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
from sqlalchemy import create_engine, Column, String, Integer, Boolean, Text, JSON, DateTime, ForeignKey, Table, func
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
    country = Column(String, nullable=True)
    subregion = Column(String, nullable=True)
    gender = Column(String, nullable=True)
    sector = Column(String, nullable=True)
    domain = Column(String, nullable=True)
    year_started = Column(Integer, nullable=True)
    bio = Column(Text, default="")
    additional_info = Column(Text, default="")
    website = Column(String, default="")
    avatar = Column(String)
    portfolio = Column(JSON, default={"documents": [], "images": [], "videos": []})
    role = Column(String, default="artist")
    organization_name = Column(String, nullable=True)
    visitor_type = Column(String, nullable=True)  # 'individual' | 'organisation'
    is_verified = Column(Boolean, default=False)
    is_featured = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    has_paid = Column(Boolean, default=False)
    access_code = Column(String, nullable=True)
    paid_at = Column(String, nullable=True)
    profile_tag = Column(String, nullable=True)  # 'artist' | 'professional' | 'media'

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
    sender_type = Column(String, default="artist")  # 'artist' | 'visitor' | 'institution'
    is_visitor = Column(Boolean, default=False)  # tag if sender is visitor

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
    collaboration_type = Column(String, default="local")
    start_date = Column(DateTime, default=datetime.utcnow)
    end_date = Column(DateTime, nullable=True)
    location = Column(String, nullable=True)

class VisitorView(Base):
    __tablename__ = "visitor_views"
    id = Column(String, primary_key=True, index=True)
    visitor_id = Column(String, nullable=True)  # None for anonymous, user_id for logged-in visitors
    artist_id = Column(String, ForeignKey("users.id"))
    viewed_at = Column(DateTime, default=datetime.utcnow)

# Create tables
Base.metadata.create_all(bind=engine)

# ── Migration: add payment columns if they don't exist yet (safe on existing DBs) ──
def _run_migrations():
    with engine.connect() as conn:
        for col, definition in [
            ("has_paid",    "BOOLEAN DEFAULT 0"),
            ("access_code", "VARCHAR"),
            ("paid_at",     "VARCHAR"),
            ("profile_tag", "VARCHAR"),
        ]:
            try:
                conn.execute(
                    __import__("sqlalchemy").text(f"ALTER TABLE users ADD COLUMN {col} {definition}")
                )
                conn.commit()
            except Exception:
                pass  # Column already exists — ignore
        for col, definition in [
            ("collaboration_type", "VARCHAR DEFAULT 'local'"),
            ("start_date", "DATETIME DEFAULT CURRENT_TIMESTAMP"),
            ("end_date", "DATETIME"),
            ("location", "VARCHAR"),
        ]:
            try:
                conn.execute(
                    __import__("sqlalchemy").text(f"ALTER TABLE projects ADD COLUMN {col} {definition}")
                )
                conn.commit()
            except Exception:
                pass
        # Visitor columns
        for col, definition in [
            ("visitor_type", "VARCHAR"),
        ]:
            try:
                conn.execute(
                    __import__("sqlalchemy").text(f"ALTER TABLE users ADD COLUMN {col} {definition}")
                )
                conn.commit()
            except Exception:
                pass
        # Message columns for visitor and sender_type
        for col, definition in [
            ("sender_type", "VARCHAR DEFAULT 'artist'"),
            ("is_visitor", "BOOLEAN DEFAULT 0"),
        ]:
            try:
                conn.execute(
                    __import__("sqlalchemy").text(f"ALTER TABLE messages ADD COLUMN {col} {definition}")
                )
                conn.commit()
            except Exception:
                pass


_run_migrations()

# Security
security = HTTPBearer(auto_error=False)
active_tokens = {}

# ============== CONSTANTS ==============

ROLES = ['admin', 'artist', 'institution', 'visitor']

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
                   'website', 'avatar', 'role', 'is_featured', 'is_verified', 'created_at',
                   'organization_name', 'visitor_type', 'portfolio', 'has_paid', 'access_code', 'paid_at', 'profile_tag']
    return {k: v for k, v in user.items() if k in safe_fields}

def compute_collaborations_count(user_id: str, db: Session) -> int:
    """Count projects where user is creator or an accepted collaborator."""
    # Creator of any project
    creator_count = db.query(Project).filter(Project.creator_id == user_id).count()
    # Accepted collaborator in other projects
    all_projects = db.query(Project).filter(Project.creator_id != user_id).all()
    accepted_count = 0
    for p in all_projects:
        collabs = p.collaborators if p.collaborators else []
        if isinstance(collabs, list):
            for c in collabs:
                if isinstance(c, dict) and c.get('user_id') == user_id and c.get('status') == 'accepted':
                    accepted_count += 1
                    break
                elif isinstance(c, str) and c == user_id:
                    accepted_count += 1
                    break
    return creator_count + accepted_count

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
    country: Optional[str] = None
    subregion: Optional[str] = None
    gender: Optional[str] = None
    sector: Optional[str] = None
    domain: Optional[str] = None
    year_started: Optional[int] = None
    bio: Optional[str] = ""
    additional_info: Optional[str] = ""
    website: Optional[str] = ""
    role: Literal['artist', 'institution', 'visitor'] = 'artist'
    profile_tag: Optional[Literal['artist', 'professional', 'media']] = None
    organization_name: Optional[str] = None
    visitor_type: Optional[Literal['individual', 'organisation']] = None

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
    profile_tag: Optional[Literal['artist', 'professional', 'media']] = None

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
    collaboration_type: str = "local"
    start_date: str
    end_date: Optional[str] = None
    location: Optional[str] = None

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

    # Validate role-specific requirements
    if user_data.role == 'visitor':
        if not user_data.visitor_type:
            raise HTTPException(status_code=400, detail="visitor_type is required for visitor accounts")
        if user_data.visitor_type == 'organisation' and not user_data.organization_name:
            raise HTTPException(status_code=400, detail="organisation_name is required for organisation visitors")
    elif user_data.role in ('artist', 'institution'):
        missing = [f for f in ['country', 'subregion', 'gender', 'sector', 'domain'] if not getattr(user_data, f)]
        if missing:
            raise HTTPException(status_code=400, detail=f"Missing required fields: {', '.join(missing)}")

    user_id = str(uuid.uuid4())

    # Avatar selection
    if user_data.role == 'visitor':
        # Generic visitor avatar via DiceBear with distinct style
        if user_data.visitor_type == 'organisation':
            avatar = f"https://api.dicebear.com/7.x/shapes/svg?seed={user_id}&backgroundColor=64748b"
        else:
            avatar = f"https://api.dicebear.com/7.x/personas/svg?seed={user_id}&backgroundColor=64748b"
    else:
        avatar = f"https://api.dicebear.com/7.x/initials/svg?seed={user_data.first_name}%20{user_data.last_name}"

    new_user = User(
        id=user_id,
        email=user_data.email,
        password=hash_password(user_data.password),
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        country=user_data.country,
        subregion=user_data.subregion,
        gender=user_data.gender if user_data.role != 'visitor' else None,
        sector=user_data.sector if user_data.role != 'visitor' else None,
        domain=user_data.domain if user_data.role != 'visitor' else None,
        year_started=user_data.year_started if user_data.role != 'visitor' else None,
        bio=user_data.bio or "",
        additional_info=user_data.additional_info or "",
        website=user_data.website or "",
        avatar=avatar,
        portfolio={"documents": [], "images": [], "videos": []},
        role=user_data.role,
        profile_tag=user_data.profile_tag,
        organization_name=user_data.organization_name if user_data.role in ('institution', 'visitor') else None,
        visitor_type=user_data.visitor_type if user_data.role == 'visitor' else None,
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
        d['collaborations_count'] = compute_collaborations_count(a.id, db)
        d['visitor_views_count'] = db.query(func.count(func.distinct(VisitorView.visitor_id))).filter(
            VisitorView.artist_id == a.id, VisitorView.visitor_id != None
        ).scalar() or 0
        d['visitor_messages_count'] = db.query(func.count(Message.id)).filter(
            Message.receiver_id == a.id, Message.sender_type == "visitor"
        ).scalar() or 0
        artists.append(d)

    return {"artists": artists, "total": total}

@api_router.get("/artists/featured")
async def get_featured_artists(limit: int = 6, db: Session = Depends(get_db)):
    objs = db.query(User).filter(User.role == "artist", User.is_featured == True).limit(limit).all()
    results = []
    for a in objs:
        d = sanitize_user({c.name: getattr(a, c.name) for c in a.__table__.columns})
        d['collaborations_count'] = compute_collaborations_count(a.id, db)
        d['visitor_views_count'] = db.query(func.count(func.distinct(VisitorView.visitor_id))).filter(
            VisitorView.artist_id == a.id, VisitorView.visitor_id != None
        ).scalar() or 0
        d['visitor_messages_count'] = db.query(func.count(Message.id)).filter(
            Message.receiver_id == a.id, Message.sender_type == "visitor"
        ).scalar() or 0
        results.append(d)
    return results

@api_router.get("/artists/{artist_id}")
async def get_artist(artist_id: str, db: Session = Depends(get_db)):
    a = db.query(User).filter(User.id == artist_id, User.role == "artist").first()
    if not a:
        raise HTTPException(status_code=404, detail="Artist not found")
    d = sanitize_user({c.name: getattr(a, c.name) for c in a.__table__.columns})
    d['collaborations_count'] = compute_collaborations_count(a.id, db)
    # Calculate visitor metrics
    d['visitor_views_count'] = db.query(func.count(func.distinct(VisitorView.visitor_id))).filter(
        VisitorView.artist_id == artist_id, VisitorView.visitor_id != None
    ).scalar() or 0
    d['visitor_messages_count'] = db.query(func.count(Message.id)).filter(
        Message.receiver_id == artist_id, Message.sender_type == "visitor"
    ).scalar() or 0
    # Attach recent collaborations for profile display
    owned = db.query(Project).filter(Project.creator_id == artist_id).all()
    now = datetime.utcnow()
    project_list = []
    for p in owned:
        status = "ongoing"
        if p.start_date and now < p.start_date: status = "upcoming"
        elif p.end_date and now > p.end_date: status = "past"
        project_list.append({
            "id": p.id, "title": p.title, "sector": p.sector,
            "collaboration_type": p.collaboration_type, "status": status,
            "start_date": p.start_date.isoformat() if p.start_date else None,
            "end_date": p.end_date.isoformat() if p.end_date else None,
        })
    d['collaborations'] = project_list
    return d

@api_router.post("/artists/{artist_id}/view")
async def track_profile_view(
    artist_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Log a visitor profile view (open to all, no auth required)."""
    artist = db.query(User).filter(User.id == artist_id, User.role == "artist").first()
    if not artist:
        raise HTTPException(status_code=404, detail="Artist not found")
    # Resolve visitor_id from token if present
    visitor_id = None
    if credentials and credentials.credentials in active_tokens:
        visitor_id = active_tokens[credentials.credentials]
    view = VisitorView(
        id=str(uuid.uuid4()),
        visitor_id=visitor_id,
        artist_id=artist_id,
    )
    db.add(view)
    db.commit()
    return {"ok": True}

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

@api_router.post("/posts/upload")
async def upload_post_media(
    file: UploadFile = File(...),
    content_type: str = Form(...),
    text_content: str = Form(""),
    user = Depends(require_artist_or_admin),
    db: Session = Depends(get_db)
):
    ext = Path(file.filename).suffix.lower()
    folder = 'images' if 'image' in content_type else 'videos'
    fid = str(uuid.uuid4())
    path = UPLOADS_DIR / folder / f"{fid}{ext}"
    
    with open(path, "wb") as buf:
        shutil.copyfileobj(file.file, buf)
    
    media_url = f"/uploads/{folder}/{fid}{ext}"
    
    new_post = Post(
        id=str(uuid.uuid4()),
        author_id=user["id"],
        content_type='image' if 'image' in content_type else 'video',
        text_content=text_content,
        media_url=media_url
    )
    db.add(new_post)
    db.commit()
    db.refresh(new_post)
    
    d = {c.name: getattr(new_post, c.name) for c in new_post.__table__.columns}
    d["created_at"] = new_post.created_at.isoformat()
    d["author"] = user
    return d

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
    sender_type = user.get("role", "artist")  # Use user's actual role
    is_visitor = sender_type == "visitor"
    
    m = Message(
        id=mid,
        sender_id=user["id"],
        receiver_id=data.receiver_id,
        content=data.content,
        sender_type=sender_type,
        is_visitor=is_visitor
    )
    db.add(m)
    db.commit()
    
    # Return the created message with all fields
    msg_dict = {c.name: getattr(m, c.name) for c in m.__table__.columns}
    msg_dict["created_at"] = m.created_at.isoformat()
    sender = db.query(User).filter(User.id == user["id"]).first()
    msg_dict["sender"] = sanitize_user({c.name: getattr(sender, c.name) for c in sender.__table__.columns}) if sender else None
    return msg_dict

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
                user_data = sanitize_user({c.name: getattr(u, c.name) for c in u.__table__.columns})
                convs[other] = {
                    "user": user_data,
                    "sender_role": u.role,
                    "sender_visitor_type": u.visitor_type,  # 'individual' | 'organisation' | None
                    "sender_name": f"{u.first_name} {u.last_name}",
                    "last_message": {
                        "content": m.content,
                        "created_at": m.created_at.isoformat(),
                        "sender_type": m.sender_type
                    },
                    "unread_count": db.query(func.count(Message.id)).filter(
                        Message.sender_id == other,
                        Message.receiver_id == uid,
                        Message.read == False
                    ).scalar() or 0
                }
    return list(convs.values())

@api_router.patch("/messages/{user_id}/read")
async def mark_messages_read(user_id: str, user = Depends(get_current_user), db: Session = Depends(get_db)):
    uid = user["id"]
    db.query(Message).filter(Message.sender_id == user_id, Message.receiver_id == uid, Message.read == False).update({"read": True})
    db.commit()
    return {"ok": True}

@api_router.get("/messages/{user_id}")
async def get_msgs(user_id: str, user = Depends(get_current_user), db: Session = Depends(get_db)):
    """Fetch all messages in a conversation with another user"""
    uid = user["id"]
    msgs = db.query(Message).filter(
        ((Message.sender_id == uid) & (Message.receiver_id == user_id)) |
        ((Message.sender_id == user_id) & (Message.receiver_id == uid))
    ).order_by(Message.created_at.asc()).all()
    
    result = []
    for m in msgs:
        msg_dict = {c.name: getattr(m, c.name) for c in m.__table__.columns}
        msg_dict["created_at"] = m.created_at.isoformat()
        # Include sender info
        sender = db.query(User).filter(User.id == m.sender_id).first()
        if sender:
            msg_dict["sender_name"] = f"{sender.first_name} {sender.last_name}"
            msg_dict["sender_role"] = sender.role
            msg_dict["sender_visitor_type"] = sender.visitor_type
        result.append(msg_dict)
    
    return result

# ============== PORTFOLIO ROUTES ==============

@api_router.post("/portfolio/upload")
async def upload_portfolio_item(
    file: UploadFile = File(...),
    file_type: str = Form(...),
    title: str = Form(...),
    description: str = Form(""),
    user = Depends(require_artist_or_admin),
    db: Session = Depends(get_db)
):
    ext = Path(file.filename).suffix.lower()
    # Map file_type to folder
    folder_map = {'image': 'portfolio/images', 'document': 'portfolio/docs', 'video': 'portfolio/videos'}
    folder = folder_map.get(file_type, 'portfolio/others')
    
    (UPLOADS_DIR / folder).mkdir(parents=True, exist_ok=True)
    fid = str(uuid.uuid4())
    path = UPLOADS_DIR / folder / f"{fid}{ext}"
    
    with open(path, "wb") as buf:
        shutil.copyfileobj(file.file, buf)
    
    url = f"/uploads/{folder}/{fid}{ext}"
    
    db_user = db.query(User).filter(User.id == user["id"]).first()
    portfolio = dict(db_user.portfolio)
    
    item = {"id": fid, "url": url, "title": title, "description": description, "filename": file.filename}
    
    if file_type == 'image': portfolio["images"].append(item)
    elif file_type == 'video': portfolio["videos"].append(item)
    else: portfolio["documents"].append(item)
    
    db.query(User).filter(User.id == user["id"]).update({"portfolio": portfolio})
    db.commit()
    return item

@api_router.post("/portfolio/video")
async def upload_portfolio_video(
    file: UploadFile = File(...),
    title: str = Form(...),
    description: str = Form(""),
    user = Depends(require_artist_or_admin),
    db: Session = Depends(get_db)
):
    """Refactored to handle direct video file upload"""
    return await upload_portfolio_item(file, 'video', title, description, user, db)

@api_router.delete("/portfolio/{item_type}/{item_id}")
async def delete_portfolio_item(item_type: str, item_id: str, user = Depends(require_artist_or_admin), db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == user["id"]).first()
    portfolio = dict(db_user.portfolio)
    
    # item_type is 'images', 'videos', or 'documents'
    if item_type not in portfolio: raise HTTPException(status_code=400, detail="Invalid type")
    
    # Find and delete
    original_len = len(portfolio[item_type])
    portfolio[item_type] = [item for item in portfolio[item_type] if item["id"] != item_id]
    
    if len(portfolio[item_type]) == original_len:
        raise HTTPException(status_code=404, detail="Item not found")
        
    db.query(User).filter(User.id == user["id"]).update({"portfolio": portfolio})
    db.commit()
    return {"ok": True}

# ============== PROJECTS ROUTES ==============

@api_router.post("/projects")
async def create_proj(data: ProjectCreate, user = Depends(require_artist_or_admin), db: Session = Depends(get_db)):
    pid = str(uuid.uuid4())
    # Handle ISO dates cleanly
    start = datetime.fromisoformat(data.start_date.replace("Z", "+00:00")) if data.start_date else datetime.utcnow()
    end = datetime.fromisoformat(data.end_date.replace("Z", "+00:00")) if data.end_date else None
    
    p = Project(
        id=pid, creator_id=user["id"], title=data.title, description=data.description, 
        sector=data.sector, looking_for=data.looking_for,
        collaboration_type=data.collaboration_type,
        start_date=start,
        end_date=end,
        location=data.location
    )
    db.add(p)
    db.commit()
    return {"id": pid}

@api_router.get("/projects")
async def get_projs(
    sector: Optional[str] = None, 
    status: Optional[str] = None,
    collaboration_type: Optional[str] = None,
    skip: int = 0, limit: int = 20, db: Session = Depends(get_db)
):
    q = db.query(Project)
    if sector: q = q.filter(Project.sector == sector)
    if collaboration_type: q = q.filter(Project.collaboration_type == collaboration_type)
    
    # We fetch everything up to a limit and compute the status
    objs = q.offset(skip).limit(limit).all()
    res = []
    now = datetime.utcnow()
    
    for o in objs:
        # compute dynamic status based on dates
        # open-ended ends -> ongoing
        computed_status = "ongoing"
        if o.start_date and now < o.start_date:
            computed_status = "upcoming"
        elif o.end_date and now > o.end_date:
            computed_status = "past"
            
        # Optional filter by computed status
        if status and computed_status != status:
            continue
            
        d = {c.name: getattr(o, c.name) for c in o.__table__.columns}
        # Format the datetimes to strings for JSON
        if o.start_date: d["start_date"] = o.start_date.isoformat()
        if o.end_date: d["end_date"] = o.end_date.isoformat()
        if o.created_at: d["created_at"] = o.created_at.isoformat()
        
        d["status"] = computed_status
        u = db.query(User).filter(User.id == o.creator_id).first()
        d["creator"] = sanitize_user({c.name: getattr(u, c.name) for c in u.__table__.columns}) if u else None
        res.append(d)
        
    return res

# ============== STATISTICS ROUTES ==============
# ============== STATISTICS ROUTES ==============
@api_router.get("/statistics/collaborations")
async def get_collaboration_statistics(sector: Optional[str] = None, user = Depends(require_paid_institution), db: Session = Depends(get_db)):
    """Detailed collaboration metrics and visitor interest"""
    from collections import defaultdict
    
    project_query = db.query(Project)
    if sector:
        project_query = project_query.filter(Project.sector == sector)
    
    user_query = db.query(User).filter(User.role == "artist")
    if sector:
        user_query = user_query.filter(User.sector == sector)

    # 1. By Type
    local = project_query.filter(Project.collaboration_type == "local").count()
    intra_african = project_query.filter(Project.collaboration_type == "intra_african").count()
    by_type = {"local": local, "intra_african": intra_african}

    # 2. By Status (computed)
    now = datetime.utcnow()
    projects = project_query.with_entities(Project.start_date, Project.end_date).all()
    by_status = {"upcoming": 0, "ongoing": 0, "past": 0}
    for p in projects:
        start_d, end_d = p
        if start_d and now < start_d:
            by_status["upcoming"] += 1
        elif end_d and now > end_d:
            by_status["past"] += 1
        else:
            by_status["ongoing"] += 1

    # 3. By Month (timeline)
    by_month_counts = defaultdict(int)
    all_projects = project_query.with_entities(Project.start_date).all()
    for p in all_projects:
        d = p[0] or datetime.utcnow()
        month_str = d.strftime("%Y-%m")
        by_month_counts[month_str] += 1
    by_month = [{"month": m, "count": by_month_counts[m]} for m in sorted(by_month_counts.keys())[-12:]]

    # 4. By Country (derive from project creator's country)
    country_rows = db.query(User.country, func.count(Project.id))\
        .join(Project, Project.creator_id == User.id)
    if sector:
        country_rows = country_rows.filter(Project.sector == sector)
    country_rows = country_rows.group_by(User.country).all()
    by_country = [{"country": c[0], "count": c[1]} for c in country_rows if c[0]]

    # 5. By Country Pair (Intra-African)
    # We will show statistics per country-pair by counting projects where creators are from different countries.
    all_proj_data = project_query.with_entities(Project.id, Project.creator_id, Project.collaborators, Project.collaboration_type).all()
    country_gender_map = {}  # (countryA, countryB) -> {men, women, other}
    
    for proj_row in all_proj_data:
        if proj_row.collaboration_type != "intra_african": continue
        
        proj_creator = db.query(User.country, User.gender).filter(User.id == proj_row.creator_id).first()
        if not proj_creator or not proj_creator[0]: continue
        creator_country = proj_creator[0]
        
        collabs = proj_row.collaborators if proj_row.collaborators else []
        if not isinstance(collabs, list): continue
        for c in collabs:
            collab_id = c.get('user_id') if isinstance(c, dict) else c
            if not collab_id: continue
            collab_user = db.query(User.country, User.gender).filter(User.id == collab_id).first()
            if not collab_user or not collab_user[0]: continue
            if collab_user[0] == creator_country: continue  # same country skip
            
            a, b = sorted([creator_country, collab_user[0]])
            key = (a, b)
            if key not in country_gender_map:
                country_gender_map[key] = {"men": 0, "women": 0, "other": 0}
            g = (collab_user[1] or "").lower()
            if g in ("male", "homme"): country_gender_map[key]["men"] += 1
            elif g in ("female", "femme"): country_gender_map[key]["women"] += 1
            else: country_gender_map[key]["other"] += 1

    by_country_gender = []
    for (ca, cb), counts in country_gender_map.items():
        total = counts["men"] + counts["women"] + counts["other"]
        by_country_gender.append({
            "country_a": ca, "country_b": cb,
            "men": counts["men"], "women": counts["women"], "other": counts["other"],
            "total": total
        })
    by_country_gender.sort(key=lambda x: -x["total"])
    by_country_gender = by_country_gender[:5] # Requested: Top 5 intra-African country pairs

    # 6. By Gender + Domain: artist counts by domain and gender
    domain_gender_q = db.query(User.domain, User.sector, User.gender, func.count(User.id))\
        .filter(User.role == "artist", User.domain != None, User.gender != None)
    if sector:
        domain_gender_q = domain_gender_q.filter(User.sector == sector)
    domain_gender_rows = domain_gender_q.group_by(User.domain, User.sector, User.gender).all()

    domain_gender_map = {}
    for row in domain_gender_rows:
        domain, sec, gender, cnt = row
        key = (domain or "", sec or "")
        if key not in domain_gender_map:
            domain_gender_map[key] = {"women": 0, "men": 0, "other": 0}
        g = (gender or "").lower()
        if g in ("female", "femme"): domain_gender_map[key]["women"] += cnt
        elif g in ("male", "homme"): domain_gender_map[key]["men"] += cnt
        else: domain_gender_map[key]["other"] += cnt

    by_gender_domain = []
    for (domain, sec), counts in domain_gender_map.items():
        total = counts["women"] + counts["men"] + counts["other"]
        by_gender_domain.append({
            "domain": domain, "sector": sec,
            "women": counts["women"], "men": counts["men"], "other": counts["other"],
            "total": total
        })
    by_gender_domain.sort(key=lambda x: -x["total"])

    # 7. By Country + Gender + Domain (artists + visitor interest)
    cg_domain_q = db.query(User.country, User.gender, User.domain, User.sector, func.count(User.id))\
        .filter(User.role == "artist", User.country != None, User.gender != None, User.domain != None)
    if sector:
        cg_domain_q = cg_domain_q.filter(User.sector == sector)
    cg_domain_rows = cg_domain_q.group_by(User.country, User.gender, User.domain, User.sector).all()

    by_country_gender_domain = []
    for row in cg_domain_rows:
        country, gender, domain, sec, artist_cnt = row
        # Count visitor views for artists matching this country+gender+domain
        artist_id_q = db.query(User.id).filter(
            User.role == "artist", User.country == country,
            User.gender == gender, User.domain == domain
        )
        if sector:
            artist_id_q = artist_id_q.filter(User.sector == sector)
        artist_ids = artist_id_q.all()
        artist_id_list = [r[0] for r in artist_ids]
        
        visitor_interest = 0
        visitor_views = 0
        if artist_id_list:
            visitor_interest = db.query(func.count(Message.id)).filter(
                Message.receiver_id.in_(artist_id_list),
                Message.sender_type == "visitor"
            ).scalar() or 0
            visitor_views = db.query(VisitorView).filter(
                VisitorView.artist_id.in_(artist_id_list),
                VisitorView.visitor_id != None
            ).count()
            
        by_country_gender_domain.append({
            "country": country, "gender": gender, "domain": domain, "sector": sec or "",
            "artist_count": artist_cnt, "visitor_interest_count": visitor_interest,
            "visitor_views_count": visitor_views
        })
    by_country_gender_domain.sort(key=lambda x: -x["visitor_interest_count"])

    return {
        "by_type": by_type,
        "by_status": by_status,
        "by_month": by_month,
        "by_country": by_country,
        "by_country_pair": by_country_gender, # Updated label to be more descriptive
        "by_gender_domain": by_gender_domain,
        "by_country_gender_domain": by_country_gender_domain
    }

@api_router.get("/statistics/overview")
async def get_statistics_overview(user = Depends(get_optional_user), db: Session = Depends(get_db)):
    """Public overview statistics"""
    total_artists = db.query(User).filter(User.role == "artist", User.profile_tag == "artist").count()
    total_professionals = db.query(User).filter(User.role == "artist", User.profile_tag == "professional").count()
    total_media = db.query(User).filter(User.role == "artist", User.profile_tag == "media").count()
    
    total_posts = db.query(Post).filter(Post.is_active == True).count()
    total_projects = db.query(Project).count()
    total_likes = db.query(Like).count()
    total_comments = db.query(Comment).filter(Comment.is_active == True).count()
    
    # Collaborations
    total_collaborations = db.query(Project).filter(Project.collaborators != "[]").count()
    total_intra_african = db.query(Project).filter(Project.collaboration_type == "intra_african").count()
    
    sectors = db.query(User.sector, func.count(User.id)).filter(User.role == "artist", User.sector != None).group_by(User.sector).all()
    subregions = db.query(User.subregion, func.count(User.id)).filter(User.role == "artist", User.subregion != None).group_by(User.subregion).all()
    
    return {
        "total_artists": total_artists,
        "total_professionals": total_professionals,
        "total_media": total_media,
        "total_posts": total_posts,
        "total_projects": total_projects,
        "total_collaborations": total_collaborations,
        "total_intra_african_projects": total_intra_african,
        "total_interactions": total_likes + total_comments,
        "by_sector": {s[0]: s[1] for s in sectors},
        "by_subregion": {s[0]: s[1] for s in subregions}
    }

@api_router.get("/statistics/detailed")
async def get_detailed_statistics(
    sector: Optional[str] = None, 
    profile_tag: Optional[str] = None,
    user = Depends(require_paid_institution), 
    db: Session = Depends(get_db)
):
    """Detailed statistics - Paid Institutions and Admins only"""
    
    base_query = db.query(User).filter(User.role == "artist")
    if sector:
        base_query = base_query.filter(User.sector == sector)
    if profile_tag and profile_tag != "all":
        base_query = base_query.filter(User.profile_tag == profile_tag)

    project_query = db.query(Project)
    if sector:
        project_query = project_query.filter(Project.sector == sector)
    
    # === GENDER DISTRIBUTION ===
    genders = db.query(User.gender, func.count(User.id)).filter(User.role == "artist", User.gender != None)
    if sector: genders = genders.filter(User.sector == sector)
    if profile_tag and profile_tag != "all": genders = genders.filter(User.profile_tag == profile_tag)
    genders = genders.group_by(User.gender).all()
    
    gender_data = {g[0]: g[1] for g in genders}
    total_artists = sum(gender_data.values()) if gender_data else 1
    gender_percentages = {g: round((c / total_artists) * 100, 1) for g, c in gender_data.items()}
    
    # === COLLABORATIONS ===
    total_collaborations = project_query.filter(Project.collaborators != "[]").count()
    
    # === BY COUNTRY & DOMAIN ===
    countries_query = db.query(User.country, func.count(User.id)).filter(User.role == "artist", User.country != None)
    if sector: countries_query = countries_query.filter(User.sector == sector)
    if profile_tag and profile_tag != "all": countries_query = countries_query.filter(User.profile_tag == profile_tag)
    countries = countries_query.group_by(User.country).order_by(func.count(User.id).desc()).limit(60).all()
    
    domains_query = db.query(User.domain, func.count(User.id)).filter(User.role == "artist", User.domain != None)
    if sector: domains_query = domains_query.filter(User.sector == sector)
    if profile_tag and profile_tag != "all": domains_query = domains_query.filter(User.profile_tag == profile_tag)
    domains = domains_query.group_by(User.domain).order_by(func.count(User.id).desc()).limit(50).all()
    
    # === GENDER BY SUBREGION ===
    gender_subreq_query = db.query(User.subregion, User.gender, func.count(User.id)).filter(User.role == "artist", User.subregion != None, User.gender != None)
    if sector: gender_subreq_query = gender_subreq_query.filter(User.sector == sector)
    if profile_tag and profile_tag != "all": gender_subreq_query = gender_subreq_query.filter(User.profile_tag == profile_tag)
    gender_subreq = gender_subreq_query.group_by(User.subregion, User.gender).all()
    
    # === LOCAL VS INTRA-AFRICAN ===
    local_collabs = project_query.filter(Project.collaboration_type == "local").count()
    intra_african_collabs = project_query.filter(Project.collaboration_type == "intra_african").count()
    
    return {
        "by_gender": gender_data,
        "gender_percentages": gender_percentages,
        "collaborations": {
            "total": total_collaborations,
            "local": local_collabs,
            "intra_african": intra_african_collabs
        },
        "by_country": {c[0]: c[1] for c in countries},
        "by_domain": {d[0]: d[1] for d in domains},
        "gender_by_subregion": [{"subregion": row[0], "gender": row[1], "count": row[2]} for row in gender_subreq],
        "activity": {
            "total_posts": db.query(Post).filter(Post.is_active == True).count(),
            "total_likes": db.query(Like).count(),
            "total_comments": db.query(Comment).filter(Comment.is_active == True).count()
        }
    }


# ============== SEED DATA ==============

@api_router.post("/payments/mock-checkout")
async def mock_checkout(user = Depends(get_current_user), db: Session = Depends(get_db)):
    """Simulate payment for institution — grants access_code"""
    if user.get("role") != "institution":
        raise HTTPException(status_code=403, detail="Only institutions can purchase access")

    db_user = db.query(User).filter(User.id == user["id"]).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    # Already paid — return existing code
    if db_user.has_paid and db_user.access_code:
        return {
            "access_code": db_user.access_code,
            "paid_at": db_user.paid_at,
            "message": "Access already active"
        }

    access_code = str(uuid.uuid4())
    paid_at = datetime.now(timezone.utc).isoformat()

    db_user.has_paid = True
    db_user.access_code = access_code
    db_user.paid_at = paid_at
    db.commit()
    db.refresh(db_user)

    return {
        "access_code": access_code,
        "paid_at": paid_at,
        "message": "Payment successful — access granted"
    }

@api_router.get("/payments/status")
async def get_payment_status(user = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get current institution payment status"""
    db_user = db.query(User).filter(User.id == user["id"]).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "has_paid": db_user.has_paid or False,
        "access_code": db_user.access_code,
        "paid_at": db_user.paid_at,
    }

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