# Résumé Technique Détaillé - Modifications Inscriptions/Profils

## 1. Modifications Backend

### 1.1 Schéma de Base de Données

**Fichier: `backend/database.py`**

Ajout des colonnes au modèle `User`:
```python
phone = Column(String, nullable=True)
address = Column(Text, nullable=True)
```

- `phone`: VARCHAR(20) - Stocke les numéros de téléphone (format libre)
- `address`: TEXT - Stocke les adresses complètes (peut être longue)

### 1.2 Migrations Automatiques

**Fichier: `backend/server.py` - fonction `_run_migrations()`**

Ajout dans la fonction de migration:
```python
# Phone and address columns for all users
for col, definition in [
    ("phone", "VARCHAR"),
    ("address", "TEXT"),
]:
    try:
        conn.execute(
            __import__("sqlalchemy").text(f"ALTER TABLE users ADD COLUMN {col} {definition}")
        )
        conn.commit()
    except Exception:
        pass
```

**Fonctionnement:**
- S'exécute automatiquement au démarrage du serveur
- Ajoute les colonnes si elles n'existent pas
- Ignore gracieusement les erreurs (colonnes existantes)

### 1.3 API Models

**Fichier: `backend/server.py`**

#### UserCreate (pour l'inscription)
```python
class UserCreate(BaseModel):
    ...
    website: Optional[str] = ""
    phone: Optional[str] = None          # ✨ NOUVEAU
    address: Optional[str] = None        # ✨ NOUVEAU
    ...
```

#### UserUpdate (pour la mise à jour)
```python
class UserUpdate(BaseModel):
    ...
    website: Optional[str] = None
    phone: Optional[str] = None          # ✨ NOUVEAU
    address: Optional[str] = None        # ✨ NOUVEAU
    ...
```

### 1.4 Endpoint d'enregistrement

**Fichier: `backend/server.py` - route `/auth/register`**

Modification du modèle `User` à la création:
```python
new_user = User(
    ...
    website=user_data.website or "",
    phone=user_data.phone,               # ✨ NOUVEAU
    address=user_data.address,           # ✨ NOUVEAU
    ...
)
```

### 1.5 Endpoint de mise à jour

**Fichier: `backend/server.py` - route `/artists/me`**

```python
@api_router.put("/artists/me")
async def update_profile(update_data: UserUpdate, ...):
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    # Les nouveaux champs sont automatiquement inclus
    if update_dict:
        db.query(User).filter(User.id == user["id"]).update(update_dict)
        db.commit()
    return sanitize_user({...})
```

### 1.6 Endpoints de lecture

**Les endpoints existants retournent automatiquement les nouveaux champs:**

```python
@api_router.get("/artists/{artist_id}")
async def get_artist(...):
    return await get_user_profile_data(a, db)
    
async def get_user_profile_data(u: User, db: Session):
    d = sanitize_user({c.name: getattr(u, c.name) for c in u.__table__.columns})
    # Inclut automatiquement: phone, address, website
    return d
```

---

## 2. Modifications Frontend

### 2.1 Formulaire d'inscription - Personne Physique

**Fichier: `frontend/src/pages/Register.jsx` - composant `PersonnePhysiqueForm`**

État initial:
```javascript
const [formData, setFormData] = useState({
    ...
    phone: '',
    address: '',
    website: ''
});
```

Champs ajoutés dans le formulaire:
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <div className="space-y-2">
    <Label>{t.auth.phone}</Label>
    <Input name="phone" type="tel" value={formData.phone} onChange={handleChange}
      placeholder="+1 (555) 000-0000" />
  </div>
  <div className="space-y-2">
    <Label>{t.auth.website}</Label>
    <Input name="website" type="url" value={formData.website} onChange={handleChange}
      placeholder="https://..." />
  </div>
</div>

<div className="space-y-2">
  <Label>{t.auth.address}</Label>
  <Textarea name="address" value={formData.address} onChange={handleChange} rows={2}
    placeholder={t.auth.addressPlaceholder} />
</div>
```

### 2.2 Formulaire d'inscription - Personne Morale

**Fichier: `frontend/src/pages/Register.jsx` - composant `PersonneMoraleForm`**

**MODIFICATIONS IMPORTANTES:**
1. Retiré `first_name` et `last_name` du state initial
2. Retiré les champs input pour first_name/last_name du formulaire principal

État initial (modifié):
```javascript
const [formData, setFormData] = useState({
    email: '',
    password: '',
    organization_name: '',
    // REMOVED: first_name: '',
    // REMOVED: last_name: '',
    country: '',
    city: '',
    subregion: '',
    phone: '',
    address: '',
    website: ''
    ...
});
```

Champs ajoutés:
```jsx
{/* Tous les champs pour phone, address, website comme pour PersonnePhysique */}
```

Section personne de contact (gardée optionnelle):
```jsx
<div className="p-4 bg-secondary/50 border border-secondary/30 rounded-xl text-sm space-y-4">
  <p className="text-muted-foreground font-medium">{t.auth.contactPersonInfo}</p>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="space-y-2">
      <Label>{t.auth.contactPersonName}</Label>
      <Input name="contact_person_name" ... />
    </div>
    <div className="space-y-2">
      <Label>{t.auth.contactPersonEmail}</Label>
      <Input name="contact_person_email" type="email" ... />
    </div>
  </div>
</div>
```

### 2.3 Formulaire d'inscription - Visiteur

**Fichier: `frontend/src/pages/Register.jsx` - composant `VisitorForm`**

Même ajout que PersonnePhysique:
```javascript
phone: '',
address: '',
website: ''
```

### 2.4 Formulaire de profil/paramètres

**Fichier: `frontend/src/pages/Settings.jsx`**

État initial (modifié):
```javascript
const [formData, setFormData] = useState({
    ...
    website: '',
    phone: '',               // ✨ NOUVEAU
    address: '',             // ✨ NOUVEAU
    contact_person_name: '',
    contact_person_email: ''
});
```

Initialisation depuis l'utilisateur:
```javascript
useEffect(() => {
    setFormData({
        ...
        website: user.website || '',
        phone: user.phone || '',              // ✨ NOUVEAU
        address: user.address || '',          // ✨ NOUVEAU
        contact_person_name: user.contact_person_name || '',
        contact_person_email: user.contact_person_email || ''
    });
}, [user, ...]);
```

Champs dans le formulaire (après website):
```jsx
{/* Phone */}
<div className="space-y-2">
  <Label htmlFor="phone">{t.auth.phone}</Label>
  <Input
    id="phone"
    name="phone"
    type="tel"
    value={formData.phone}
    onChange={handleChange}
    placeholder="+1 (555) 000-0000"
  />
</div>

{/* Address */}
<div className="space-y-2">
  <Label htmlFor="address">{t.auth.address}</Label>
  <Textarea
    id="address"
    name="address"
    value={formData.address}
    onChange={handleChange}
    rows={2}
    placeholder={t.auth.addressPlaceholder}
  />
</div>
```

---

## 3. Modifications Traductions

**Fichier: `frontend/src/store.js`**

### Anglais (EN)
```javascript
auth: {
    ...
    phone: 'Phone Number',                    // ✨ NOUVEAU
    address: 'Address',                       // ✨ NOUVEAU
    addressPlaceholder: 'Street address, city, postal code...' // ✨ NOUVEAU
    ...
}
```

### Français (FR)
```javascript
auth: {
    ...
    phone: 'Numéro de téléphone',            // ✨ NOUVEAU
    address: 'Adresse',                      // ✨ NOUVEAU
    addressPlaceholder: 'Adresse complète, ville, code postal...' // ✨ NOUVEAU
    ...
}
```

---

## 4. Flux de données

### Flux d'inscription (Personne Physique)

```
[Frontend: Register.jsx]
    ↓ (formData avec phone, address, website)
[POST /api/auth/register]
    ↓ (UserCreate model valide phone, address)
[Backend: server.py]
    ↓ (Crée User avec phone, address)
[Database: artconnect.db]
    ↓ (Insère dans table users)
[Response]
    ↓ (Retourne sanitize_user avec tous les champs)
[Frontend: affiche token + user data]
```

### Flux de mise à jour (Settings)

```
[Frontend: Settings.jsx]
    ↓ (formData avec changements)
[PUT /api/artists/me]
    ↓ (UserUpdate model)
[Backend: update_profile]
    ↓ (Met à jour User)
[Database]
    ↓ (UPDATE users SET ...)
[Response]
    ↓ (Retourne sanitize_user)
[Frontend: affiche success message + refresh data]
```

### Flux d'affichage de profil

```
[Frontend: Discover/ArtistProfile]
    ↓
[GET /api/artists/{id}]
    ↓
[Backend: get_user_profile_data]
    ↓ (sanitize_user retourne tous les fields)
[Database: SELECT * FROM users WHERE id = ...]
    ↓ (Inclut phone, address, website)
[Response JSON avec phone, address, website]
    ↓
[Frontend: affiche sur le profil]
```

---

## 5. Gestion des erreurs

### Validation
- Aucune validation stricte sur les formats
- Les champs sont acceptés tels que fournis
- Champs optionnels (nullable)

### Migration en base
- Les erreurs de migration sont ignorées (colonnes peuvent exister)
- Pas de downtime requise

---

## 6. Rétrocompatibilité

### Anciens utilisateurs
- Les nouveaux champs sont NULL pour les utilisateurs existants
- Pas de modification des données existantes
- API retourne NULL pour phone/address si absent

### Frontend
- Affiche les champs vides si NULL
- Les forms sont préremplies avec des strings vides si NULL

---

## 7. Fichiers créés

### `backend/migrate_add_phone_address.py`
Script standalone pour migration manuelle:
```python
def migrate():
    """Add phone and address columns to users table if they don't exist."""
    # Utilise SQLite pour ALTER TABLE
    # Idempotent (peut être exécuté plusieurs fois)
```

Utilisation:
```bash
python backend/migrate_add_phone_address.py
```

---

## 8. Testing Points

### Unit Testing
- ✅ UserCreate accepte phone/address
- ✅ UserUpdate accepte phone/address
- ✅ Migration crée les colonnes
- ✅ API retourne les champs

### Integration Testing
- ✅ Complet workflow inscription → profil → modification
- ✅ Affichage dans discover
- ✅ Sérialisation/désérialisation JSON

### UI Testing
- ✅ Formulaire rend tous les champs
- ✅ Placeholder textes
- ✅ Type d'input corrects (tel, url, textarea)
- ✅ Traductions FR/EN

---

## 9. Déploiement

### Étapes
1. Merger le code
2. Déployer backend (migration auto s'exécute)
3. Déployer frontend
4. Aucune action manuelle requise

### Rollback (si nécessaire)
1. Les colonnes phone/address resteraient en base (inoffensif)
2. Frontend ignorerait les champs
3. Aucune perte de données

---

## 10. Performances

### Impact
- 2 colonnes ajoutées
- Pas de nouvelles indexes (champs non-searchables)
- Pas de nouvelle logique complexe en base
- Impact minimal sur les performances

### Queries
- `GET /api/artists/{id}` - Même performance (SELECT * inchangé)
- `PUT /api/artists/me` - Très légère augmentation (2 colonnes updatable)
- `POST /api/auth/register` - Très légère augmentation (2 colonnes insertables)
