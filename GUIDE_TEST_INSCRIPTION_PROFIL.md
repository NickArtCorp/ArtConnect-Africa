# Guide de Test - Modifications Inscriptions et Profils

## Prérequis
- Backend en cours d'exécution sur http://localhost:8000
- Frontend en cours d'exécution sur http://localhost:3000
- La migration de la base de données s'exécute automatiquement au démarrage du serveur

## Scénarios de test

### Scénario 1: Inscription - Personne Physique avec nouveaux champs

**Étapes:**
1. Accéder à http://localhost:3000/register
2. Cliquer sur "Personne physique"
3. Remplir le formulaire:
   - Prénom: "Jean"
   - Nom: "Dupont"
   - Email: "jean.dupont@example.com"
   - Mot de passe: "Password123"
   - Pays: "Senegal"
   - Ville: "Dakar"
   - Genre: "Male"
   - Secteur: "Arts & Culture"
   - Domaine: "Painting"
   - **Téléphone: "+221 77 123 45 67"** ✨ NOUVEAU
   - **Site web: "https://jeandupont.com"** ✨ NOUVEAU
   - **Adresse: "123 Rue de l'Art, Dakar, Senegal"** ✨ NOUVEAU
4. Remplir bio
5. Cliquer sur "Créer un compte"

**Résultat attendu:**
- L'utilisateur est créé avec le statut "pending"
- Les données téléphone/adresse/website sont sauvegardées en base

**Vérification en base (SQLite):**
```sql
SELECT email, phone, address, website FROM users WHERE email = 'jean.dupont@example.com';
```

---

### Scénario 2: Inscription - Personne Morale SANS nom/prénom du contact à l'inscription

**Étapes:**
1. Accéder à http://localhost:3000/register
2. Cliquer sur "Personne morale"
3. Vérifier que les champs "Contact First Name" et "Contact Last Name" ne sont **PAS** visibles dans le formulaire principal
4. Remplir le formulaire:
   - Nom de l'organisation: "Galerie d'Art Moderne"
   - Email: "contact@galerie.com"
   - Mot de passe: "Password123"
   - Pays: "Mali"
   - **Téléphone: "+223 76 00 11 22"** ✨ NOUVEAU
   - **Site web: "https://galerieart.ml"** ✨ NOUVEAU
   - **Adresse: "456 Avenue des Artistes, Bamako, Mali"** ✨ NOUVEAU
   - Nombre d'employés: "10"
   - Description/Mission: "Galerie de promotion des arts contemporains"
5. Cliquer sur "Créer le compte Institution"

**Résultat attendu:**
- L'organisation est créée avec les champs téléphone/adresse/website
- Les champs `first_name` et `last_name` sont vides ou NULL
- Les champs de contact optionnels (contact_person_name, contact_person_email) restent NULL

**Vérification en base:**
```sql
SELECT email, organization_name, phone, address, website, first_name, last_name, contact_person_name FROM users WHERE email = 'contact@galerie.com';
```

---

### Scénario 3: Profil - Mise à jour des champs téléphone et adresse

**Étapes:**
1. Se connecter avec l'utilisateur créé en Scénario 1
2. Aller à http://localhost:3000/settings
3. Descendre jusqu'aux nouveaux champs
4. Vérifier que les champs sont présents:
   - "Phone Number" avec la valeur "+221 77 123 45 67" ✨ NOUVEAU
   - "Website" avec la valeur "https://jeandupont.com"
   - "Address" avec la valeur "123 Rue de l'Art, Dakar, Senegal" ✨ NOUVEAU
5. Modifier l'adresse: "Rue Nouvelle, Dakar"
6. Modifier le téléphone: "+221 77 999 88 77"
7. Cliquer "Save"

**Résultat attendu:**
- Un message "Profile updated!" apparaît
- Les données sont mises à jour en base

**Vérification en base:**
```sql
SELECT phone, address, website FROM users WHERE email = 'jean.dupont@example.com';
```
Doit afficher les valeurs mises à jour.

---

### Scénario 4: Affichage du profil public

**Étapes:**
1. Aller à http://localhost:3000/discover
2. Cliquer sur le profil de "Jean Dupont" créé en Scénario 1
3. Vérifier que les informations suivantes s'affichent sur le profil:
   - ✅ Téléphone: "+221 77 123 45 67" (ou la valeur mise à jour)
   - ✅ Adresse: "Rue Nouvelle, Dakar" (ou la valeur actuelle)
   - ✅ Site web: Bouton de lien vers "https://jeandupont.com"

**Résultat attendu:**
- Les nouveaux champs s'affichent correctement
- Les liens sont cliquables
- Les données correspondent aux informations du profil

---

### Scénario 5: Test API directe

**Vérifier le endpoint de récupération du profil:**

```bash
# Récupérer les données d'un artiste
curl http://localhost:8000/api/artists/{artist_id}

# Vérifier la réponse JSON inclut:
{
  "id": "...",
  "email": "...",
  "phone": "+221 77 123 45 67",
  "address": "Rue Nouvelle, Dakar",
  "website": "https://jeandupont.com",
  ...
}
```

**Mettre à jour le profil via API:**

```bash
curl -X PUT http://localhost:8000/api/artists/me \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+221 77 555 55 55",
    "address": "99 Rue Update, Dakar"
  }'

# Doit retourner le profil mis à jour
```

---

## Vérifications de traduction

### Français
1. Changer la langue en français sur le site
2. Aller à l'inscription
3. Vérifier que les labels s'affichent:
   - "Numéro de téléphone" ✅
   - "Adresse" ✅

### Anglais
1. Changer la langue en anglais
2. Aller à l'inscription
3. Vérifier que les labels s'affichent:
   - "Phone Number" ✅
   - "Address" ✅

---

## Cas limites à tester

### Test 1: Champs vides
- Créer un compte sans remplir téléphone/adresse/website
- Vérifier que l'inscription fonctionne (champs optionnels)
- Vérifier que les champs sont NULL ou vides en base

### Test 2: Adresse très longue
- Remplir l'adresse avec un texte de 500 caractères
- Vérifier que tout est sauvegardé (c'est un TEXT field)

### Test 3: Format téléphone international
- Tester plusieurs formats:
  - "+221 77 123 45 67" (Sénégal)
  - "+1 (555) 123-4567" (USA)
  - "0777123456" (local)
- Vérifier que tout est sauvegardé tel quel (pas de validation stricte)

### Test 4: URL website
- Remplir avec une URL valide: "https://example.com"
- Remplir avec un domaine simple: "example.com"
- Remplir avec une URL locale: "http://localhost:8000"
- Vérifier que tout est sauvegardé

---

## Résultats attendus finaux

✅ **À l'inscription (Personne Physique):**
- Tous les nouveaux champs se sauvegardent
- Le profil affiche les informations

✅ **À l'inscription (Personne Morale):**
- Les champs first_name/last_name sont vides ou omis
- Les nouveaux champs (phone, address, website) se sauvegardent
- La section "Personne de contact" est optionnelle et séparée

✅ **À la mise à jour du profil:**
- Tous les champs peuvent être mis à jour
- Les données sont synchronisées entre frontend et backend
- Les changements s'affichent immédiatement

✅ **À l'affichage du profil:**
- Les nouveaux champs s'affichent sur la page de profil public
- Les liens website fonctionnent

---

## Notes

- La migration de base de données s'exécute automatiquement
- Aucune action manuelle requise pour la création des colonnes
- Les données existantes ne sont pas affectées
- Les champs sont totalement rétrocompatibles (NULL pour les anciens utilisateurs)
