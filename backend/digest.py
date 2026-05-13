# digest.py
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
import logging
from database import get_connection

logger = logging.getLogger(__name__)

# Email configuration – set these environment variables or replace directly
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SENDER_EMAIL = "your_email@gmail.com"
SENDER_PASSWORD = "your_app_password"   # Use Gmail App Password
RECIPIENT_EMAIL = "recipient@example.com"

def get_top_articles(hours=24, limit=5, topic=None):
    """Fetch top articles from the past `hours`."""
    since = datetime.now() - timedelta(hours=hours)
    query = """
        SELECT title, url, source, published, summary
        FROM news
        WHERE scraped_at >= ?
    """
    params = [since.strftime("%Y-%m-%d %H:%M:%S")]
    if topic:
        query += " AND topic = ?"
        params.append(topic)
    query += " ORDER BY scraped_at DESC LIMIT ?"
    params.append(limit)

    with get_connection() as conn:
        rows = conn.execute(query, params).fetchall()
    return rows

def send_digest(articles, recipient=RECIPIENT_EMAIL):
    """Compose and send the digest email."""
    subject = f"📰 Aspirants News Digest – {datetime.now().strftime('%b %d, %Y')}"

    html = "<h2>Today's Top Stories</h2><ul>"
    for a in articles:
        html += f'<li><a href="{a["url"]}">{a["title"]}</a> – <em>{a["source"]}</em><br/>'
        html += f'<small>{a["summary"] or "No summary"}</small></li><br/>'
    html += "</ul>"

    msg = MIMEMultipart()
    msg['From'] = SENDER_EMAIL
    msg['To'] = recipient
    msg['Subject'] = subject
    msg.attach(MIMEText(html, 'html'))

    try:
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.send_message(msg)
        logger.info("Digest email sent successfully.")
    except Exception as e:
        logger.error(f"Failed to send digest: {e}")

def run_digest():
    articles = get_top_articles(hours=24, limit=5)
    if articles:
        send_digest(articles)
    else:
        logger.info("No articles found for digest.")

if __name__ == "__main__":
    run_digest()