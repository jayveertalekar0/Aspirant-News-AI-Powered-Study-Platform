import requests
import logging
from bs4 import BeautifulSoup
from urllib.parse import urljoin
from newspaper import Article, ArticleException
from database import get_connection   # <-- ensure this import exists in your project

logger = logging.getLogger(__name__)

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/125.0.0.0 Safari/537.36"
    )
}
JUNK_KEYWORDS = ["logo", "icon", "avatar", "button", "pixel"]

def clean_url(url: str, base_url: str) -> str:
    if not url:
        return ""
    full = urljoin(base_url, url)
    return full.split("?")[0].split("#")[0]

def is_common_image(url: str) -> bool:
    """Return True if this image URL appears in >2 other articles (likely a generic placeholder)."""
    try:
        with get_connection() as conn:
            cnt = conn.execute(
                "SELECT COUNT(*) FROM news WHERE image_url = ?", (url,)
            ).fetchone()[0]
            return cnt > 2
    except Exception:
        return False   # if DB check fails, allow the image

def is_valid_image(src: str, base_url: str) -> bool:
    """Quick filter for tiny/icon images that are common placeholders."""
    if not src or len(src) < 10:
        return False
    if any(kw in src.lower() for kw in JUNK_KEYWORDS):
        return False
    return True

def extract_basic(url: str):
    """Extract images and video embeds using requests + BeautifulSoup."""
    try:
        res = requests.get(url, headers=HEADERS, timeout=10)
        if res.status_code != 200:
            return {"images": [], "videos": []}
        soup = BeautifulSoup(res.text, "html.parser")
        base_url = url
        images = set()
        videos = set()

        # 1) og:image
        og = soup.find("meta", property="og:image")
        if og and og.get("content"):
            img = clean_url(og["content"], base_url)
            if img and not is_common_image(img) and is_valid_image(img, base_url):
                images.add(img)

        # 2) Normal <img> tags (including lazy‑loaded)
        for img in soup.find_all("img"):
            src = img.get("src") or img.get("data-src") or img.get("data-lazy-src")
            if src:
                full = clean_url(src, base_url)
                if full and not is_common_image(full) and is_valid_image(full, base_url):
                    images.add(full)

        # 3) YouTube / Vimeo iframes
        for iframe in soup.find_all("iframe"):
            src = iframe.get("src")
            if src and ("youtube.com/embed/" in src or "vimeo.com/video/" in src
                        or "youtube.com/watch?" in src):
                full = clean_url(src, base_url)
                if full:
                    videos.add(full)

        # 4) <video> tags
        for video in soup.find_all("video"):
            src = video.get("src")
            if src:
                full = clean_url(src, base_url)
                if full:
                    videos.add(full)
            for source in video.find_all("source"):
                src = source.get("src")
                if src:
                    full = clean_url(src, base_url)
                    if full:
                        videos.add(full)

        # 5) YouTube watch links (often inside <a>)
        for a in soup.find_all("a", href=True):
            href = a["href"]
            if "youtube.com/watch?" in href or "youtu.be/" in href:
                full = clean_url(href, base_url)
                if full:
                    videos.add(full)

        return {"images": list(images)[:5], "videos": list(videos)}
    except Exception as e:
        logger.error(f"Basic media extraction failed for {url}: {e}")
        return {"images": [], "videos": []}

def extract_with_newspaper(url: str):
    """Use newspaper3k to get top image and additional images."""
    try:
        article = Article(url)
        article.download()
        article.parse()
        imgs = set()
        if article.top_image:
            imgs.add(clean_url(article.top_image, url))
        for img in article.images:
            if img:
                imgs.add(clean_url(img, url))
        return list(imgs)[:10]
    except Exception as e:
        logger.warning(f"newspaper3k media failed: {e}")
        return []

def extract_media(url: str):
    """
    Combined media extraction: basic HTML + newspaper3k.
    Filters out duplicate and common placeholder images.
    """
    basic = extract_basic(url)
    news_imgs = extract_with_newspaper(url)
    all_imgs = []
    for i in basic["images"]:
        if i not in all_imgs and not is_common_image(i):
            all_imgs.append(i)
    for i in news_imgs:
        if i not in all_imgs and not is_common_image(i):
            all_imgs.append(i)
    final_images = [i for i in all_imgs if i.startswith("http") and is_valid_image(i, url)][:5]
    return {"images": final_images, "videos": basic["videos"]}