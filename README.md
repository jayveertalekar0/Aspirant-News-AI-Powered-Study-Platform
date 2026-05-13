Here's a plain‑text README with no Markdown styling – just copy and paste it into your repository's `README.md` file. GitHub will display it as simple, clean text.

```
Aspirants News - AI-Powered Study Platform

A personalised news aggregation and current-affairs study platform
for Indian competitive exam aspirants (UPSC, MPSC, SSC, Banking,
Railways). It scrapes 15+ news sources, auto-classifies articles by
syllabus topics, and turns passive reading into active learning with
quizzes, streaks, and daily targets.

Features

  15+ Indian news sources (The Hindu, Indian Express, TOI, India Today, etc.)
  Auto-topic classification (12 syllabus-aligned categories)
  Image and video extraction (articles + YouTube/Vimeo embeds)
  Offline summariser (keyword-based)
  Full-text search (SQLite FTS5 + time-based queries)
  Multi-language translation (Hindi / Marathi)
  Daily email digest (top 5 articles)
  Daily Current Affairs Quiz (auto-generated, scored)
  Study streak and topic progress dashboards
  Daily targets, reading history, saved articles with notes
  Dark mode, pull-to-refresh, infinite scroll, responsive
  Social sharing (Twitter, LinkedIn, WhatsApp)
  User accounts (localStorage)
  PDF export, text-to-speech

Tech Stack

Frontend: React 18 (Vite), React Router v6, CSS Modules, Context API
Backend: FastAPI (Python), SQLite + FTS5, newspaper3k, BeautifulSoup
AI/NLP: Extractive summarisation, Regex topic classifier, deep-translator
Other: jsPDF, Web Speech API, schedule, smtplib

Project Structure

  backend/   FastAPI (api, scraper, database, summariser, etc.)
  frontend/  React + Vite (components, pages, state, services, utils)

Getting Started

1. Clone the repository
   git clone https://github.com/jayveertalekar0/Aspirant-News-AI-Powered-Study-Platform.git
   cd Aspirant-News-AI-Powered-Study-Platform

2. Backend setup
   cd backend
   python -m venv .venv
   source .venv/bin/activate    (Linux/macOS)
   .venv\Scripts\activate       (Windows)
   pip install -r requirements.txt
   uvicorn api:app --reload     (starts on http://127.0.0.1:8000)

3. Frontend setup
   cd ../frontend
   npm install
   npm run dev                  (starts on http://localhost:5173)

4. Scrape initial articles
   cd backend
   python main.py               (fetches about 50 articles)

5. Open http://localhost:5173

Acknowledgements

newspaper3k, FastAPI, Vite, and all the news sources that provide RSS feeds.
```
