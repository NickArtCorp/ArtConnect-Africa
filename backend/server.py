from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import hashlib
import secrets

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer(auto_error=False)

# Simple token storage (in production, use Redis or JWT)
active_tokens = {}

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def generate_token() -> str:
    return secrets.token_urlsafe(32)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = credentials.credentials
    if token not in active_tokens:
        raise HTTPException(status_code=401, detail="Invalid token")
    user_id = active_tokens[token]
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
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
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    return user

# Models
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    artist_type: str = "Visual Artist"
    bio: Optional[str] = ""
    avatar: Optional[str] = ""

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    email: str
    name: str
    artist_type: str
    bio: str
    avatar: str
    created_at: str
    is_featured: bool = False

class UserUpdate(BaseModel):
    name: Optional[str] = None
    artist_type: Optional[str] = None
    bio: Optional[str] = None
    avatar: Optional[str] = None

class MessageCreate(BaseModel):
    receiver_id: str
    content: str

class MessageResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    sender_id: str
    receiver_id: str
    content: str
    created_at: str
    read: bool = False

class ConversationResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user: UserResponse
    last_message: Optional[MessageResponse] = None
    unread_count: int = 0

# Auth Routes
@api_router.post("/auth/register")
async def register(user_data: UserCreate):
    # Check if email exists
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "email": user_data.email,
        "password": hash_password(user_data.password),
        "name": user_data.name,
        "artist_type": user_data.artist_type,
        "bio": user_data.bio or "",
        "avatar": user_data.avatar or f"https://api.dicebear.com/7.x/avataaars/svg?seed={user_id}",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "is_featured": False
    }
    
    await db.users.insert_one(user_doc)
    
    # Generate token
    token = generate_token()
    active_tokens[token] = user_id
    
    # Remove password from response
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

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(user = Depends(get_current_user)):
    return user

# Artist Routes
@api_router.get("/artists", response_model=List[UserResponse])
async def get_artists(
    search: Optional[str] = None,
    artist_type: Optional[str] = None,
    featured: Optional[bool] = None,
    limit: int = 20,
    skip: int = 0
):
    query = {}
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"bio": {"$regex": search, "$options": "i"}}
        ]
    if artist_type and artist_type != "All":
        query["artist_type"] = artist_type
    if featured is not None:
        query["is_featured"] = featured
    
    artists = await db.users.find(query, {"_id": 0, "password": 0}).skip(skip).limit(limit).to_list(limit)
    return artists

@api_router.get("/artists/featured", response_model=List[UserResponse])
async def get_featured_artists(limit: int = 6):
    artists = await db.users.find({"is_featured": True}, {"_id": 0, "password": 0}).limit(limit).to_list(limit)
    return artists

@api_router.get("/artists/{artist_id}", response_model=UserResponse)
async def get_artist(artist_id: str):
    artist = await db.users.find_one({"id": artist_id}, {"_id": 0, "password": 0})
    if not artist:
        raise HTTPException(status_code=404, detail="Artist not found")
    return artist

@api_router.put("/artists/me", response_model=UserResponse)
async def update_profile(update_data: UserUpdate, user = Depends(get_current_user)):
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    if update_dict:
        await db.users.update_one({"id": user["id"]}, {"$set": update_dict})
    
    updated_user = await db.users.find_one({"id": user["id"]}, {"_id": 0, "password": 0})
    return updated_user

# Message Routes
@api_router.post("/messages", response_model=MessageResponse)
async def send_message(message_data: MessageCreate, user = Depends(get_current_user)):
    # Check if receiver exists
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

@api_router.get("/messages/conversations", response_model=List[ConversationResponse])
async def get_conversations(user = Depends(get_current_user)):
    user_id = user["id"]
    
    # Get all unique users this user has had conversations with
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
        other_user = await db.users.find_one({"id": other_user_id}, {"_id": 0, "password": 0})
        if other_user:
            last_msg = conv["last_message"]
            last_msg.pop("_id", None)
            conversations.append({
                "user": other_user,
                "last_message": last_msg,
                "unread_count": conv["unread_count"]
            })
    
    # Sort by last message time
    conversations.sort(key=lambda x: x["last_message"]["created_at"] if x["last_message"] else "", reverse=True)
    
    return conversations

@api_router.get("/messages/{other_user_id}", response_model=List[MessageResponse])
async def get_messages(other_user_id: str, user = Depends(get_current_user)):
    user_id = user["id"]
    
    # Mark messages as read
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

# Seed data endpoint (for development)
@api_router.post("/seed")
async def seed_data():
    # Check if data already exists
    existing = await db.users.count_documents({})
    if existing > 0:
        return {"message": "Data already seeded"}
    
    # Create sample artists
    sample_artists = [
        {
            "id": str(uuid.uuid4()),
            "email": "luna@artsync.com",
            "password": hash_password("password123"),
            "name": "Luna Rivera",
            "artist_type": "Digital Artist",
            "bio": "Creating digital dreamscapes and surreal compositions. Specializing in concept art and character design.",
            "avatar": "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "is_featured": True
        },
        {
            "id": str(uuid.uuid4()),
            "email": "marcus@artsync.com",
            "password": hash_password("password123"),
            "name": "Marcus Chen",
            "artist_type": "Music Producer",
            "bio": "Electronic music producer blending ambient textures with driving beats. Open to collaborations.",
            "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "is_featured": True
        },
        {
            "id": str(uuid.uuid4()),
            "email": "sophie@artsync.com",
            "password": hash_password("password123"),
            "name": "Sophie Anders",
            "artist_type": "Visual Designer",
            "bio": "Brand identity designer with a passion for minimalist aesthetics and thoughtful typography.",
            "avatar": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "is_featured": True
        },
        {
            "id": str(uuid.uuid4()),
            "email": "kai@artsync.com",
            "password": hash_password("password123"),
            "name": "Kai Nakamura",
            "artist_type": "Photographer",
            "bio": "Street photographer capturing urban poetry. Always seeking the extraordinary in the mundane.",
            "avatar": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "is_featured": True
        },
        {
            "id": str(uuid.uuid4()),
            "email": "zara@artsync.com",
            "password": hash_password("password123"),
            "name": "Zara Okonkwo",
            "artist_type": "Painter",
            "bio": "Contemporary abstract painter exploring themes of identity and belonging through bold colors.",
            "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "is_featured": True
        },
        {
            "id": str(uuid.uuid4()),
            "email": "alex@artsync.com",
            "password": hash_password("password123"),
            "name": "Alex Moreau",
            "artist_type": "3D Artist",
            "bio": "Creating immersive 3D environments and characters. Passionate about game art and virtual worlds.",
            "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "is_featured": True
        }
    ]
    
    await db.users.insert_many(sample_artists)
    
    return {"message": "Sample data seeded successfully", "count": len(sample_artists)}

# Health check
@api_router.get("/")
async def root():
    return {"message": "ArtSync API is running"}

@api_router.get("/health")
async def health():
    return {"status": "healthy"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
