import time
import logging
import requests
from bs4 import BeautifulSoup
from newspaper import Article, ArticleException, Config
from media_extractor import extract_media
from classify import guess_topic

logger = logging.getLogger(__name__)

def clean(text: str) -> str:
    return " ".join(text.split())

def fallback_extract(url: str) -> str | None:
    """Extract text using requests + BeautifulSoup when newspaper3k fails."""
    try:
        headers = {
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/125.0.0.0 Safari/537.36"
            )
        }
        resp = requests.get(url, headers=headers, timeout=15)
        if resp.status_code != 200:
            logger.warning(f"Fallback got status {resp.status_code} for {url}")
            return None

        soup = BeautifulSoup(resp.text, "html.parser")
        paragraphs = soup.find_all("p")
        text = " ".join(p.get_text() for p in paragraphs)
        if len(text) < 150:
            return None
        return clean(text)
    except Exception as e:
        logger.error(f"Fallback extraction failed for {url}: {e}")
        return None

def extract_article(url: str, source: str = "", max_retries: int = 2) -> dict | None:
    config = Config()
    config.timeout = 30
    config.request_timeout = 30
    config.browser_user_agent = (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/125.0.0.0 Safari/537.36"
    )

    # Try newspaper3k first
    for attempt in range(1, max_retries + 2):
        try:
            article = Article(url, config=config)
            article.download()
            article.parse()

            if not article.text or len(article.text.strip()) < 150:
                logger.warning(f"Content too short from {url}")
                raise ArticleException("short content")

            logger.info(f"Extracted (newspaper): {article.title}")

            # ---- MEDIA & TOPIC EXTRACTION ----
            media = extract_media(url)
            topic = guess_topic(article.title, article.text[:200])

            return {
                "url": url,
                "title": article.title,
                "content": clean(article.text),
                "published": str(article.publish_date) if article.publish_date else "",
                "source": source,
                "image_url": media["images"][0] if media["images"] else None,
                "video_url": media["videos"][0] if media["videos"] else None,
                "topic": topic
            }
        except ArticleException as e:
            logger.warning(f"ArticleException for {url} (attempt {attempt}): {e}")
        except Exception as ex:
            logger.error(f"Unexpected extraction error for {url}: {ex}", exc_info=True)

        if attempt <= max_retries:
            time.sleep(3 * attempt)
        else:
            logger.error(f"All retries exhausted for {url}")

    # Fallback extraction
    logger.info(f"Trying fallback extraction for {url}")
    fallback_text = fallback_extract(url)
    if fallback_text and len(fallback_text) >= 150:
        media = extract_media(url)
        topic = guess_topic("", fallback_text[:200])
        return {
            "url": url,
            "title": "Untitled (fallback)",
            "content": fallback_text,
            "published": "",
            "source": source,
            "image_url": media["images"][0] if media["images"] else None,
            "video_url": media["videos"][0] if media["videos"] else None,
            "topic": topic
        }
    return None