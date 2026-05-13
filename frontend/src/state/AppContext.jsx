import React, { createContext, useContext, useReducer, useEffect, useRef, useState } from 'react';
import { articleReducer, initialArticleState } from './reducer';
import { fetchArticles, fetchArticleById } from '../services/api';

export const AppContext = createContext();

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(articleReducer, initialArticleState);
  const loadingRef = useRef(new Set());
  const [notes, setNotes] = useState({});
  const [readingHistory, setReadingHistory] = useState([]);
  const [quizHistory, setQuizHistory] = useState([]);
  const [ready, setReady] = useState(false);

  // ---- 1. Load all persisted data BEFORE fetching articles ----
  useEffect(() => {
    const saved = localStorage.getItem('savedArticles');
    if (saved) {
      try { dispatch({ type: 'LOAD_SAVED_ARTICLES', payload: JSON.parse(saved) }); } catch {}
    }

    const savedNotes = localStorage.getItem('articleNotes');
    if (savedNotes) {
      try { setNotes(JSON.parse(savedNotes)); } catch {}
    }

    const savedHistory = localStorage.getItem('readingHistory');
    if (savedHistory) {
      try { setReadingHistory(JSON.parse(savedHistory)); } catch {}
    }

    const savedQuiz = localStorage.getItem('quizHistory');
    if (savedQuiz) {
      try { setQuizHistory(JSON.parse(savedQuiz)); } catch {}
    }

    setReady(true);
  }, []);

  // ---- 2. Persist everything automatically on change ----
  useEffect(() => {
    if (ready) {
      localStorage.setItem('savedArticles', JSON.stringify(state.savedArticles));
    }
  }, [state.savedArticles, ready]);

  useEffect(() => {
    if (ready) {
      localStorage.setItem('articleNotes', JSON.stringify(notes));
    }
  }, [notes, ready]);

  useEffect(() => {
    if (ready) {
      localStorage.setItem('readingHistory', JSON.stringify(readingHistory));
    }
  }, [readingHistory, ready]);

  useEffect(() => {
    if (ready) {
      localStorage.setItem('quizHistory', JSON.stringify(quizHistory));
    }
  }, [quizHistory, ready]);

  // ---- 3. Fetch articles only after saved state is loaded ----
  useEffect(() => {
    if (!ready) return;

    async function loadArticles() {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const data = await fetchArticles();
        dispatch({ type: 'SET_ARTICLES', payload: data.articles });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }
    loadArticles();
  }, [ready]);

  // ---- 4. Pre‑fetch summaries for the first 5 articles ----
  useEffect(() => {
    if (state.articles.length > 0) {
      state.articles.slice(0, 5).forEach((a) => {
        if (!state.summaryCache[a.id] && !loadingRef.current.has(a.id)) {
          loadingRef.current.add(a.id);
          loadSummary(a.id);
        }
      });
    }
  }, [state.articles]);

  // ---- Actions ----
  const setFilter = (type, value) =>
    dispatch({ type: 'SET_FILTER', payload: { filterType: type, value } });

  const toggleSaved = (id) => {
    dispatch({ type: 'TOGGLE_SAVED', payload: id });
  };

  const setNote = (id, note) => {
    setNotes((prev) => ({ ...prev, [id]: note }));
  };

  // ---- History helpers ----
  // Inside AppProvider, replace the addToReadingHistory function with this enhanced version:

const addToReadingHistory = (article) => {
    setReadingHistory((prev) => {
        // Avoid duplicates
        const exists = prev.find((h) => h.id === article.id);
        if (exists) return prev;

        const entry = {
            id: article.id,
            title: article.title,
            topic: article.topic || 'other',   // ← store topic now
            timestamp: new Date().toISOString(),
        };
        return [entry, ...prev].slice(0, 100);
    });
};
  const addToQuizHistory = (score, total) => {
    setQuizHistory((prev) => {
      const entry = {
        date: new Date().toISOString(),
        score,
        total,
      };
      return [entry, ...prev].slice(0, 30);   // keep last 30
    });
  };

  const loadSummary = async (id) => {
    if (state.summaryCache[id] || state.loadingSummaries[id]) return;
    dispatch({ type: 'SET_LOADING_SUMMARY', payload: { id, loading: true } });
    try {
      const article = await fetchArticleById(id);
      dispatch({
        type: 'CACHE_SUMMARY',
        payload: { id, summary: article.summary || 'No summary available.' },
      });
    } catch {
      dispatch({
        type: 'CACHE_SUMMARY',
        payload: { id, summary: 'Failed to load summary.' },
      });
    } finally {
      dispatch({ type: 'SET_LOADING_SUMMARY', payload: { id, loading: false } });
      loadingRef.current.delete(id);
    }
  };

  return (
    <AppContext.Provider
      value={{
        state,
        notes,
        setNote,
        readingHistory,
        quizHistory,
        addToReadingHistory,
        addToQuizHistory,
        setFilter,
        toggleSaved,
        loadSummary,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}