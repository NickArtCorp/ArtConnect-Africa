# Art Connect Africa - Product Requirements Document

## Énoncé du Problème Original
Créer une plateforme numérique pour l'écosystème artistique africain permettant de recenser, connecter et valoriser les acteurs culturels en Afrique.

## Architecture
- **Frontend**: React 18 + Tailwind CSS + Shadcn UI + Framer Motion + Zustand
- **Backend**: FastAPI + Motor (MongoDB async)
- **Database**: MongoDB
- **Langues**: Français / Anglais (bilingue)

## User Personas
1. **Artiste Africain** - Créateur cherchant à présenter son travail et trouver des collaborateurs
2. **Institution/Ministère** - Organisation cherchant des données démographiques sur les artistes
3. **Visiteur** - Découvre les artistes et leurs œuvres

## Core Requirements (Static)
1. ✅ Module d'Inscription complet (Nom, Prénom, Pays, Sous-région auto, Genre, Secteur, Domaine, Année de création, Bio, Infos complémentaires)
2. ✅ Espace Portfolio (Documents PDF, Images, Liens Vidéo)
3. ✅ Moteur de Collaboration (Messagerie directe, Projets collaboratifs)
4. ✅ Statistiques & Analytics (Démographie par pays, région, secteur, genre)
5. ✅ Accès Institutionnel (Portail Premium simulé)
6. ✅ Interface bilingue FR/EN
7. ✅ Thème clair/sombre

## What's Been Implemented (Jan 2026)
- ✅ Landing page avec artistes en vedette et statistiques
- ✅ Système d'authentification (inscription/connexion)
- ✅ Page Découvrir avec filtres avancés (sous-région, pays, secteur, domaine, genre)
- ✅ Profils artistes avec portfolio (documents, images, vidéos)
- ✅ Système de messagerie 1-à-1 complet
- ✅ Dashboard avec gestion du portfolio
- ✅ Page Projets de collaboration
- ✅ Page Statistiques (publiques et institutionnelles)
- ✅ Page Paramètres pour édition du profil
- ✅ Toggle de langue FR/EN
- ✅ Toggle de thème clair/sombre
- ✅ Design africain avec couleurs chaudes
- ✅ 8 artistes exemples de différents pays africains

## Prioritized Backlog

### P0 - Critique
- Aucun item restant

### P1 - Important
- Upload d'images de portfolio vers stockage cloud (actuellement local)
- Notifications en temps réel pour les messages

### P2 - Nice to Have
- Recherche full-text avancée
- Système de vérification des artistes
- Galerie publique des œuvres
- Intégration paiement réel pour accès institutionnel

## Next Tasks
1. Configurer Cloudinary pour upload de fichiers cloud
2. Ajouter WebSocket pour messagerie en temps réel
3. Implémenter système de notifications
4. Ajouter verification badge pour artistes confirmés
