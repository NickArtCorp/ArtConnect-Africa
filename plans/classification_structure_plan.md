# Enhanced Classification System Plan

## Overview
This document outlines the enhanced classification system for the ArtConnect Africa platform that will provide separate categorization for artists, professionals, and media users according to the requirement: "Normalement pour les artistes et les professionnels et média il doit y avoir les secteur d'activité, le domaine, la spécialité et le métier."

## Current State
- **Existing Fields**: `sector` (artistic sectors), `domain` (artistic domains)
- **Profile Types**: artist, professional, media
- **Current Limitation**: One-size-fits-all classification that doesn't reflect different career paths for different user types

## Proposed Structure

### 1. Activity Sectors (Secteur d'activité)
These will be separate from artistic sectors and more aligned with business/institutional sectors:

```
ACTIVITY_SECTORS = {
    "professional": [
        {"name": "Creative Industries", "name_fr": "Industries Créatives"},
        {"name": "Media & Communications", "name_fr": "Médias & Communication"},
        {"name": "Education & Training", "name_fr": "Éducation & Formation"},
        {"name": "Cultural Institutions", "name_fr": "Institutions Culturelles"},
        {"name": "Arts Management", "name_fr": "Gestion des Arts"},
        {"name": "Entertainment Business", "name_fr": "Industrie du Divertissement"},
        {"name": "Digital Media", "name_fr": "Média Numérique"},
        {"name": "Publishing & Journalism", "name_fr": "Édition & Journalisme"},
        {"name": "Marketing & PR", "name_fr": "Marketing & Relations Publiques"},
        {"name": "Government & Policy", "name_fr": "Gouvernement & Politique"},
        {"name": "NGO & Development", "name_fr": "ONG & Développement"},
        {"name": "Technology & Innovation", "name_fr": "Technologie & Innovation"}
    ],
    "media": [
        {"name": "Broadcast Media", "name_fr": "Médias de Radiodiffusion"},
        {"name": "Print Media", "name_fr": "Médias Imprimés"},
        {"name": "Digital Media", "name_fr": "Média Numérique"},
        {"name": "Social Media", "name_fr": "Réseaux Sociaux"},
        {"name": "Investigative Journalism", "name_fr": "Journalisme d'Investigation"},
        {"name": "Cultural Reporting", "name_fr": "Reportage Culturel"},
        {"name": "Entertainment News", "name_fr": "Actualités du Divertissement"},
        {"name": "Arts Criticism", "name_fr": "Critique d'Art"},
        {"name": "Documentary Production", "name_fr": "Production Documentaire"},
        {"name": "Content Creation", "name_fr": "Création de Contenu"}
    ]
}
```

### 2. Professional Specialties (Spécialité)
Specialized areas within their respective activity sectors:

```
PROFESSIONAL_SPECIALTIES = {
    "Creative Industries": [
        {"name": "Event Planning", "name_fr": "Organisation d'Événements"},
        {"name": "Talent Management", "name_fr": "Gestion de Talents"},
        {"name": "Production Coordination", "name_fr": "Coordination de Production"},
        {"name": "Art Consulting", "name_fr": "Conseil Artistique"},
        {"name": "Cultural Programming", "name_fr": "Programmation Culturelle"}
    ],
    "Media & Communications": [
        {"name": "Public Relations", "name_fr": "Relations Publiques"},
        {"name": "Brand Communications", "name_fr": "Communication de Marque"},
        {"name": "Digital Marketing", "name_fr": "Marketing Digital"},
        {"name": "Content Strategy", "name_fr": "Stratégie de Contenu"},
        {"name": "Social Media Management", "name_fr": "Gestion des Réseaux Sociaux"}
    ],
    // ... and so on for each activity sector
}

MEDIA_SPECIALTIES = {
    "Broadcast Media": [
        {"name": "Television Production", "name_fr": "Production Télévisuelle"},
        {"name": "Radio Broadcasting", "name_fr": "Radiodiffusion"},
        {"name": "Live Event Coverage", "name_fr": "Couverture d'Événements en Direct"},
        {"name": "Studio Operations", "name_fr": "Opérations Studio"},
        {"name": "Technical Direction", "name_fr": "Direction Technique"}
    ],
    "Digital Media": [
        {"name": "Online Journalism", "name_fr": "Journalisme en Ligne"},
        {"name": "Podcasting", "name_fr": "Podcast"},
        {"name": "Video Blogging", "name_fr": "Blog Vidéo"},
        {"name": "Digital Content Creation", "name_fr": "Création de Contenu Numérique"},
        {"name": "Streaming Production", "name_fr": "Production de Diffusion en Continu"}
    ]
    // ... and so on for each media sector
}
```

### 3. Professional Professions (Métier)
Specific job titles/roles for professionals and media:

```
PROFESSIONS = {
    "professional": [
        {"name": "Arts Administrator", "name_fr": "Administrateur des Arts"},
        {"name": "Cultural Program Manager", "name_fr": "Responsable de Programme Culturel"},
        {"name": "Event Coordinator", "name_fr": "Coordinateur d'Événements"},
        {"name": "Gallery Director", "name_fr": "Directeur de Galerie"},
        {"name": "Curator", "name_fr": "Conservateur"},
        {"name": "Art Consultant", "name_fr": "Conseiller Artistique"},
        {"name": "Creative Producer", "name_fr": "Producteur Créatif"},
        {"name": "Cultural Entrepreneur", "name_fr": "Entrepreneur Culturel"},
        {"name": "Marketing Manager", "name_fr": "Responsable Marketing"},
        {"name": "Project Manager", "name_fr": "Chef de Projet"},
        {"name": "Fundraising Specialist", "name_fr": "Spécialiste de Collecte de Fond"},
        {"name": "Policy Advisor", "name_fr": "Conseiller en Politique"}
    ],
    "media": [
        {"name": "Reporter", "name_fr": "Rédacteur"},
        {"name": "Editor", "name_fr": "Éditeur"},
        {"name": "Producer", "name_fr": "Producteur"},
        {"name": "Director", "name_fr": "Réalisateur"},
        {"name": "Broadcast Engineer", "name_fr": "Ingénieur de Radiodiffusion"},
        {"name": "News Anchor", "name_fr": "Présentateur d'Informations"},
        {"name": "Camera Operator", "name_fr": "Opérateur de Caméra"},
        {"name": "Sound Technician", "name_fr": "Technicien du Son"},
        {"name": "Content Creator", "name_fr": "Créateur de Contenu"},
        {"name": "Social Media Manager", "name_fr": "Responsable des Réseaux Sociaux"},
        {"name": "Digital Content Producer", "name_fr": "Producteur de Contenu Numérique"},
        {"name": "Podcast Host", "name_fr": "Animateur de Podcast"}
    ]
}
```

## Implementation Plan

### Phase 1: Database Migration
1. Add new columns to the users table:
   - `activity_sector`: VARCHAR (for professionals and media)
   - `specialty`: VARCHAR (specific expertise area)
   - `profession`: VARCHAR (job title/role)

### Phase 2: Backend Update
1. Define new reference data structures in server.py
2. Update Pydantic models to include new fields
3. Update registration endpoint to accept new fields based on profile type
4. Update user retrieval/update endpoints

### Phase 3: Frontend Updates
1. Update registration forms to show appropriate fields based on profile type
2. Update profile editing interface
3. Update statistics and filtering to incorporate new categories

### Phase 4: Migration Strategy
1. For existing users, preserve current `sector` and `domain` values
2. Allow users to optionally update to the new classification system
3. Provide clear UI guidance during transition

## Validation Criteria
- All three user types (artist, professional, media) have appropriate categorization options
- Artists continue to use existing artistic sectors and domains
- Professionals and media have their own activity sectors, specialties, and professions
- System maintains backward compatibility
- Multi-language support maintained throughout
- Registration workflow remains intuitive and efficient