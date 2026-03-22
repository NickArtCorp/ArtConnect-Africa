# Art Connect Africa - Product Requirements Document

## Énoncé du Problème Original
Créer une plateforme numérique pour l'écosystème artistique africain avec trois rôles d'utilisateurs distincts:
- **Admin**: Accès total, modération, gestion utilisateurs
- **Artiste**: Création de contenu (posts, likes, commentaires, messagerie)
- **Institution**: Lecture seule, accès aux statistiques détaillées (PAS de création/interaction)

## Architecture
- **Frontend**: React 18 + Tailwind CSS + Shadcn UI + Framer Motion + Zustand
- **Backend**: FastAPI + Motor (MongoDB async)
- **Database**: MongoDB
- **Langues**: Français / Anglais (bilingue)
- **RBAC**: Role-Based Access Control sur tous les endpoints et UI

## User Personas
1. **Artiste Africain** - Créateur cherchant à présenter son travail et interagir avec la communauté
2. **Institution/Ministère** - Organisation accédant aux données démographiques (lecture seule)
3. **Admin** - Modérateur de la plateforme
4. **Visiteur** - Découvre les artistes et leurs œuvres (lecture seule)

## Core Requirements (Static)
1. ✅ Module d'Inscription complet (Nom, Prénom, Pays, Sous-région auto, Genre, Secteur, Domaine, Année de création, Bio)
2. ✅ Espace Portfolio (Documents PDF, Images, Liens Vidéo)
3. ✅ Moteur de Collaboration (Messagerie directe, Projets collaboratifs)
4. ✅ Statistiques & Analytics (Démographie par pays, région, secteur, genre)
5. ✅ Accès Institutionnel (Portail avec statistiques détaillées)
6. ✅ Interface bilingue FR/EN
7. ✅ Thème clair/sombre
8. ✅ **RBAC - Contrôle d'accès basé sur les rôles**
9. ✅ **Feed Social (Posts, Likes, Commentaires)**
10. ✅ **Dashboard Institution avec stats détaillées**

## What's Been Implemented

### Décembre 2025
- ✅ Landing page avec artistes en vedette et statistiques
- ✅ Système d'authentification (inscription/connexion)
- ✅ Page Découvrir avec filtres avancés
- ✅ Profils artistes avec portfolio
- ✅ Système de messagerie 1-à-1 complet
- ✅ Dashboard utilisateur
- ✅ Page Projets de collaboration
- ✅ Page Statistiques (publiques)
- ✅ Toggle de langue FR/EN
- ✅ Toggle de thème clair/sombre
- ✅ Design africain premium avec couleurs chaudes
- ✅ 8 artistes exemples de différents pays africains

### Décembre 2025 - Session actuelle
- ✅ **RBAC complet**: Rôles admin/artist/institution avec permissions distinctes
- ✅ **Feed Social (/feed)**: Posts texte/image/vidéo, likes, commentaires
- ✅ **Dashboard Institution**: Statistiques détaillées par genre, pays, région
- ✅ **Protection des endpoints**: Middleware de vérification des rôles
- ✅ **UI conditionnelle**: Boutons/actions masqués selon le rôle
- ✅ Comptes de test créés: 1 Admin, 1 Institution, 8 Artistes

## Matrice des Permissions RBAC

| Action | Admin | Artiste | Institution |
|--------|-------|---------|-------------|
| Voir feed | ✅ | ✅ | ✅ |
| Créer post | ✅ | ✅ | ❌ |
| Commenter | ✅ | ✅ | ❌ |
| Liker | ✅ | ✅ | ❌ |
| Envoyer message | ✅ | ✅ | ❌ |
| Dashboard stats détaillées | ✅ | ❌ | ✅ |
| Modérer contenu | ✅ | ❌ | ❌ |

## Prioritized Backlog

### P0 - Critique
- Aucun item restant

### P1 - Important
- Upload de médias vers stockage cloud (actuellement serveur local)
- Filtres avancés sur la page Découvrir (pays, région, type d'art)
- Notifications en temps réel pour les messages

### P2 - Nice to Have
- Recherche full-text avancée
- Système de vérification des artistes (badge)
- Galerie publique des œuvres
- Intégration paiement réel pour accès institutionnel premium
- Administration: tableau de bord de modération

## Comptes de Test
| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Artiste | amara.diallo@artconnect.africa | password123 |
| Institution | culture@gov.sn | institution123 |
| Admin | admin@artconnect.africa | admin123 |

## Next Tasks
1. Améliorer la section Découvrir avec filtres dynamiques
2. Configurer stockage cloud pour les uploads de médias
3. Ajouter notifications en temps réel (WebSocket)
4. Ajouter badge de vérification pour artistes confirmés
