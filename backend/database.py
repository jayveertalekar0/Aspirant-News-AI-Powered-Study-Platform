import sqlite3
import logging
import json
from contextlib import contextmanager

logger = logging.getLogger(__name__)
DB_NAME = "news.db"

@contextmanager
def get_connection():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    except Exception as e:
        conn.rollback()
        logger.error(f"DB transaction failed: {e}", exc_info=True)
        raise
    finally:
        conn.close()

def init_db():
    try:
        with get_connection() as conn:
            conn.execute('''
                CREATE TABLE IF NOT EXISTS news (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    url TEXT UNIQUE NOT NULL,
                    content TEXT NOT NULL,
                    source TEXT,
                    published TEXT,
                    summary TEXT,
                    is_summarized INTEGER DEFAULT 0,
                    scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    image_url TEXT,
                    video_url TEXT,
                    topic TEXT
                )
            ''')

            # FTS5 virtual table for full‑text search
            conn.execute('''
                CREATE VIRTUAL TABLE IF NOT EXISTS news_fts USING fts5(
                    title,
                    content,
                    content='news',
                    content_rowid='id'
                )
            ''')

            # Triggers to keep FTS index updated
            conn.execute('''
                CREATE TRIGGER IF NOT EXISTS news_ai AFTER INSERT ON news BEGIN
                    INSERT INTO news_fts(rowid, title, content) VALUES (new.id, new.title, new.content);
                END;
            ''')
            conn.execute('''
                CREATE TRIGGER IF NOT EXISTS news_ad AFTER DELETE ON news BEGIN
                    INSERT INTO news_fts(news_fts, rowid, title, content) VALUES('delete', old.id, old.title, old.content);
                END;
            ''')
            conn.execute('''
                CREATE TRIGGER IF NOT EXISTS news_au AFTER UPDATE ON news BEGIN
                    INSERT INTO news_fts(news_fts, rowid, title, content) VALUES('delete', old.id, old.title, old.content);
                    INSERT INTO news_fts(rowid, title, content) VALUES (new.id, new.title, new.content);
                END;
            ''')

        logger.info("Database initialized (including FTS).")
    except Exception as e:
        logger.error(f"DB init failed: {e}", exc_info=True)

def save_news(news: dict):
    try:
        if not isinstance(news, dict):
            raise ValueError("news must be dict")
        required_fields = ["url", "title", "content"]
        for f in required_fields:
            if not news.get(f):
                raise ValueError(f"Missing required field: {f}")

        with get_connection() as conn:
            cur = conn.execute(
                '''INSERT OR IGNORE INTO news
                   (url, title, content, source, published, summary, is_summarized,
                    image_url, video_url, topic)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
                (
                    news["url"],
                    news["title"],
                    news["content"],
                    news.get("source"),
                    str(news.get("published")) if news.get("published") else None,
                    None,
                    0,
                    news.get("image_url"),
                    news.get("video_url"),
                    news.get("topic")
                )
            )
            if cur.rowcount == 0:
                logger.warning(f"Duplicate ignored: {news['url']}")
            else:
                logger.info(f"Saved: {news['title'][:60]}")
    except Exception as e:
        logger.error(f"Save failed: {news.get('url')} | {e}", exc_info=True)

def article_exists(url: str) -> bool:
    try:
        if not isinstance(url, str):
            return False
        with get_connection() as conn:
            cur = conn.execute("SELECT 1 FROM news WHERE url = ?", (url,))
            return cur.fetchone() is not None
    except Exception as e:
        logger.error(f"DB check error: {e}")
        return False

def update_summary(news_id: int, summary: str):
    try:
        if not summary:
            raise ValueError("Summary is empty")
        with get_connection() as conn:
            conn.execute("UPDATE news SET summary = ?, is_summarized = 1 WHERE id = ?", (summary, news_id))
        logger.info(f"Summary updated for id={news_id}")
    except Exception as e:
        logger.error(f"Failed to update summary: {e}")

def update_media(news_id: int, image_url: str, video_url: str, topic: str):
    try:
        with get_connection() as conn:
            conn.execute("UPDATE news SET image_url = ?, video_url = ?, topic = ? WHERE id = ?",
                         (image_url, video_url, topic, news_id))
        logger.info(f"Media updated for id={news_id}")
    except Exception as e:
        logger.error(f"Failed to update media: {e}")