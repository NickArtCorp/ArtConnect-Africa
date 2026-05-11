# Configuration Complète des Emails avec Brevo - Guide Détaillé

## 📋 Table des matières
1. [Configuration Brevo](#configuration-brevo)
2. [Vérification de l'email expéditeur](#vérification-de-lemail-expéditeur)
3. [Test de la connexion](#test-de-la-connexion)
4. [Personnalisation des templates](#personnalisation-des-templates)
5. [Dépannage](#dépannage)

---

## Configuration Brevo

### Étape 1: Vérifier vos credentials dans `.env`

Ouvrez `backend/.env` et vérifiez que vous avez :

```env
BREVO_SMTP_USER=gregnickyatch@gmail.com
BREVO_SMTP_KEY=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
BREVO_SENDER_EMAIL=info@kolaconsulting.net
ADMIN_EMAIL=admin@artconnect.africa
```

### Étape 2: Vérifier que vos credentials sont corrects

1. Allez sur https://www.brevo.com
2. Connectez-vous avec votre compte
3. Allez dans **Paramètres** → **SMTP & API**
4. Vérifiez que votre **Utilisateur SMTP** est: `gregnickyatch@gmail.com`
5. Vérifiez que votre **Mot de passe SMTP** commence par `xkeysib-`

---

## Vérification de l'email expéditeur

### Étape 1: Vérifier l'email expéditeur dans Brevo

1. Connectez-vous à Brevo
2. Allez dans **Contacts** → **Expéditeurs & Signature**
3. Vous devez voir: `info@kolaconsulting.net` dans la liste

### Étape 2: Vérifier que l'email est validé

- L'email doit avoir un statut **✅ Validé** ou **✓ Vérifié**
- Si ce n'est pas le cas:
  - Cliquez sur l'email
  - Brevo vous enverra un email de vérification
  - Cliquez le lien de vérification dans cet email

### Étape 3: Si l'email n'est pas dans la liste

Ajoutez-le manuellement:
1. Cliquez sur **Ajouter un nouvel expéditeur**
2. Entrez: `info@kolaconsulting.net`
3. Entrez le nom: `ArtConnect Africa`
4. Cliquez **Ajouter**
5. Vérifiez votre email (vous recevrez un lien de confirmation)

---

## Test de la connexion

### Option 1: Tester via le terminal Python

Créez un fichier `backend/test_brevo.py`:

```python
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

SMTP_USER = os.getenv("BREVO_SMTP_USER")
SMTP_PASSWORD = os.getenv("BREVO_SMTP_KEY")
SENDER_EMAIL = os.getenv("BREVO_SENDER_EMAIL")
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL")

def test_brevo_connection():
    """Test la connexion SMTP à Brevo"""
    try:
        print("Connexion à Brevo SMTP...")
        with smtplib.SMTP("smtp-relay.brevo.com", 587) as server:
            server.starttls()
            print("TLS activé")
            
            # Test de connection
            server.login(SMTP_USER, SMTP_PASSWORD)
            print(f"✅ Authentification réussie avec: {SMTP_USER}")
            
            # Envoyer un email de test
            message = MIMEMultipart("alternative")
            message["Subject"] = "Test ArtConnect Africa"
            message["From"] = SENDER_EMAIL
            message["To"] = ADMIN_EMAIL
            
            text = f"Email de test depuis ArtConnect Africa\n\nExpéditeur: {SENDER_EMAIL}\nAdministrateur: {ADMIN_EMAIL}"
            html = f"""
            <html>
                <body>
                    <h2>Test ArtConnect Africa</h2>
                    <p>Cet email de test confirme que votre configuration Brevo fonctionne.</p>
                    <p><strong>Expéditeur:</strong> {SENDER_EMAIL}</p>
                    <p><strong>Administrateur:</strong> {ADMIN_EMAIL}</p>
                </body>
            </html>
            """
            
            message.attach(MIMEText(text, "plain"))
            message.attach(MIMEText(html, "html"))
            
            server.sendmail(SENDER_EMAIL, ADMIN_EMAIL, message.as_string())
            print(f"✅ Email de test envoyé à: {ADMIN_EMAIL}")
            
    except smtplib.SMTPAuthenticationError:
        print("❌ ERREUR D'AUTHENTIFICATION")
        print("Vérifiez vos credentials BREVO_SMTP_USER et BREVO_SMTP_KEY")
    except smtplib.SMTPException as e:
        print(f"❌ ERREUR SMTP: {e}")
    except Exception as e:
        print(f"❌ ERREUR: {e}")

if __name__ == "__main__":
    test_brevo_connection()
```

**Exécutez le test:**
```bash
cd backend
python test_brevo.py
```

**Résultats attendus:**
```
Connexion à Brevo SMTP...
TLS activé
✅ Authentification réussie avec: gregnickyatch@gmail.com
✅ Email de test envoyé à: admin@artconnect.africa
```

### Option 2: Vérifier dans le dashboard Brevo

1. Allez dans **Contacts** → **Journaux**
2. Vous devriez voir votre email de test
3. Cliquez dessus pour voir les détails (succès ou erreur)

---

## Personnalisation des templates

Les templates d'email sont maintenant **générés dynamiquement** dans le code Python. Ils se trouvent dans `backend/email_service.py`.

### Les 4 templates actuels:

#### 1️⃣ Template "Inscription en attente" (Registration)
**Fonction:** `_get_pending_approval_html(first_name)`
**Quand:** Utilisateur s'inscrit
**Contient:** Message d'attente d'approbation

#### 2️⃣ Template "Profil approuvé" (Approval)
**Fonction:** `_get_approval_html(first_name, access_code)`
**Quand:** Admin approuve l'utilisateur
**Contient:** Code d'accès + bouton de connexion

#### 3️⃣ Template "Demande rejetée" (Rejection)
**Fonction:** `_get_rejection_html(first_name, rejection_reason)`
**Quand:** Admin rejette l'utilisateur
**Contient:** Raison du rejet + contact

#### 4️⃣ Template "Notification admin" (Admin Notification)
**Fonction:** `_get_admin_notification_html(...)`
**Quand:** Nouvel utilisateur s'inscrit
**Contient:** Détails de l'utilisateur + lien vers tableau de bord

### Comment modifier un template

**Exemple: Modifier le message d'approbation**

Ouvrez `backend/email_service.py` et trouvez la fonction `_get_approval_html`:

```python
def _get_approval_html(self, first_name: str, access_code: str) -> tuple:
    """Get HTML and plain text for approval email"""
    plain_text = f"""Bonjour {first_name},

Félicitations! Votre profil a été approuvé et vous pouvez maintenant accéder à la plateforme ArtConnect Africa.

VOTRE CODE D'ACCÈS PERSONNALISÉ: {access_code}

[Modifiez ce texte comme vous le souhaitez]
"""
    
    html_content = f"""
    <html>
        <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px;">
                <!-- Modifiez le contenu HTML ici -->
            </div>
        </body>
    </html>
    """
    return html_content, plain_text
```

**Types de modification possibles:**
- ✏️ Changer les messages de texte
- 🎨 Changer les couleurs (CSS)
- 📝 Ajouter/retirer des sections
- 🔗 Ajouter des liens
- 🖼️ Ajouter des images

Après modification, redémarrez le serveur et envoyez un nouvel email de test.

---

## Test complet du workflow

### Étape 1: Démarrer le serveur backend

```bash
cd backend
python -m uvicorn server:app --reload
```

### Étape 2: Enregistrer un nouvel utilisateur

1. Allez à `http://localhost:3000/register`
2. S'inscrire avec ces données:
   - Email: `test@example.com`
   - Mot de passe: `password123`
   - Prénom: `Bob`
   - Nom: `Test`
   
3. ✅ Vous devriez recevoir un email "Inscription en attente d'approbation"

### Étape 3: Approuver l'utilisateur (Admin)

1. Connectez-vous avec: `admin@artconnect.africa` / `admin123`
2. Allez à `http://localhost:3000/admin/approvals`
3. Sélectionnez l'utilisateur `test@example.com`
4. Cliquez **Approuver**
5. ✅ Cet utilisateur recevra un email "Votre profil a été approuvé"

### Étape 4: Vérifier les logs Brevo

1. Allez sur https://www.brevo.com
2. **Contacts** → **Journaux**
3. Vous devriez voir les 2 emails envoyés avec le statut **Envoyé** ✅

---

## Dépannage

### ❌ "SMTP authentication failed"

**Cause:** Credentials incorrects
**Solution:**
1. Vérifiez que `BREVO_SMTP_USER` = votre email Brevo
2. Vérifiez que `BREVO_SMTP_KEY` commence par `xkeysib-`
3. Allez sur Brevo → Paramètres → SMTP & API et copiez à nouveau

### ❌ "Email not received / No email in inbox"

**Cause:** Email expéditeur non validé
**Solution:**
1. Vérifiez `BREVO_SENDER_EMAIL` dans `.env`
2. Allez sur Brevo → Contacts → Expéditeurs
3. Cherchez cet email dans la liste
4. S'il n'est pas validé, cliquez le lien de vérification

### ❌ "Connection timed out"

**Cause:** Problème de réseau ou port SMTP
**Solution:**
```python
# Vérifiez que c'est bien le port 587 et TLS est activé
smtp_server = "smtp-relay.brevo.com"
smtp_port = 587
server.starttls()  # Important!
```

### ❌ "Backend logs show: Brevo SMTP credentials not configured"

**Cause:** Variables `.env` ne sont pas chargées
**Solution:**
```bash
# Redémarrez le serveur
python -m uvicorn server:app --reload

# OU supprimez le cache Python
rm -rf __pycache__
python -m uvicorn server:app --reload
```

### ✅ Email envoyé mais ne s'affiche pas

**Souvenez-vous:** Vérifiez le dossier **SPAM** ! Les emails peuvent y aller les premières fois.

**Solution:** Allez sur Brevo → Contacts → Journaux et vérifiez le statut du message.

---

## Résumé de la configuration

| Élément | Valeur | Où trouver |
|---------|--------|-----------|
| **SMTP Server** | `smtp-relay.brevo.com` | Code fixe |
| **SMTP Port** | `587` | Code fixe |
| **SMTP User** | `gregnickyatch@gmail.com` | Brevo → Paramètres → SMTP & API |
| **SMTP Key** | `xkeysib-...` | Brevo → Paramètres → SMTP & API |
| **Sender Email** | `info@kolaconsulting.net` | Brevo → Contacts → Expéditeurs |
| **Admin Email** | `admin@artconnect.africa` | `.env` |

---

## Besoin d'aide supplémentaire?

- 📚 Documentation Brevo: https://developers.brevo.com/
- 💬 Support Brevo: https://www.brevo.com/support/
- 🐛 Bugs? Vérifiez les logs backend: `backend/*.log`
