# Modifications aux Inscriptions et Profils - Résumé

## Vue d'ensemble
Modifications pour ajouter les champs **téléphone** et **adresse** pour tous les utilisateurs, et pour retirer les champs "prénom/nom" de la personne de contact dans les inscriptions des personnes morales.

## Modifications effectuées

### 1. Base de données (Backend)

#### `backend/database.py`
- ✅ Ajouté le champ `phone: Column(String, nullable=True)` au modèle `User`
- ✅ Ajouté le champ `address: Column(Text, nullable=True)` au modèle `User`

#### `backend/server.py`
- ✅ Ajouté les migrations automatiques pour créer les colonnes `phone` et `address` dans la fonction `_run_migrations()`
- ✅ Ajouté les champs `phone` et `address` à la classe `UserCreate` (Pydantic model)
- ✅ Ajouté les champs `phone` et `address` à la classe `UserUpdate` (Pydantic model)
- ✅ Modifié l'endpoint d'enregistrement `/auth/register` pour accepter et stocker ces champs
- ✅ L'endpoint de mise à jour `/artists/me` accepte automatiquement ces champs via `UserUpdate`

#### `backend/migrate_add_phone_address.py` (nouveau fichier)
- Créé un script de migration standalone pour ajouter les colonnes (pour compatibilité avec les déploiements existants)

### 2. Frontend - Formulaires d'inscription

#### `frontend/src/pages/Register.jsx`

**PersonnePhysiqueForm:**
- ✅ Ajouté l'état pour les champs: `phone`, `address`, `website`
- ✅ Ajouté des champs de saisie pour:
  - Téléphone (type "tel")
  - Site web (type "url")
  - Adresse (type textarea)
- ✅ Les champs optionnels apparaissent avant la section "personne de contact"

**PersonneMoraleForm:**
- ✅ RETIRÉ les champs `first_name` et `last_name` du formulaire d'inscription
- ✅ L'inscription ne demande maintenant que:
  - Nom de l'organisation
  - Email
  - Mot de passe
- ✅ Ajouté les champs pour:
  - Téléphone
  - Site web
  - Adresse
- ✅ Gardé la section "Personne de contact" (optionnelle) avec seulement:
  - Nom de la personne de contact
  - Email de la personne de contact

**VisitorForm:**
- ✅ Ajouté les champs:
  - Téléphone
  - Site web
  - Adresse

### 3. Frontend - Profils utilisateur

#### `frontend/src/pages/Settings.jsx`
- ✅ Modifié le state initial pour inclure `phone` et `address`
- ✅ Ajouté les champs de saisie dans le formulaire:
  - Téléphone (type "tel") avec placeholder "+1 (555) 000-0000"
  - Adresse (type textarea)
- ✅ Les champs apparaissent après "Site web" et avant "Personne de contact"

### 4. Traductions

#### `frontend/src/store.js`

**Anglais (EN):**
- ✅ Ajouté: `phone: 'Phone Number'`
- ✅ Ajouté: `address: 'Address'`
- ✅ Ajouté: `addressPlaceholder: 'Street address, city, postal code...'`

**Français (FR):**
- ✅ Ajouté: `phone: 'Numéro de téléphone'`
- ✅ Ajouté: `address: 'Adresse'`
- ✅ Ajouté: `addressPlaceholder: 'Adresse complète, ville, code postal...'`

**Autres langues:**
- Les traductions utiliseront par défaut les textes en anglais (système de fallback existant)

### 5. API Endpoints

Tous les endpoints existants continuent de fonctionner et acceptent automatiquement les nouveaux champs:

- `POST /api/auth/register` - Accepte `phone`, `address`, `website`
- `PUT /api/artists/me` - Accepte `phone`, `address`, `website`
- `GET /api/artists/{artist_id}` - Retourne `phone`, `address`, `website`
- `GET /api/users/{user_id}` - Retourne `phone`, `address`, `website`

## Points clés

### Changements d'expérience utilisateur

1. **Personnes Physiques**: Peuvent maintenant ajouter leur téléphone et adresse à l'inscription et au profil
2. **Personnes Morales**: 
   - À l'inscription: Plus simple, demande seulement le nom de l'organisation, email, mot de passe, et les nouveaux champs (phone, address, website)
   - La "personne de contact" est maintenant optionnelle et ne demande que nom + email
3. **Visiteurs**: Peuvent aussi ajouter téléphone et adresse

### Affichage des profils

- Les profils affichent automatiquement les nouveaux champs (phone, address, website) sans modification supplémentaire
- Ils utilisent les données retournées par l'API

## Migration et Déploiement

### Pour les environnements existants:

1. **Option 1 (automatique):** Les migrations s'exécutent automatiquement au démarrage du serveur via `_run_migrations()`
2. **Option 2 (manuel):** Exécuter le script: `python backend/migrate_add_phone_address.py`

### Tests possibles:

1. Créer un compte personne physique avec tous les nouveaux champs
2. Créer un compte personne morale avec les nouveaux champs
3. Vérifier que les données sont sauvegardées en base
4. Vérifier que les profils affichent les données
5. Mettre à jour les champs via l'API

## Fichiers modifiés

- ✅ `backend/database.py` - Modèle User
- ✅ `backend/server.py` - API et models Pydantic
- ✅ `frontend/src/pages/Register.jsx` - Formulaires d'inscription
- ✅ `frontend/src/pages/Settings.jsx` - Formulaire de profil
- ✅ `frontend/src/store.js` - Traductions
- ✅ `backend/migrate_add_phone_address.py` (nouveau) - Script de migration

## Fichiers NON modifiés (mais continuent de fonctionner)

- Les endpoints API d'affichage de profil
- Les endpoints API de suppression/création d'utilisateurs
- Les composants d'affichage de profil (ArtistProfile.jsx, etc.) - ils affichent automatiquement les nouveaux champs
