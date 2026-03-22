# Art Connect Africa - Architecture Technique v2.0

## 📋 VUE D'ENSEMBLE

### Types d'Utilisateurs
| Rôle | Description | Permissions |
|------|-------------|-------------|
| `admin` | Super-utilisateur | Accès total, modération, gestion utilisateurs |
| `artist` | Créateur de contenu | Créer posts, commenter, liker, messagerie |
| `institution` | Gouvernement/Organisation | Lecture seule, statistiques avancées |

---

## 🔐 MODULE 1 — CONTRÔLE D'ACCÈS

### Matrice des Permissions

| Action | Admin | Artiste | Institution |
|--------|-------|---------|-------------|
| Voir feed | ✅ | ✅ | ✅ |
| Créer post | ✅ | ✅ | ❌ |
| Commenter | ✅ | ✅ | ❌ |
| Liker | ✅ | ✅ | ❌ |
| Envoyer message | ✅ | ✅ | ❌ |
| Voir profils | ✅ | ✅ | ✅ |
| Dashboard stats | ✅ | ❌ | ✅ |
| Stats détaillées | ✅ | ❌ | ✅ |
| Modérer contenu | ✅ | ❌ | ❌ |
| Gérer utilisateurs | ✅ | ❌ | ❌ |

### Règles Métier
1. Institution NE PEUT JAMAIS créer, modifier ou interagir avec du contenu
2. Artiste NE PEUT PAS accéder au dashboard institutionnel
3. Admin a tous les droits mais est identifié dans les logs

---

## 📱 MODULE 2 — FEED SOCIAL

### Modèle Post
```
Post {
  id: UUID
  author_id: UUID (ref: User)
  content_type: enum ['text', 'image', 'video']
  text_content: string (optional)
  media_url: string (optional)
  media_thumbnail: string (optional)
  likes_count: int (dénormalisé pour performance)
  comments_count: int (dénormalisé)
  created_at: datetime
  updated_at: datetime
  is_active: boolean
}
```

### Modèle Comment
```
Comment {
  id: UUID
  post_id: UUID (ref: Post)
  author_id: UUID (ref: User)
  content: string
  created_at: datetime
  is_active: boolean
}
```

### Modèle Like
```
Like {
  id: UUID
  post_id: UUID (ref: Post)
  user_id: UUID (ref: User)
  created_at: datetime
  
  // Contrainte: UNIQUE(post_id, user_id)
}
```

### Règles Métier Feed
1. Seuls les artistes et admins peuvent créer des posts
2. Un like est un toggle (créer ou supprimer)
3. Les compteurs sont mis à jour en temps réel
4. Les posts sont triés par date décroissante
5. Pagination par curseur pour performance

---

## 🔍 MODULE 3 — DÉCOUVERTE

### Filtres Disponibles
- Pays (54 pays africains)
- Sous-région (5 régions)
- Secteur artistique (9 secteurs)
- Domaine spécifique (50+ domaines)
- Genre (optionnel)
- Recherche textuelle (nom, bio)

### Affichage
- Grille de cartes responsive
- Photo de profil proéminente
- Badge secteur
- Pays + années d'expérience
- Lien vers profil complet

---

## 📊 MODULE 4 — DASHBOARD INSTITUTION

### Statistiques Globales
```
- total_artists: int
- total_posts: int
- total_interactions: int (likes + comments)
- artists_by_country: {country: count}
- artists_by_region: {region: count}
- artists_by_sector: {sector: count}
- artists_by_gender: {gender: count}
- activity_timeline: [{date, posts, interactions}]
```

### Statistiques Détaillées (Institution Only)
```
- gender_by_country: [{country, gender, count}]
- gender_by_region: [{region, gender, count}]
- sector_by_country: [{country, sector, count}]
- top_active_artists: [anonymized data]
- growth_metrics: {new_artists_month, new_posts_month}
```

### Sécurité Dashboard
1. Middleware vérifie role === 'institution' || role === 'admin'
2. Données personnelles (email, téléphone) JAMAIS exposées
3. Logs d'accès pour audit
4. Rate limiting pour éviter scraping

---

## 🗃️ MODULE 5 — SCHÉMA COMPLET

### User (Extension)
```
User {
  // Existants...
  id, email, password, first_name, last_name, etc.
  
  // Nouveaux champs
  role: enum ['admin', 'artist', 'institution'] // défaut: 'artist'
  
  // Pour institutions
  organization_name: string (optional)
  organization_type: string (optional)
  is_verified: boolean
}
```

### Relations
```
User (1) -----> (N) Post
User (1) -----> (N) Comment
User (1) -----> (N) Like
Post (1) -----> (N) Comment
Post (1) -----> (N) Like
```

### Index Recommandés
- posts: author_id, created_at DESC
- comments: post_id, created_at ASC
- likes: (post_id, user_id) UNIQUE
- users: role, country, sector

---

## 🛡️ MODULE 6 — CONTRAINTES TECHNIQUES

### Frontend
- Dark mode par défaut (déjà implémenté)
- Mobile-first responsive
- Lazy loading des images/vidéos
- Infinite scroll pour le feed
- Optimistic UI pour likes

### Backend
- Middleware de vérification des rôles
- Rate limiting par endpoint
- Validation stricte des inputs
- Sanitization du contenu
- Compression des médias

### Sécurité
- JWT avec expiration courte
- Refresh token rotation
- CORS strict
- Content Security Policy
- Audit logs pour institutions

---

## ⚠️ RISQUES ET PIÈGES

| Risque | Impact | Mitigation |
|--------|--------|------------|
| Données sensibles exposées | Critique | Double vérification avant serialization |
| Performance feed | Élevé | Dénormalisation compteurs, pagination curseur |
| Upload média lourd | Moyen | Limite taille, compression côté client |
| Spam commentaires | Moyen | Rate limiting, modération |
| Escalade privilèges | Critique | Vérification rôle à chaque requête |

---

## 📦 DÉPENDANCES TECHNIQUES

### Backend (Python)
- FastAPI (existant)
- Motor/MongoDB (existant)
- python-multipart (upload fichiers)
- Pillow (compression images)

### Frontend (React)
- Zustand (existant)
- Framer Motion (existant)
- react-intersection-observer (infinite scroll)
- date-fns (formatage dates)

---

## 🚀 ORDRE D'IMPLÉMENTATION

1. ✅ Mise à jour modèle User avec rôles
2. ✅ Middleware de vérification des rôles
3. ✅ API Posts (CRUD)
4. ✅ API Comments
5. ✅ API Likes (toggle)
6. ✅ Feed Frontend
7. ✅ Dashboard Institution
8. ✅ Tests et validation
