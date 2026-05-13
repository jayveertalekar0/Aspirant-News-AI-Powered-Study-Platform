import logging
import feedparser
from typing import List, Dict

logger = logging.getLogger(__name__)

feedparser.USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/125.0.0.0 Safari/537.36"
)

SOURCE_DATA = {
    "THE HINDU": "https://www.thehindu.com/news/national/feeder/default.rss",
    "INDIAN EXPRESS": "https://indianexpress.com/section/india/feed/",
    "TIMES OF INDIA": "https://timesofindia.indiatimes.com/rssfeedmostrecent.cms",
    "INDIA TODAY": "https://www.indiatoday.in/rss/home",
    "NEWS18": "https://www.news18.com/rss/india.xml",
    "HINDUSTAN TIMES": "https://www.hindustantimes.com/rss/india/rssfeed.xml",
    "ECONOMIC TIMES": "https://economictimes.indiatimes.com/rssfeedmostrecent.cms",
    "BUSINESS STANDARD": "https://www.business-standard.com/rss/home_page_top_stories.rss",
    "THE WIRE": "https://thewire.in/rss.xml",
    "SCROLL.IN": "https://scroll.in/rss.xml",
    "NDTV (Business)": "https://feeds.feedburner.com/ndtvprofit-latest",
    "ABP NEWS": "https://feeds.abplive.com/oneindia/rss/feeds/news.xml",
    "NEWSLAUNDRY": "https://www.newslaundry.com/feed",
    "THE QUINT": "https://www.thequint.com/api/v1/collections/home?format=rss",
    "DECCAN HERALD": "https://www.deccanherald.com/rss/india.rss",
}

def clean_url(url: str) -> str:
    url = url.split("#")[0].split("?")[0]
    return url.rstrip('/')

def get_article_links() -> List[Dict[str, str]]:
    links = []
    for name, url in SOURCE_DATA.items():
        try:
            feed = feedparser.parse(url)
            count = 0
            for entry in feed.entries:
                cleaned = clean_url(entry.link)
                if cleaned:
                    links.append({"url": cleaned, "source": name})
                    count += 1
            logger.info(f"Fetched {count} links from {name}")
        except Exception as e:
            logger.error(f"Failed to parse feed {name} ({url}): {e}")

    seen = set()
    unique = []
    for item in links:
        if item["url"] not in seen:
            seen.add(item["url"])
            unique.append(item)
    logger.info(f"Total unique articles: {len(unique)}")
    return unique