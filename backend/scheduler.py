import schedule
import time
import logging
from main import run as pipeline_run
from digest import run_digest

logger = logging.getLogger(__name__)

def safe_pipeline():
    try:
        pipeline_run()
    except Exception as e:
        logger.error(f"Pipeline run failed: {e}", exc_info=True)

def safe_digest():
    try:
        run_digest()
    except Exception as e:
        logger.error(f"Digest run failed: {e}", exc_info=True)

# Schedule every 10 minutes for news scraping
schedule.every(10).minutes.do(safe_pipeline)

# Schedule daily digest at 8:00 AM
schedule.every().day.at("08:00").do(safe_digest)

if __name__ == "__main__":
    while True:
        try:
            schedule.run_pending()
            time.sleep(1)
        except Exception as e:
            logger.error(f"Scheduler crashed: {e}", exc_info=True)
            time.sleep(5)   # brief pause before loop continues