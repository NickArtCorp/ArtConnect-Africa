# Changements pour les Personnes Morales (Organisations)

## 📋 Vue d'ensemble

Les inscriptions des personnes morales ont été **simplifiées et améliorées**:

### ❌ Avant
- Demander: Prénom + Nom du contact
- Ces champs étaient confus avec les champs d'organisation
- Pas de téléphone, adresse ou site web

### ✅ Après
- **Simplifié:** Plus de Prénom/Nom à l'inscription principale
- **Amélioré:** Ajout de Téléphone, Adresse, Site Web
- **Clarifié:** Section "Personne de Contact" séparée et optionnelle

---

## 📝 Formulaire d'Inscription - Ancien vs Nouveau

### AVANT (Personnel)

```
┌─────────────────────────────────────────┐
│ ORG NAME *                              │
├─────────────────────────────────────────┤
│ CONTACT FIRST NAME * | CONTACT LAST NAME*│ ← Confus: nom du contact ou entreprise?
├─────────────────────────────────────────┤
│ EMAIL * | PASSWORD *                    │
├─────────────────────────────────────────┤
│ EMPLOYEE COUNT                          │
├─────────────────────────────────────────┤
│ COUNTRY * | CITY                        │
├─────────────────────────────────────────┤
│ MISSION DESCRIPTION                     │
├─────────────────────────────────────────┤
│ ┌─ CONTACT PERSON INFO (OPTIONAL) ──┐ │
│ │ CONTACT PERSON NAME | EMAIL        │ │ ← Redondant!
│ └──────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### APRÈS (Optimisé)

```
┌──────────────────────────────────────────┐
│ ORG NAME *                               │
├──────────────────────────────────────────┤
│ EMAIL * | PASSWORD *                     │
├──────────────────────────────────────────┤
│ EMPLOYEE COUNT                           │
├──────────────────────────────────────────┤
│ COUNTRY * | CITY                         │
├──────────────────────────────────────────┤
│ MISSION DESCRIPTION                      │
├──────────────────────────────────────────┤
│ PHONE NUMBER | SITE WEB              ✨ │ ← Informations clés de l'orga
│ ADDRESS                              ✨ │
├──────────────────────────────────────────┤
│ ┌─ REFERENCE CONTACT (OPTIONAL) ─────┐ │
│ │ NAME | EMAIL                        │ │ ← Clairement séparé et optionnel
│ └────────────────────────────────────┘ │
└──────────────────────────────────────────┘
```

---

## 🗂 Structure du Formulaire Détaillée

### Section 1: Information de l'Organisation

```
┌─────────────────────────────────┐
│ BASIC INFORMATION               │
├─────────────────────────────────┤
│ Organization Name *             │  ex: "Galerie d'Art Moderne"
│ Email *                         │  ex: "contact@galerie.com"
│ Password *                      │
└─────────────────────────────────┘
```

✅ **Changement:** Pas de "Contact First Name" / "Contact Last Name" ici

### Section 2: Détails de l'Organisation

```
┌──────────────────────────────┐
│ Number of Employees          │  ex: 15
├──────────────────────────────┤
│ Country * | City             │  ex: Mali, Bamako
├──────────────────────────────┤
│ Mission / Organization Desc. │  Textarea
└──────────────────────────────┘
```

### Section 3: ✨ NOUVELLE - Contact Information

```
┌──────────────────────────────┐
│ CONTACT DETAILS       ✨ NEW  │
├──────────────────────────────┤
│ Phone Number                 │  ex: +223 76 00 11 22
├──────────────────────────────┤
│ Website                      │  ex: https://galerie.ml
├──────────────────────────────┤
│ Address                      │  Textarea: rue, ville, pays
└──────────────────────────────┘
```

Ces champs sont **essentiels** pour l'organisation et disponibles publiquement.

### Section 4: Reference Contact (Optionnel)

```
┌────────────────────────────────────┐
│ REFERENCE CONTACT (OPTIONAL)       │
├────────────────────────────────────┤
│ Contact Person Name                │  ex: "Jean Dupont"
│ Contact Person Email               │  ex: "jean@galerie.com"
├────────────────────────────────────┤
│ Description:                       │
│ Your relay can contact this person │
│ to verify information...           │
└────────────────────────────────────┘
```

Cette section est **complètement optionnelle** et pour vérification administrative seulement.

---

## 💾 Données Sauvegardées en Base

### Modèle User pour Personne Morale

```
id                      UUID
email                   "org@example.com"
password                hashed
organization_name       "Organization Name"        ← Organisé
first_name              NULL                       ← JAMAIS UTILISÉ
last_name               NULL                       ← JAMAIS UTILISÉ
phone                   "+223 76 00 11 22"        ✨ NOUVEAU
address                 "Full Address..."         ✨ NOUVEAU
website                 "https://..."             ✨ NOUVEAU
country                 "Mali"
city                    "Bamako"
bio                     "Mission description"
employees_count         15
contact_person_name     "Jean Dupont" (optionnel)
contact_person_email    "jean@org.com" (optionnel)
role                    "personne_morale"
approval_status         "pending"
```

✅ **Points clés:**
- `first_name` et `last_name` = NULL (non utilisés)
- `phone`, `address`, `website` sont des champs d'organisation
- `contact_person_*` sont séparés et optionnels

---

## 🌐 Affichage du Profil Public

### Avant

```
┌───────────────────────────────┐
│ GALERIE D'ART MODERNE         │
├───────────────────────────────┤
│ Jean Dupont                   │ ← Premier / Nom (du contact)
│ +15 collaborations            │
└───────────────────────────────┘
```

### Après

```
┌───────────────────────────────┐
│ 🏢 GALERIE D'ART MODERNE      │
├───────────────────────────────┤
│ 📍 456 Avenue des Artistes    │ ✨ Adresse
│    Bamako, Mali               │
├───────────────────────────────┤
│ 📞 +223 76 00 11 22          │ ✨ Téléphone
│ 🌐 https://galerie.ml        │ ✨ Site web
├───────────────────────────────┤
│ 15 collaborations             │
│ Membres depuis 2024           │
└───────────────────────────────┘
```

✅ **Améliorations:**
- Informations de contact claires
- Pas de "Prénom Nom" confus
- Plus professionnel

---

## 🔄 Flux d'Inscription - Personne Morale

### Étape 1: Choix du Type de Compte
```
┌────────────────────┐
│ Organization      │ ← L'utilisateur sélectionne
│ (Personne morale) │
└────────────────────┘
```

### Étape 2: Informations Principales
```
Saisir:
- Nom de l'organisation *
- Email *
- Mot de passe *
- Nombre d'employés (optionnel)
```

### Étape 3: Localisation
```
Saisir:
- Pays *
- Ville
```

### Étape 4: Description
```
Saisir:
- Mission/Description de l'organisation
```

### Étape 5: Détails de Contact ✨ NOUVEAUX
```
Saisir:
- Téléphone
- Site web
- Adresse complète
```

### Étape 6: Personne de Référence (Optionnel)
```
Saisir optionnellement:
- Nom de la personne de contact
- Email de la personne de contact
```

### Étape 7: Validation
```
✅ Création du compte
📧 Email de confirmation envoyé
⏳ Statut: "pending" (en attente d'approbation admin)
```

---

## 🎯 Avantages de la Nouvelle Structure

### ✅ Pour l'Utilisateur
1. **Moins de confusion** - Les champs organisationnels sont clairs
2. **Plus d'information** - Téléphone, adresse, site web
3. **Plus rapide** - Moins de champs obligatoires au départ
4. **Flexibilité** - Contact de référence optionnel

### ✅ Pour l'Organisation
1. **Plus professionnelle** - Affichage des infos de contact
2. **Plus complète** - Données pour contacter l'org directement
3. **Plus découvrable** - Site web affiché publiquement
4. **Plus sécurisée** - Contact de référence pour vérification

---

## 📊 Validation des Données

### Champs Obligatoires
- Organisation Name *
- Email *
- Password *
- Country *

### Champs Optionnels (mais recommandés)
- Phone
- Address
- Website
- Employee Count
- City

### Champs Optionnels (pour vérification admin)
- Contact Person Name
- Contact Person Email

---

## 🔐 Permissions et Visibilité

### Données Publiques (affichées dans le profil)
- Organization Name
- Phone ✨ NOUVEAU
- Address ✨ NOUVEAU
- Website ✨ NOUVEAU
- Employee Count
- City
- Mission Description
- Collaborations

### Données Privées (visibles seulement à l'org + admin)
- Email
- Contact Person Name
- Contact Person Email
- Country (région)

---

## 🚀 Migration des Données Existantes

### Pour les Organisations Existantes

```sql
-- Les colonnes phone et address seront NULL pour les orgs existantes
-- Elles peuvent être mises à jour via le profil:

UPDATE users SET 
  phone = '+...',
  address = '...',
  website = 'https://...'
WHERE role = 'personne_morale' AND id = '{org_id}'
```

**Aucune donnée ne sera perdue ou supprimée.**

---

## 📱 Mise à Jour du Profil

Les organisations peuvent mettre à jour ces informations dans Settings:

```
SETTINGS PAGE
├─ Organization Name (si editable)
├─ Phone Number ✨ NOUVEAU
├─ Address ✨ NOUVEAU
├─ Website
├─ Mission Description
├─ Employee Count
└─ Contact Person (optionnel)
```

---

## 🧪 Tests pour Personnes Morales

### Test 1: Inscription Complète
```
- [ ] Créer une org avec tous les champs
- [ ] Vérifier phone, address, website en base
- [ ] Vérifier l'affichage du profil
- [ ] Vérifier que first_name/last_name = NULL
```

### Test 2: Inscription Minimale
```
- [ ] Créer une org avec seulement les champs requis
- [ ] Vérifier que phone/address/website = NULL
- [ ] Pouvoir ajouter ces champs plus tard
```

### Test 3: Mise à Jour
```
- [ ] Modifier phone/address/website
- [ ] Vérifier la persistance
- [ ] Vérifier l'affichage immédiat
```

### Test 4: Contact de Référence
```
- [ ] Créer une org sans contact de référence
- [ ] Ajouter un contact de référence
- [ ] Retirer un contact de référence
```

---

## 📞 Support pour les Orgas

### Information à fournir à Nouveau

Lors de l'inscription, les organisations doivent maintenant fournir:

| Avant | Après |
|------|-------|
| Prénom/Nom du contact | Téléphone |
| - | Adresse |
| - | Site web |
| - | (Optionnel: Contact de référence) |

Cette information est **plus utile** pour les contacts directs.

---

## 💡 Cas d'Usage Réels

### Exemple: Galerie d'Art

```
Avant:
- "Jean Dupont" (contact? propriétaire? responsable?)
- Pas de moyen de les contacter directement

Après:
- Galerie d'Art Moderne
- 📞 +223 76 00 11 22
- 📍 456 Avenue des Artistes, Bamako
- 🌐 https://galerie.ml
- (Contact: Jean Dupont pour vérification)
```

### Exemple: Ministère de la Culture

```
Avant:
- "Marie Traoré" (qui est-ce?)
- Impossible de contacter

Après:
- Ministère de la Culture du Mali
- 📞 +223 77 88 99 00
- 📍 Place de l'Indépendance, Bamako
- 🌐 https://culture.gov.ml
- (Contact: Marie Traoré pour questions)
```

---

## 🎯 Objectifs Atteints

✅ **Simplification** - Inscription plus claire
✅ **Amélioration** - Plus d'informations de contact
✅ **Clarification** - Distinction org ↔ contact
✅ **Flexibilité** - Contact de référence optionnel
✅ **Professionnalisme** - Affichage amélioré

---

**Summary: Les personnes morales ont une meilleure expérience d'inscription et de présentation avec les nouveaux champs de contact.**
