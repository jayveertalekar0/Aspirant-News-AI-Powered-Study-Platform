import time
import logging
from scraper import get_article_links
from extract import extract_article
from database import save_news, init_db, article_exists

logger = logging.getLogger(__name__)

MAX_PROCESS = 15
MIN_PER_SOURCE = 3
SLEEP_BETWEEN = 2

def run():
    logger.info("Ingestion pipeline started.")
    init_db()
    link_items = get_article_links()

    source_links = {}
    for item in link_items:
        source = item["source"]
        source_links.setdefault(source, []).append(item)

    sources = list(source_links.keys())
    idx = 0
    processed = 0
    success = 0
    fail = 0

    while processed < MAX_PROCESS and sources:
        source = sources[idx % len(sources)]
        links = [l for l in source_links.get(source, []) if not article_exists(l["url"])]
        source_links[source] = links

        if not links:
            sources.remove(source)
            idx = 0
            continue

        item = links[0]
        url = item["url"]

        data = extract_article(url, source=source)
        if not data or len(data.get('content', '')) < 200:
            fail += 1
            logger.warning(f"Failed: {url}")
        else:
            save_news(data)
            success += 1
            processed += 1
            logger.info(f"Processed {processed}/{MAX_PROCESS}: {data['title'][:60]}")

        source_links[source] = links[1:]
        idx += 1
        time.sleep(SLEEP_BETWEEN)

    logger.info(f"Ingestion completed. Success: {success}, Failed: {fail}")
    return {"success": success, "failed": fail}

if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s | %(levelname)s | %(message)s',
        handlers=[
            logging.FileHandler('app.log'),
            logging.StreamHandler()
        ]
    )
    run()