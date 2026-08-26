import os
import httpx

SENDGRID_API_KEY = os.environ.get("SENDGRID_API_KEY", "")
EMAIL_FROM = os.environ.get("EMAIL_FROM", "noreply@homecareai.vercel.app")


async def send_email(to_email: str, subject: str, html_content: str):
    """Send email using SendGrid API."""
    if not SENDGRID_API_KEY:
        print("SENDGRID_API_KEY not configured")
        return False

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.sendgrid.com/v3/mail/send",
                headers={
                    "Authorization": f"Bearer {SENDGRID_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "personalizations": [
                        {
                            "to": [{"email": to_email}],
                            "subject": subject,
                        }
                    ],
                    "from": {"email": EMAIL_FROM, "name": "HomeCare AI"},
                    "content": [
                        {
                            "type": "text/html",
                            "value": html_content,
                        }
                    ],
                },
            )
            return response.status_code == 00
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False


async def send_notification_email(user_email: str, user_name: str, notification_title: str, notification_body: str, action_url: str = None):
    """Send notification email to user."""
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 0; background: #f5f5f5; }}
            .container {{ max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
            .header {{ background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center; }}
            .header h1 {{ color: white; margin: 0; font-size: 24px; }}
            .content {{ padding: 30px; }}
            .content h2 {{ color: #1B4332; margin-top: 0; }}
            .content p {{ color: #555; line-height: 1.6; }}
            .button {{ display: inline-block; background: #10b981; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; margin-top: 20px; }}
            .footer {{ padding: 20px 30px; background: #f9fafb; text-align: center; color: #888; font-size: 12px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🌿 HomeCare AI</h1>
            </div>
            <div class="content">
                <h2>{notification_title}</h2>
                <p>Hello {user_name},</p>
                <p>{notification_body}</p>
                {f'<a href="{action_url}" class="button">View Details</a>' if action_url else ''}
            </div>
            <div class="footer">
                <p>You received this email because you enabled email notifications.</p>
                <p><a href="https://homecareai.vercel.app/notifications">Manage Preferences</a></p>
            </div>
        </div>
    </body>
    </html>
    """

    return await send_email(user_email, notification_title, html)


async def send_welcome_email(user_email: str, user_name: str):
    """Send welcome email to new users."""
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 0; background: #f5f5f5; }}
            .container {{ max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
            .header {{ background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center; }}
            .header h1 {{ color: white; margin: 0; font-size: 24px; }}
            .content {{ padding: 30px; }}
            .content h2 {{ color: #1B4332; margin-top: 0; }}
            .content p {{ color: #555; line-height: 1.6; }}
            .button {{ display: inline-block; background: #10b981; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; margin-top: 20px; }}
            .footer {{ padding: 20px 30px; background: #f9fafb; text-align: center; color: #888; font-size: 12px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🌿 HomeCare AI</h1>
            </div>
            <div class="content">
                <h2>Welcome to HomeCare AI!</h2>
                <p>Hello {user_name},</p>
                <p>Thank you for joining HomeCare AI! Your personal natural home care assistant is ready to help.</p>
                <p>Get started by describing your symptoms and discovering safe, effective home remedies.</p>
                <a href="https://homecareai.vercel.app/chat" class="button">Start Chatting</a>
            </div>
            <div class="footer">
                <p>You received this email because you created an account on HomeCare AI.</p>
            </div>
        </div>
    </body>
    </html>
    """
    return await send_email(user_email, "Welcome to HomeCare AI!", html)


async def send_verification_email(user_email: str, user_name: str, verification_url: str):
    """Send email verification link."""
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 0; background: #f5f5f5; }}
            .container {{ max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
            .header {{ background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center; }}
            .header h1 {{ color: white; margin: 0; font-size: 24px; }}
            .content {{ padding: 30px; }}
            .content h2 {{ color: #1B4332; margin-top: 0; }}
            .content p {{ color: #555; line-height: 1.6; }}
            .button {{ display: inline-block; background: #10b981; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; margin-top: 20px; }}
            .footer {{ padding: 20px 30px; background: #f9fafb; text-align: center; color: #888; font-size: 12px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🌿 HomeCare AI</h1>
            </div>
            <div class="content">
                <h2>Verify Your Email</h2>
                <p>Hello {user_name},</p>
                <p>Please verify your email address to get started with HomeCare AI.</p>
                <a href="{verification_url}" class="button">Verify Email</a>
            </div>
            <div class="footer">
                <p>You received this email because you created an account on HomeCare AI.</p>
            </div>
        </div>
    </body>
    </html>
    """
    return await send_email(user_email, "Verify your HomeCare AI email", html)
