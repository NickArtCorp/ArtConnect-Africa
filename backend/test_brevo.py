#!/usr/bin/env python3
"""
Script de test pour vérifier la connexion SMTP à Brevo
Exécutez: python test_brevo.py
"""

import os
import sys
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
ENV_FILE = Path(__file__).parent / '.env'
if ENV_FILE.exists():
    load_dotenv(ENV_FILE)
else:
    print(f"❌ ERREUR: Fichier .env non trouvé à {ENV_FILE}")
    sys.exit(1)

SMTP_USER = os.getenv("BREVO_SMTP_USER", "").strip().strip('"')
SMTP_PASSWORD = os.getenv("BREVO_SMTP_KEY", "").strip().strip('"')
SENDER_EMAIL = os.getenv("BREVO_SENDER_EMAIL", "").strip().strip('"')
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "").strip().strip('"')

SMTP_SERVER = "smtp-relay.brevo.com"
SMTP_PORT = 587

def check_credentials():
    """Vérifie que les credentials sont configurés"""
    print("\n📋 Vérification des credentials...")
    
    errors = []
    
    if not SMTP_USER:
        errors.append("❌ BREVO_SMTP_USER n'est pas configuré dans .env")
    else:
        print(f"✅ BREVO_SMTP_USER: {SMTP_USER}")
    
    if not SMTP_PASSWORD:
        errors.append("❌ BREVO_SMTP_KEY n'est pas configuré dans .env")
    elif not SMTP_PASSWORD.startswith("xkeysib-"):
        print(f"⚠️  ATTENTION: BREVO_SMTP_KEY ne commence pas par 'xkeysib-'")
        print(f"    Valeur actuelle: {SMTP_PASSWORD[:20]}...")
    else:
        print(f"✅ BREVO_SMTP_KEY: {SMTP_PASSWORD[:30]}...{SMTP_PASSWORD[-10:]}")
    
    if not SENDER_EMAIL:
        errors.append("❌ BREVO_SENDER_EMAIL n'est pas configuré dans .env")
    else:
        print(f"✅ BREVO_SENDER_EMAIL: {SENDER_EMAIL}")
    
    if not ADMIN_EMAIL:
        errors.append("❌ ADMIN_EMAIL n'est pas configuré dans .env")
    else:
        print(f"✅ ADMIN_EMAIL: {ADMIN_EMAIL}")
    
    if errors:
        print("\n" + "\n".join(errors))
        return False
    
    return True

def test_smtp_connection():
    """Test la connexion SMTP à Brevo"""
    print("\n🔌 Test de connexion SMTP...")
    
    try:
        print(f"   Connexion à {SMTP_SERVER}:{SMTP_PORT}...")
        
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT, timeout=10) as server:
            print("   ✅ Connexion établie")
            
            print("   Activation de TLS...")
            server.starttls()
            print("   ✅ TLS activé")
            
            print(f"   Authentification avec {SMTP_USER}...")
            server.login(SMTP_USER, SMTP_PASSWORD)
            print("   ✅ Authentification réussie!")
            
        return True
        
    except smtplib.SMTPAuthenticationError as e:
        print(f"   ❌ ERREUR D'AUTHENTIFICATION: {e}")
        print("      Vérifiez vos credentials BREVO_SMTP_USER et BREVO_SMTP_KEY")
        return False
    except smtplib.SMTPException as e:
        print(f"   ❌ ERREUR SMTP: {e}")
        return False
    except Exception as e:
        print(f"   ❌ ERREUR: {e}")
        return False

def send_test_email():
    """Envoie un email de test"""
    print("\n📧 Envoi d'un email de test...")
    
    try:
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT, timeout=10) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            
            # Créer le message
            message = MIMEMultipart("alternative")
            message["Subject"] = "Test de Configuration - ArtConnect Africa"
            message["From"] = SENDER_EMAIL
            message["To"] = ADMIN_EMAIL
            
            # Version texte
            text = f"""Bonjour,

Cet email de test confirme que votre configuration Brevo fonctionne correctement.

Détails du test:
- Serveur SMTP: {SMTP_SERVER}:{SMTP_PORT}
- Utilisateur SMTP: {SMTP_USER}
- Email expéditeur: {SENDER_EMAIL}
- Email destinataire: {ADMIN_EMAIL}

Date/Heure du test: {__import__('datetime').datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

Vous pouvez vérifier cet email dans votre dashboard Brevo:
Allez dans Contacts → Journaux et cherchez cet email.

---
ArtConnect Africa
Système d'approbation automatisé
"""
            
            # Version HTML
            html = f"""
            <html>
                <head>
                    <meta charset="UTF-8">
                </head>
                <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <h2 style="color: #2d3748; margin-bottom: 20px;">✅ Configuration Brevo Validée</h2>
                        
                        <p style="color: #4a5568; line-height: 1.6;">Bonjour,</p>
                        
                        <p style="color: #4a5568; line-height: 1.6;">Cet email de test confirme que votre configuration Brevo fonctionne correctement.</p>
                        
                        <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #4CAF50;">
                            <p style="margin: 8px 0;"><strong>Serveur SMTP:</strong> {SMTP_SERVER}:{SMTP_PORT}</p>
                            <p style="margin: 8px 0;"><strong>Utilisateur SMTP:</strong> {SMTP_USER}</p>
                            <p style="margin: 8px 0;"><strong>Email expéditeur:</strong> {SENDER_EMAIL}</p>
                            <p style="margin: 8px 0;"><strong>Email destinataire:</strong> {ADMIN_EMAIL}</p>
                            <p style="margin: 8px 0;"><strong>Date/Heure:</strong> {__import__('datetime').datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
                        </div>
                        
                        <p style="color: #4a5568; line-height: 1.6;">Vous êtes prêt à envoyer des emails d'approbation, de rejet et de notification!</p>
                        
                        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
                        
                        <p style="color: #718096; font-size: 12px;">ArtConnect Africa - Système d'approbation automatisé</p>
                    </div>
                </body>
            </html>
            """
            
            # Ajouter les deux versions
            message.attach(MIMEText(text, "plain"))
            message.attach(MIMEText(html, "html"))
            
            # Envoyer
            server.sendmail(SENDER_EMAIL, ADMIN_EMAIL, message.as_string())
            print(f"   ✅ Email envoyé avec succès à: {ADMIN_EMAIL}")
            
        return True
        
    except Exception as e:
        print(f"   ❌ ERREUR lors de l'envoi: {e}")
        return False

def main():
    """Fonction principale"""
    print("=" * 60)
    print("🧪 TEST DE CONFIGURATION BREVO - ArtConnect Africa")
    print("=" * 60)
    
    # Vérifier les credentials
    if not check_credentials():
        print("\n❌ Une ou plusieurs variables d'environnement sont manquantes.")
        print("   Veuillez configurer votre fichier .env et réessayer.")
        sys.exit(1)
    
    # Tester la connexion SMTP
    if not test_smtp_connection():
        print("\n❌ La connexion SMTP a échoué.")
        print("   Vérifiez vos credentials Brevo et réessayer.")
        sys.exit(1)
    
    # Envoyer un email de test
    if not send_test_email():
        print("\n❌ L'envoi de l'email de test a échoué.")
        sys.exit(1)
    
    # Succès!
    print("\n" + "=" * 60)
    print("✅ TOUS LES TESTS RÉUSSIS!")
    print("=" * 60)
    print("\n📋 Prochaines étapes:")
    print("   1. Vérifiez votre email (boîte de réception ou spam)")
    print("   2. Allez sur https://www.brevo.com")
    print("   3. Votre email doit aparaître dans Contacts → Journaux")
    print("   4. Vous pouvez maintenant enregistrer des utilisateurs!")
    print("\n💡 Conseil: Vérifiez votre dossier SPAM si vous ne voyez pas l'email.")
    print("   Cela peut prendre jusqu'à 30 secondes pour arriver.")
    print("\n")

if __name__ == "__main__":
    main()
