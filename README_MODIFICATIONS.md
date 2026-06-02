# Application des Modifications - Guide Rapide

## 📋 Résumé

Modifications pour ajouter **téléphone**, **adresse** et **site web** à tous les utilisateurs, avec simplification de l'inscription pour les personnes morales.

## 🔧 Fichiers Modifiés

### Backend
1. **`backend/database.py`** - Ajout des colonnes phone et address
2. **`backend/server.py`** - API models, migrations, endpoints
3. **`backend/migrate_add_phone_address.py`** (nouveau) - Script de migration optionnel

### Frontend
1. **`frontend/src/pages/Register.jsx`** - Formulaires d'inscription
2. **`frontend/src/pages/Settings.jsx`** - Formulaire de profil
3. **`frontend/src/store.js`** - Traductions

## 🚀 Installation

### Option 1: Installation Automatique (Recommandée)

Le système appliquera automatiquement les migrations au démarrage du serveur.

```bash
# 1. Déployer le backend (les migrations s'exécutent automatiquement)
cd backend
python server.py

# 2. Déployer le frontend dans un autre terminal
cd frontend
npm start
```

### Option 2: Migration Manuelle

Si nécessaire, exécuter le script de migration:

```bash
cd backend
python migrate_add_phone_address.py
```

## ✅ Vérification

### Vérifier que les colonnes existent

```bash
# SQLite
sqlite3 backend/artconnect.db ".schema users" | grep -E "phone|address"
```

### Tester l'API

```bash
# Créer un compte
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456",
    "first_name": "Test",
    "last_name": "User",
    "phone": "+1234567890",
    "address": "123 Test St",
    "website": "https://test.com",
    "country": "Senegal",
    "gender": "Male",
    "sector": "Arts & Culture",
    "domain": "Painting"
  }'

# Récupérer le profil (vérifier que phone, address, website y sont)
curl http://localhost:8000/api/artists/{user_id}
```

### Tester le Frontend

1. Aller à `http://localhost:3000/register`
2. Créer un compte
3. Vérifier que les champs phone et address s'affichent
4. Aller à Settings et modifier les champs
5. Vérifier la persistance

## 📚 Documentation

Pour plus de détails, lire:

- **`MODIFICATIONS_INSCRIPTION_PROFIL.md`** - Vue d'ensemble complet
- **`TECHNICAL_SUMMARY_INSCRIPTION_PROFIL.md`** - Détails techniques
- **`GUIDE_TEST_INSCRIPTION_PROFIL.md`** - Scénarios de test détaillés
- **`MODIFICATIONS_CHECKLIST.md`** - Checklist de vérification

## 🎯 Points Clés

✅ **Personne Physique:**
- Peut ajouter phone, address, website à l'inscription
- Peut modifier ces champs dans le profil

✅ **Personne Morale:**
- Formulaire d'inscription **simplifié** (pas de first_name/last_name)
- Peut ajouter phone, address, website
- Section "Personne de contact" est **optionnelle**

✅ **API:**
- Tous les endpoints existants retournent les nouveaux champs
- Aucun changement de signature

✅ **Base de données:**
- Migration automatique
- Idempotent et sûr

## 🐛 Troubleshooting

### Les colonnes n'existent pas en base

```bash
# Exécuter la migration manuelle
python backend/migrate_add_phone_address.py
```

### Les champs n'apparaissent pas dans le formulaire

- Vérifier que le frontend a été rebuilt
- Vérifier la console du navigateur pour erreurs
- Vérifier que les traductions sont chargées

### L'API retourne 400 sur l'enregistrement

- Vérifier que tous les champs requis sont présents
- Vérifier que le format email est valide
- Vérifier la validation du backend

## 📱 Navigateurs Supportés

Tous les navigateurs modernes sont supportés (Chrome, Firefox, Safari, Edge).

## 🔐 Sécurité

- Aucune validation stricte sur les formats (accepte tout)
- Données traitées comme du texte libre
- CORS/CSRF protection inchangés

## 📊 Performance

Impact négligeable:
- 2 colonnes ajoutées (très petit impact)
- Pas de nouvelles indexes
- Queries resteront aussi rapides

## 🤝 Support

Pour des questions ou problèmes:
1. Lire la documentation complète
2. Vérifier la checklist
3. Exécuter les tests manuels du guide

---

**Status: ✅ Prêt au déploiement**

Date: 22 Mai 2026
