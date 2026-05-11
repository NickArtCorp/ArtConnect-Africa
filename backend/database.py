import os
from datetime import datetime
from sqlalchemy import create_engine, Column, String, Integer, Boolean, Text, JSON, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pathlib import Path

# Setup paths
ROOT_DIR = Path(__file__).parent

# SQLite Connection
DATABASE_URL = os.environ.get('SQLITE_URL', f"sqlite:///{ROOT_DIR}/artconnect.db")
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

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
    city = Column(String, nullable=True)
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
    role = Column(String, default="personne_physique")
    organization_name = Column(String, nullable=True)
    visitor_type = Column(String, nullable=True)  # 'individual' | 'organisation'
    is_verified = Column(Boolean, default=False)
    is_featured = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    has_paid = Column(Boolean, default=False)
    access_code = Column(String, nullable=True)
    partner_code = Column(String, unique=True, nullable=True, index=True)
    paid_at = Column(String, nullable=True)
    profile_tag = Column(String, nullable=True)
    employees_count = Column(Integer, nullable=True)
    approval_status = Column(String, default="pending")
    rejection_reason = Column(Text, nullable=True)
    relay_contact = Column(String, nullable=True)
    contact_person_name = Column(String, nullable=True)
    contact_person_email = Column(String, nullable=True)

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
    sender_type = Column(String, default="artist")
    is_visitor = Column(Boolean, default=False)

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
    visitor_id = Column(String, nullable=True)
    artist_id = Column(String, ForeignKey("users.id"))
    viewed_at = Column(DateTime, default=datetime.utcnow)

class StatisticsCache(Base):
    __tablename__ = "statistics_cache"
    id = Column(String, primary_key=True, index=True)
    cache_key = Column(String, unique=True, index=True)
    country = Column(String, nullable=True, index=True)
    city = Column(String, nullable=True, index=True)
    sector = Column(String, nullable=True, index=True)
    query_type = Column(String, index=True)
    data = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime)
    
    def is_expired(self):
        return datetime.utcnow() > self.expires_at if self.expires_at else True
