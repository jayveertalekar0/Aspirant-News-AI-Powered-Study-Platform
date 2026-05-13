```markdown
# 📰 Aspirants News – AI‑Powered Study Platform

A **personalised news aggregation & current‑affairs study platform** built for Indian competitive exam aspirants (UPSC, MPSC, SSC, Banking, Railways, etc.). It scrapes 15+ news sources, auto‑classifies articles by syllabus topics, and turns passive reading into active learning through quizzes, streaks, and daily targets.

---

## ✨ Features

### 🗞️ News Ingestion & Curation
- **15+ Indian news sources** – The Hindu, Indian Express, Times of India, India Today, News18, Hindustan Times, and more.
- **Auto‑topic classification** – 12 syllabus‑aligned topics (Polity, Economy, Science & Tech, Environment, etc.).
- **Image & video extraction** – auto‑fetches article images and YouTube/Vimeo embeds.
- **Duplicate prevention** – URL deduplication at the database layer.

### 🤖 AI & Automation
- **Offline extractive summariser** – keyword‑based sentence ranking for quick summaries.
- **Full‑text search (FTS5)** – instant search across all articles, plus time‑based queries (“today”, “yesterday”).
- **Multi‑language translation** – Hindi & Marathi (Google Translate).
- **Daily email digest** – top 5 articles every morning.

### 📚 Personalised Study Tools
- **Daily Current Affairs Quiz** – auto‑generated from recent articles.
- **Study streak tracker** – consecutive days of reading.
- **Topic‑wise progress bars** – visual dashboard of your reading habits.
- **Daily targets** – check‑off list of topics to read each day.
- **Reading history** – full log with instant access.
- **Saved articles with private notes** – bookmark and annotate.

### 🎨 User Experience
- **Dark / Light mode** – system‑wide with CSS custom properties.
- **Pull‑to‑refresh** – scroll to top triggers scraping (5+ new articles at once).
- **Infinite scroll** – automatic pagination.
- **Responsive** – collapsible sidebar, sticky navbar, mobile‑ready.
- **Inline source viewer** – view original news source in an iframe.

### 🔗 Social & Sharing
- **Share cards** – Twitter (𝕏), LinkedIn, WhatsApp.
- **User accounts** – email/password auth (localStorage).
- **Protected profile page** – private dashboard.

### 📄 Export & Accessibility
- **PDF export** – download formatted articles (jsPDF).
- **Text‑to‑speech** – listen to summaries (Web Speech API).

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 (Vite), React Router v6 |
| **State** | Context + useReducer |
| **Styling** | CSS Modules + Custom Properties (dark mode) |
| **Backend** | FastAPI (Python 3.11+) |
| **Database** | SQLite + FTS5 (full‑text search) |
| **Scraping** | newspaper3k, requests + BeautifulSoup |
| **Media** | BeautifulSoup (og:image, iframe, video tags) |
| **Topic Detection** | Regex‑based keyword mapping (12 categories) |
| **Summarisation** | Extractive keyword‑frequency ranking |
| **Translation** | deep‑translator (Google Translate) |
| **Email** | smtplib (Gmail SMTP) |
| **Scheduling** | schedule library |
| **Speech** | Web Speech API (SpeechSynthesis) |
| **PDF** | jsPDF |
| **Auth** | localStorage (email/password) |

---

## 📁 Project Structure

```
News summarizer/
├── backend/                  # FastAPI server
│   ├── api.py                # REST endpoints
│   ├── main.py               # Ingestion pipeline
│   ├── scraper.py            # RSS feed parser
│   ├── extract.py            # Article extraction (newspaper3k + fallback)
│   ├── database.py           # SQLite + FTS5
│   ├── summariser.py         # Extractive summariser
│   ├── translate.py          # Google Translate wrapper
│   ├── media_extractor.py    # Image & video extraction
│   ├── classify.py           # Topic classification
│   ├── digest.py             # Email digest
│   └── requirements.txt
├── frontend/                 # React + Vite
│   ├── src/
│   │   ├── components/       # Navbar, Sidebar, NewsCard, etc.
│   │   ├── pages/            # Home, Article, Quiz, Profile, etc.
│   │   ├── state/            # Context providers, reducers
│   │   ├── services/         # API helper
│   │   ├── utils/            # Quiz generator, PDF export
│   │   ├── hooks/            # useSpeech
│   │   └── styles/           # CSS Modules
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Python 3.10+** (with pip)
- **Node.js 18+** (with npm)

### 1. Clone the repository
```bash
git clone https://github.com/jayveertalekar0/Aspirant-News-AI-Powered-Study-Platform.git
cd Aspirant-News-AI-Powered-Study-Platform
```

### 2. Backend setup
```bash
cd backend
python -m venv .venv
source .venv/bin/activate    # Linux/macOS
# or
.venv\Scripts\activate       # Windows

pip install -r requirements.txt
uvicorn api:app --reload     # starts on http://127.0.0.1:8000
```

### 3. Frontend setup
```bash
cd ../frontend
npm install
npm run dev                  # starts on http://localhost:5173
```

### 4. Scrape initial articles
```bash
# In a new terminal (backend activated)
cd backend
python main.py               # fetches ~50 articles from 15 sources
```

### 5. Open the app
Visit **`http://localhost:5173`** in your browser.

---

## 🧪 Usage Tips
- **Sign up / Login** – create an account to track your progress.
- **Browse the feed** – scroll down for infinite loading, scroll to top and pause for a fresh scrape.
- **Click any card** – opens the full article page.
- **Summary** – click the Summary button on any card.
- **Translate** – select Hindi/Marathi after the summary loads.
- **Listen** – click the speaker icon to hear the summary.
- **Quiz** – test your current affairs knowledge.
- **Profile** – view streaks, topic progress, reading history, and manage preferences.

---

## 🙏 Acknowledgements
- [newspaper3k](https://newspaper.readthedocs.io/) for article extraction.
- [FastAPI](https://fastapi.tiangolo.com/) for the backend framework.
- [Vite](https://vitejs.dev/) for the fast frontend tooling.
- All the news sources that provide RSS feeds.

---

## 📄 License
This project is open‑source. Feel free to use it for learning, modify it, and share it. Attribution is appreciated.
```
