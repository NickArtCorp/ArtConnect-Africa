import os
import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Dict, Optional
from datetime import datetime

logger = logging.getLogger(__name__)


class EmailService:
    """Service for sending emails via Brevo (formerly Sendinblue) SMTP"""

    def __init__(self):
        self.smtp_user = os.getenv("BREVO_SMTP_USER")
        self.smtp_password = os.getenv("BREVO_SMTP_KEY")
        self.sender_email = os.getenv("BREVO_SENDER_EMAIL", "noreply@artconnect.africa")
        self.admin_email = os.getenv("ADMIN_EMAIL", "admin@artconnect.africa")
        self.smtp_server = "smtp-relay.brevo.com"
        self.smtp_port = 587

    def _send_email(self, to_email: str, subject: str, html_content: str, plain_text: str = None) -> bool:
        """
        Send email using Brevo SMTP
        
        Args:
            to_email: Recipient email address
            subject: Email subject
            html_content: HTML email body
            plain_text: Plain text fallback
            
        Returns:
            bool: True if successful, False otherwise
        """
        if not all([self.smtp_user, self.smtp_password]):
            logger.warning("Brevo SMTP credentials not configured - email not sent")
            return False

        try:
            message = MIMEMultipart("alternative")
            message["Subject"] = subject
            message["From"] = self.sender_email
            message["To"] = to_email

            # Attach plain text and HTML versions
            if plain_text:
                message.attach(MIMEText(plain_text, "plain"))
            message.attach(MIMEText(html_content, "html"))

            # Connect to Brevo SMTP and send
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.sendmail(self.sender_email, to_email, message.as_string())

            logger.info(f"Email sent successfully to {to_email}")
            return True
        except smtplib.SMTPException as e:
            logger.error(f"SMTP error sending email: {str(e)}")
            return False
        except Exception as e:
            logger.error(f"Error sending email: {str(e)}")
            return False

    def _get_pending_approval_html(self, first_name: str) -> tuple:
        """Get HTML and plain text for pending approval email"""
        plain_text = f"""Bonjour {first_name},

Merci de votre inscription sur ArtConnect Africa! Votre demande est en attente de vérification et d'approbation de la part de notre équipe. Vous recevrez un email de confirmation une fois que votre profil aura été approuvé.

Dans l'intervalle, vous pouvez consulter notre plateforme en tant que visiteur.

Cordialement,
L'équipe ArtConnect Africa"""

        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <h2 style="color: #2d3748; margin-bottom: 20px;">Inscription en attente d'approbation</h2>
                    
                    <p style="color: #4a5568; line-height: 1.6;">Bonjour <strong>{first_name}</strong>,</p>
                    
                    <p style="color: #4a5568; line-height: 1.6;">Merci de votre inscription sur <strong>ArtConnect Africa</strong>! Votre demande est en attente de vérification et d'approbation de la part de notre équipe.</p>
                    
                    <p style="color: #4a5568; line-height: 1.6;">Vous recevrez un email de confirmation une fois que votre profil aura été approuvé.</p>
                    
                    <p style="color: #4a5568; line-height: 1.6;">Dans l'intervalle, vous pouvez consulter notre plateforme en tant que visiteur.</p>
                    
                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
                    
                    <p style="color: #718096; font-size: 12px;">L'équipe ArtConnect Africa</p>
                </div>
            </body>
        </html>
        """
        return html_content, plain_text

    def _get_approval_html(self, first_name: str, access_code: str) -> tuple:
        """Get HTML and plain text for approval email"""
        plain_text = f"""Bonjour {first_name},

Félicitations! Votre profil a été approuvé et vous pouvez maintenant accéder à la plateforme ArtConnect Africa.

Votre code d'accès: {access_code}

Cliquez sur le lien ci-dessous pour vous connecter:
https://artconnect.africa

Cordialement,
L'équipe ArtConnect Africa"""

        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <h2 style="color: #2d3748; margin-bottom: 20px;">Votre profil a été approuvé!</h2>
                    
                    <p style="color: #4a5568; line-height: 1.6;">Bonjour <strong>{first_name}</strong>,</p>
                    
                    <p style="color: #4a5568; line-height: 1.6;"><strong>Félicitations!</strong> Votre profil a été approuvé et vous pouvez maintenant accéder à la plateforme <strong>ArtConnect Africa</strong>.</p>
                    
                    <div style="background-color: #f0f4ff; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center;">
                        <p style="color: #4a5568; margin: 0; font-size: 12px;">Votre code d'accès</p>
                        <p style="color: #2d3748; font-size: 24px; font-weight: bold; margin: 10px 0;">{access_code}</p>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="http://localhost:3000/" style="background-color: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Se connecter</a>
                    </div>
                    
                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
                    
                    <p style="color: #718096; font-size: 12px;">L'équipe ArtConnect Africa</p>
                </div>
            </body>
        </html>
        """
        return html_content, plain_text

    def _get_rejection_html(self, first_name: str, rejection_reason: str) -> tuple:
        """Get HTML and plain text for rejection email"""
        plain_text = f"""Bonjour {first_name},

Après examen de votre demande d'inscription, nous regrettons de vous informer que celle-ci n'a pas pu être approuvée.

Raison: {rejection_reason}

Si vous avez des questions, veuillez nous contacter à admin@artconnect.africa.

Cordialement,
L'équipe ArtConnect Africa"""

        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <h2 style="color: #2d3748; margin-bottom: 20px;">Statut de votre demande d'inscription</h2>
                    
                    <p style="color: #4a5568; line-height: 1.6;">Bonjour <strong>{first_name}</strong>,</p>
                    
                    <p style="color: #4a5568; line-height: 1.6;">Après examen de votre demande d'inscription, nous regrettons de vous informer que celle-ci n'a pas pu être approuvée.</p>
                    
                    <div style="background-color: #fee; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #f44;">
                        <p style="color: #722; margin: 0;"><strong>Raison:</strong></p>
                        <p style="color: #722; margin: 10px 0 0 0;">{rejection_reason}</p>
                    </div>
                    
                    <p style="color: #4a5568; line-height: 1.6;">Si vous avez des questions ou si vous souhaitez contester cette décision, veuillez nous contacter à <strong>admin@artconnect.africa</strong>.</p>
                    
                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
                    
                    <p style="color: #718096; font-size: 12px;">L'équipe ArtConnect Africa</p>
                </div>
            </body>
        </html>
        """
        return html_content, plain_text

    def _get_admin_notification_html(self, user_name: str, user_email: str, user_role: str, user_country: str, profile_tag: str) -> tuple:
        """Get HTML and plain text for admin notification"""
        plain_text = f"""Nouvelle demande d'approbation utilisateur

Utilisateur: {user_name}
Email: {user_email}
Rôle: {user_role}
Pays: {user_country}
Tag Profil: {profile_tag}

Une nouvelle demande d'approbation a été soumise. Veuillez vérifier et approuver ou rejeter sur le tableau de bord d'administration."""

        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <h2 style="color: #2d3748; margin-bottom: 20px;">Nouvelle demande d'approbation utilisateur</h2>
                    
                    <div style="background-color: #f9fafb; padding: 20px; border-radius: 5px; margin: 20px 0;">
                        <p style="margin: 10px 0;"><strong style="color: #2d3748;">Utilisateur:</strong> {user_name}</p>
                        <p style="margin: 10px 0;"><strong style="color: #2d3748;">Email:</strong> {user_email}</p>
                        <p style="margin: 10px 0;"><strong style="color: #2d3748;">Rôle:</strong> {user_role}</p>
                        <p style="margin: 10px 0;"><strong style="color: #2d3748;">Pays:</strong> {user_country}</p>
                        <p style="margin: 10px 0;"><strong style="color: #2d3748;">Tag Profil:</strong> {profile_tag}</p>
                    </div>
                    
                    <p style="color: #4a5568; line-height: 1.6;">Une nouvelle demande d'approbation a été soumise. Veuillez vérifier et approuver ou rejeter sur le <strong>tableau de bord d'administration</strong>.</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="http://localhost:3000/admin/approvals" style="background-color: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Aller au tableau de bord</a>
                    </div>
                    
                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
                    
                    <p style="color: #718096; font-size: 12px;">ArtConnect Africa - Système d'approbation automatisé</p>
                </div>
            </body>
        </html>
        """
        return html_content, plain_text

    def send_pending_approval_email(
        self, email: str, first_name: str, last_name: str
    ) -> bool:
        """
        Send "pending approval" email to new user
        
        Args:
            email: User email
            first_name: User first name
            last_name: User last name (optional)
            
        Returns:
            bool: True if successful
        """
        html_content, plain_text = self._get_pending_approval_html(first_name)
        subject = "Inscription en attente d'approbation - ArtConnect Africa"
        
        return self._send_email(email, subject, html_content, plain_text)

    def send_approval_email(
        self, email: str, first_name: str, access_code: str
    ) -> bool:
        """
        Send approval email to user with access code
        
        Args:
            email: User email
            first_name: User first name
            access_code: Code to access platform
            
        Returns:
            bool: True if successful
        """
        html_content, plain_text = self._get_approval_html(first_name, access_code)
        subject = "Votre profil a été approuvé - ArtConnect Africa"
        
        return self._send_email(email, subject, html_content, plain_text)

    def send_rejection_email(
        self, email: str, first_name: str, rejection_reason: str
    ) -> bool:
        """
        Send rejection email to user with reason
        
        Args:
            email: User email
            first_name: User first name
            rejection_reason: Reason for rejection
            
        Returns:
            bool: True if successful
        """
        html_content, plain_text = self._get_rejection_html(first_name, rejection_reason)
        subject = "Statut de votre demande d'inscription - ArtConnect Africa"
        
        return self._send_email(email, subject, html_content, plain_text)

    def send_admin_notification(
        self,
        user_email: str,
        user_name: str,
        user_role: str,
        user_country: str,
        profile_tag: str,
    ) -> bool:
        """
        Send notification to admin about new pending approval
        
        Args:
            user_email: User email
            user_name: User name
            user_role: User role (artist, institution, visitor)
            user_country: User country
            profile_tag: Profile tag (artist, professional, media)
            
        Returns:
            bool: True if successful
        """
        html_content, plain_text = self._get_admin_notification_html(
            user_name, user_email, user_role, user_country, profile_tag
        )
        subject = "Nouvelle demande d'approbation utilisateur - ArtConnect Africa"
        
        return self._send_email(self.admin_email, subject, html_content, plain_text)


# Global instance
email_service = EmailService()
