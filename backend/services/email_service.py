import os
import aiohttp
from dotenv import load_dotenv

load_dotenv()

SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY", "")
FROM_EMAIL = os.getenv("FROM_EMAIL", "noreply@homecareai.com")
FROM_NAME = "HomeCare AI 🌿"


def get_welcome_email_html(user_name: str, is_new_user: bool = True) -> str:
    """Generate warm welcome email HTML."""
    action = "Welcome to" if is_new_user else "Welcome back to"

    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to HomeCare AI</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f0fdf4; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
            <!-- Header -->
            <tr>
                <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
                    <div style="font-size: 48px; margin-bottom: 10px;">🌿</div>
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">{action} HomeCare AI</h1>
                    <p style="color: #d1fae5; margin: 8px 0 0 0; font-size: 16px;">Your Natural Wellness Companion</p>
                </td>
            </tr>

            <!-- Body -->
            <tr>
                <td style="padding: 40px 30px;">
                    <p style="color: #1f2937; font-size: 18px; margin: 0 0 20px 0; line-height: 1.6;">
                        Hey <strong>{user_name}</strong>! 👋
                    </p>

                    <p style="color: #4b5563; font-size: 16px; margin: 0 0 24px 0; line-height: 1.6;">
                        { "We're so excited to have you join the HomeCare AI family! Your journey to natural, holistic wellness starts now." if is_new_user else "Great to see you again! Your wellness journey continues." }
                    </p>

                    <!-- Features Grid -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 30px 0;">
                        <tr>
                            <td style="padding: 12px; background: #ecfdf5; border-radius: 12px; text-align: center; width: 50%;">
                                <div style="font-size: 24px;">💬</div>
                                <p style="color: #065f46; font-size: 13px; margin: 6px 0 0 0; font-weight: 600;">AI Health Chat</p>
                            </td>
                            <td style="width: 8px;"></td>
                            <td style="padding: 12px; background: #eff6ff; border-radius: 12px; text-align: center; width: 50%;">
                                <div style="font-size: 24px;">🌿</div>
                                <p style="color: #1e40af; font-size: 13px; margin: 6px 0 0 0; font-weight: 600;">30+ Natural Remedies</p>
                            </td>
                        </tr>
                        <tr><td style="height: 8px;"></td><td></td><td></td></tr>
                        <tr>
                            <td style="padding: 12px; background: #fef3c7; border-radius: 12px; text-align: center;">
                                <div style="font-size: 24px;">🔔</div>
                                <p style="color: #92400e; font-size: 13px; margin: 6px 0 0 0; font-weight: 600;">Smart Reminders</p>
                            </td>
                            <td></td>
                            <td style="padding: 12px; background: #f3e8ff; border-radius: 12px; text-align: center;">
                                <div style="font-size: 24px;">👨‍👩‍👧</div>
                                <p style="color: #6b21a8; font-size: 13px; margin: 6px 0 0 0; font-weight: 600;">Family Dashboard</p>
                            </td>
                        </tr>
                    </table>

                    <!-- CTA Button -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 30px 0;">
                        <tr>
                            <td align="center">
                                <a href="https://homecareai.vercel.app/home" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; border-radius: 50px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
                                    Open Your Dashboard →
                                </a>
                            </td>
                        </tr>
                    </table>

                    <!-- Divider -->
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

                    <p style="color: #6b7280; font-size: 14px; margin: 0 0 16px 0; line-height: 1.6;">
                        <strong>Need help getting started?</strong><br>
                        Here are a few things you can do right away:
                    </p>

                    <ul style="color: #6b7280; font-size: 14px; line-height: 1.8; margin: 0 0 24px 0; padding-left: 20px;">
                        <li>Explore our <strong>AI Chat</strong> for instant natural remedies</li>
                        <li>Set up <strong>Medication Reminders</strong> to never miss a dose</li>
                        <li>Invite family members to your <strong>Caregiver Dashboard</strong></li>
                        <li>Check out <strong>Health Insights</strong> for personalized wellness tips</li>
                    </ul>

                    <p style="color: #6b7280; font-size: 14px; margin: 0; line-height: 1.6;">
                        If you have any questions, just reply to this email. We're always happy to help! 💚
                    </p>
                </td>
            </tr>

            <!-- Footer -->
            <tr>
                <td style="background: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="color: #9ca3af; font-size: 13px; margin: 0 0 8px 0;">
                        Made with 💚 by the HomeCare AI Team
                    </p>
                    <p style="color: #9ca3af; font-size: 12px; margin: 0 0 16px 0;">
                        Natural Healing • Modern Intelligence
                    </p>
                    <p style="color: #d1d5db; font-size: 11px; margin: 0;">
                        © 2026 HomeCare AI. All rights reserved.
                    </p>
                    <p style="color: #d1d5db; font-size: 11px; margin: 8px 0 0 0;">
                        You received this email because you signed up for HomeCare AI.
                    </p>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """


def get_verification_email_html(user_name: str, verification_code: str) -> str:
    """Generate email verification code email HTML."""
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f0fdf4; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
            <!-- Header -->
            <tr>
                <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center;">
                    <div style="font-size: 40px;">🔐</div>
                    <h1 style="color: #ffffff; margin: 10px 0 0 0; font-size: 24px;">Verify Your Email</h1>
                </td>
            </tr>

            <!-- Body -->
            <tr>
                <td style="padding: 30px; text-align: center;">
                    <p style="color: #1f2937; font-size: 16px; margin: 0 0 20px 0;">
                        Hey <strong>{user_name}</strong>! 👋
                    </p>
                    <p style="color: #4b5563; font-size: 14px; margin: 0 0 24px 0; line-height: 1.6;">
                        Please use the code below to verify your email address:
                    </p>

                    <!-- Code Box -->
                    <div style="background: #ecfdf5; border: 2px dashed #10b981; border-radius: 12px; padding: 20px; margin: 20px 0;">
                        <span style="font-size: 36px; font-weight: 700; color: #065f46; letter-spacing: 8px;">{verification_code}</span>
                    </div>

                    <p style="color: #6b7280; font-size: 12px; margin: 20px 0 0 0;">
                        This code expires in 15 minutes.<br>
                        If you didn't request this, please ignore this email.
                    </p>
                </td>
            </tr>

            <!-- Footer -->
            <tr>
                <td style="background: #f9fafb; padding: 20px; text-align: center;">
                    <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                        🌿 HomeCare AI • Natural Healing, Modern Intelligence
                    </p>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """


async def send_email(to_email: str, subject: str, html_content: str) -> bool:
    """Send email via SendGrid API."""
    if not SENDGRID_API_KEY:
        print("[Email] SENDGRID_API_KEY not set - email not sent")
        return False

    payload = {
        "personalizations": [
            {
                "to": [{"email": to_email}],
                "subject": subject,
            }
        ],
        "from": {"email": FROM_EMAIL, "name": FROM_NAME},
        "content": [
            {
                "type": "text/html",
                "value": html_content,
            }
        ],
    }

    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(
                "https://api.sendgrid.com/v3/mail/send",
                headers={
                    "Authorization": f"Bearer {SENDGRID_API_KEY}",
                    "Content-Type": "application/json",
                },
                json=payload,
            ) as response:
                if response.status == 202:
                    print(f"[Email] Successfully sent to {to_email}")
                    return True
                else:
                    error_text = await response.text()
                    print(f"[Email] SendGrid error {response.status}: {error_text}")
                    return False
    except Exception as e:
        print(f"[Email] Failed to send: {e}")
        return False


async def send_welcome_email(email: str, user_name: str, is_new_user: bool = True) -> bool:
    """Send welcome email to user."""
    subject = "🌿 Welcome to HomeCare AI — Your Wellness Journey Begins!" if is_new_user else "👋 Welcome back to HomeCare AI!"
    html = get_welcome_email_html(user_name, is_new_user)
    return await send_email(email, subject, html)


async def send_verification_email(email: str, user_name: str, code: str) -> bool:
    """Send email verification code."""
    subject = "🔐 Verify your HomeCare AI account"
    html = get_verification_email_html(user_name, code)
    return await send_email(email, subject, html)
