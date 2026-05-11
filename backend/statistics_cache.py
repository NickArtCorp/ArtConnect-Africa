"""
Cache mechanism for multi-level statistics
TTL: 24 hours
"""
from sqlalchemy import Column, String, JSON, DateTime, create_engine, Integer
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import Session
from database import StatisticsCache, Base
from datetime import datetime, timedelta
import json
import hashlib


def generate_cache_key(query_type: str, country: str = None, city: str = None, sector: str = None, **kwargs) -> str:
    """Generate unique cache key from query parameters"""
    key_parts = [query_type, country or "all", city or "all", sector or "all"]
    for k, v in kwargs.items():
        key_parts.append(f"{k}={v}")
    
    key_string = "|".join(str(p) for p in key_parts)
    return hashlib.md5(key_string.encode()).hexdigest()


def get_cached_statistics(db: Session, query_type: str, country: str = None, city: str = None, sector: str = None, **kwargs) -> dict | None:
    """Retrieve cached data if not expired"""
    cache_key = generate_cache_key(query_type, country, city, sector, **kwargs)
    
    cache_record = db.query(StatisticsCache).filter(
        StatisticsCache.cache_key == cache_key
    ).first()
    
    if cache_record and not cache_record.is_expired():
        return cache_record.data
    
    # Delete expired cache
    if cache_record and cache_record.is_expired():
        db.delete(cache_record)
        db.commit()
    
    return None


def set_cached_statistics(db: Session, query_type: str, data: dict, country: str = None, city: str = None, sector: str = None, ttl_hours: int = 24, **kwargs) -> None:
    """Cache statistics data with TTL"""
    cache_key = generate_cache_key(query_type, country, city, sector, **kwargs)
    
    # Delete existing cache if any
    existing = db.query(StatisticsCache).filter(
        StatisticsCache.cache_key == cache_key
    ).first()
    if existing:
        db.delete(existing)
    
    cache_record = StatisticsCache(
        id=str(__import__('uuid').uuid4()),
        cache_key=cache_key,
        country=country,
        city=city,
        sector=sector,
        query_type=query_type,
        data=data,
        created_at=datetime.utcnow(),
        expires_at=datetime.utcnow() + timedelta(hours=ttl_hours)
    )
    
    db.add(cache_record)
    db.commit()


def clear_country_cache(db: Session, country: str = None) -> int:
    """Clear all cache records for a country (when data changes)"""
    if country:
        deleted = db.query(StatisticsCache).filter(
            StatisticsCache.country == country
        ).delete()
    else:
        deleted = db.query(StatisticsCache).delete()
    
    db.commit()
    return deleted
