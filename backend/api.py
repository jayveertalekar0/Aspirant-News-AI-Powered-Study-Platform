from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel
from database import get_connection, update_summary, update_media
from summariser import summarize_text
from translate import translate_to_language
from media_extractor import extract_media
from classify import guess_topic
import logging
import json
import threading
from main import run as run_pipeline
logger = logging.getLogger(__name__)
app = FastAPI()

@app.get("/api/health")
def health():
    return {"status": "ok"}

@app.get("/news")
def get_latest_news(
    page: int = Query(1, ge=1),
    limit: int = Query(10, le=50),
    source: str = None,
    topic: str = None,
    search: str = None,
    since_id: int = Query(None, ge=1)   # ← new
):
    offset = (page - 1) * limit
    params = []

    query = """
        SELECT n.id, n.title, n.url, n.source, n.published, n.summary,
               SUBSTR(n.content, 1, 200) || '...' AS content_preview,
               n.image_url, n.video_url, n.topic
        FROM news n
    """
    count_query = "SELECT COUNT(*) FROM news n"
    conditions = []
    joins = ""

    if since_id:
        conditions.append("n.id > ?")
        params.append(since_id)

    if source:
        conditions.append("n.source = ?")
        params.append(source)
    if topic:
        conditions.append("n.topic = ?")
        params.append(topic)

    # … search / time‑filter logic unchanged …

    # ---- Handles time‑based search keywords ----
    date_condition = None
    if search:
        search_lower = search.lower().strip()
        # Map common phrases to SQLite date conditions
        time_filters = {
            "today": "date(n.scraped_at) = date('now')",
            "yesterday": "date(n.scraped_at) = date('now', '-1 day')",
            "tomorrow": "date(n.scraped_at) = date('now', '+1 day')",   # rare but possible
            "this week": "strftime('%W', n.scraped_at) = strftime('%W', 'now') AND strftime('%Y', n.scraped_at) = strftime('%Y', 'now')",
            "last week": "strftime('%W', n.scraped_at) = strftime('%W', 'now', '-7 days')",
            "this month": "strftime('%m', n.scraped_at) = strftime('%m', 'now') AND strftime('%Y', n.scraped_at) = strftime('%Y', 'now')",
        }
        # Check for exact keyword match
        if search_lower in time_filters:
            date_condition = time_filters[search_lower]
        else:
            # Use FTS5 for full‑text search
            joins += " INNER JOIN news_fts fts ON n.id = fts.rowid"
            conditions.append("news_fts MATCH ?")
            params.append(search)

    if date_condition:
        conditions.append(date_condition)

    if conditions:
        query += joins + " WHERE " + " AND ".join(conditions)
        count_query += joins + " WHERE " + " AND ".join(conditions)
    query += " ORDER BY n.id DESC LIMIT ? OFFSET ?"
    params.extend([limit, offset])

    # Count query params (without limit/offset)
    count_params = params[:-2] if len(params) >= 2 else params

    try:
        with get_connection() as conn:
            rows = conn.execute(query, params).fetchall()
            total_row = conn.execute(count_query, count_params).fetchone()
            total = total_row[0] if total_row else 0
            return {
                "articles": [dict(row) for row in rows],
                "total": total,
                "page": page,
                "pages": max(1, (total + limit - 1) // limit)
            }
    except Exception as e:
        logger.error(f"Database error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/news/{id}")
def get_news_by_id(id: int):
    if id < 1:
        raise HTTPException(status_code=400, detail="Invalid id")
    try:
        with get_connection() as conn:
            row = conn.execute(
                "SELECT * FROM news WHERE id = ?", (id,)
            ).fetchone()
            if not row:
                raise HTTPException(status_code=404, detail="Article not found")

            # Lazy media extraction
            if row["image_url"] is None and row["video_url"] is None:
                media = extract_media(row["url"])
                topic = guess_topic(row["title"], row["content"][:200])
                update_media(id, media["images"][0] if media["images"] else None,
                             media["videos"][0] if media["videos"] else None, topic)
                row = conn.execute("SELECT * FROM news WHERE id = ?", (id,)).fetchone()

            # Lazy summary (existing logic)
            if row["summary"] is None or row["is_summarized"] == 0:
                try:
                    summary = summarize_text(row["content"], row["title"])
                    if not summary:
                        summary = "Summary not available."
                except Exception as e:
                    logger.error(f"Summarization failed for id={id}: {e}")
                    summary = "Summary could not be generated."
                update_summary(id, summary)
                row = conn.execute("SELECT * FROM news WHERE id = ?", (id,)).fetchone()

            return dict(row)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing failed: {e}")

@app.get("/videos")
def get_videos(page: int = Query(1, ge=1), limit: int = Query(10, le=50)):
    offset = (page - 1) * limit
    try:
        with get_connection() as conn:
            rows = conn.execute(
                "SELECT id, title, url, video_url, image_url, published, source FROM news WHERE video_url IS NOT NULL ORDER BY id DESC LIMIT ? OFFSET ?",
                (limit, offset)
            ).fetchall()
            total = conn.execute("SELECT COUNT(*) FROM news WHERE video_url IS NOT NULL").fetchone()[0]
            return {
                "videos": [dict(r) for r in rows],
                "total": total,
                "page": page,
                "pages": max(1, (total + limit - 1) // limit)
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/scrape")
def trigger_scrape():
    """Trigger the news scraping pipeline in the background."""
    try:
        thread = threading.Thread(target=run_pipeline, daemon=True)
        thread.start()
        return {"status": "started", "message": "Scraping started – new articles will appear shortly"}
    except Exception as e:
        logger.error(f"Scrape trigger failed: {e}")
        raise HTTPException(status_code=500, detail="Could not start scraping")

# Translation endpoint unchanged
class TranslateRequest(BaseModel):
    text: str
    target_lang: str   # 'hi' or 'mr'

@app.post("/translate")
def translate_text(req: TranslateRequest):
    try:
        translated = translate_to_language(req.text, req.target_lang)
        return {"translated": translated}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Translation failed: {str(e)}")