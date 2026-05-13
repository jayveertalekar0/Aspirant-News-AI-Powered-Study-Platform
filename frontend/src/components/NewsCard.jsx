import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../state/useAppContext';
import { translateText } from '../services/api';
import { useSpeech } from '../hooks/useSpeech';
import styles from '../styles/NewsCard.module.css';

function NewsCard({ article }) {
  const navigate = useNavigate();
  const { loadSummary, toggleSaved, state } = useAppContext();
  const { summaryCache, loadingSummaries, savedArticles } = state;
  const { speak, stop, isSpeaking, isPaused } = useSpeech();

  const [showSummary, setShowSummary] = useState(false);
  const [translated, setTranslated] = useState('');
  const [lang, setLang] = useState('en');
  const [transLoading, setTransLoading] = useState(false);
  const [pendingListen, setPendingListen] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const reqRef = useRef(0);
  const translationCache = useRef({});
  const shareMenuRef = useRef(null);

  const summary = summaryCache[article.id];
  const isSummaryLoading = loadingSummaries[article.id];
  const isSaved = savedArticles.includes(article.id);

  // Reset when article changes
  useEffect(() => {
    setTranslated('');
    setLang('en');
    setShowSummary(false);
    translationCache.current = {};
    setPendingListen(false);
    stop();
    setShowShareMenu(false);
  }, [article.id, stop]);

  // Auto‑speak when summary loads
  useEffect(() => {
    if (summary && pendingListen) {
      speak(summary);
      setPendingListen(false);
    }
  }, [summary, pendingListen, speak]);

  // Close share menu when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(e.target)) {
        setShowShareMenu(false);
      }
    };
    if (showShareMenu) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showShareMenu]);

  const handleCardClick = () => {
    navigate(`/article/${article.id}`);
  };

  const handleSummaryClick = (e) => {
    e.stopPropagation();   // don't navigate
    if (!summary && !isSummaryLoading) loadSummary(article.id);
    setShowSummary(true);
  };

  const handleTranslate = async (e, l) => {
    e.stopPropagation();
    setLang(l);
    if (l === 'en') { setTranslated(''); return; }
    if (!summary) return;
    if (translationCache.current[l]) {
      setTranslated(translationCache.current[l]);
      return;
    }
    const id = ++reqRef.current;
    setTransLoading(true);
    try {
      const res = await translateText(summary, l);
      if (id !== reqRef.current) return;
      translationCache.current[l] = res;
      setTranslated(res);
    } catch {
      if (id === reqRef.current) setTranslated('Translation failed.');
    } finally {
      if (id === reqRef.current) setTransLoading(false);
    }
  };

  const handleListen = (e) => {
    e.stopPropagation();
    if (isSpeaking) { stop(); return; }
    if (summary) speak(summary);
    else {
      if (!isSummaryLoading) loadSummary(article.id);
      setPendingListen(true);
    }
  };

  const handleSave = (e) => {
    e.stopPropagation();
    toggleSaved(article.id);
  };

  const handleShareToggle = (e) => {
    e.stopPropagation();
    setShowShareMenu(!showShareMenu);
  };

  // Social share
  const shareText = `${article.title} – ${article.source}`;
  const encodedUrl = encodeURIComponent(article.url);
  const encodedText = encodeURIComponent(shareText);

  const imageSrc = article.image_url || null;

  // Unique placeholder avatar
  const getInitialPlaceholder = () => {
    const name = article.source || article.title || '?';
    const letter = name.charAt(0).toUpperCase();
    const colors = ['#2563eb', '#7c3aed', '#db2777', '#ea580c', '#16a34a', '#0891b2'];
    const colorIndex = name.length % colors.length;
    return (
      <div
        className={styles.placeholderAvatar}
        style={{ backgroundColor: colors[colorIndex] }}
      >
        {letter}
      </div>
    );
  };

  return (
    <button className={styles.cardButton} onClick={handleCardClick}>
      <div className={styles.card}>
        {/* IMAGE or PLACEHOLDER */}
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={article.title}
            className={styles.articleImage}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          getInitialPlaceholder()
        )}

        {article.video_url && (
          <div className={styles.videoWrapper}>
            <iframe src={article.video_url} title="Video" className={styles.videoIframe} allowFullScreen />
          </div>
        )}

        <h3 className={styles.title}>{article.title}</h3>
        <p className={styles.meta}>{article.source} • {article.published || 'Unknown'}</p>

        <div className={styles.preview}>
          <p className={styles.previewText}>{article.content_preview || 'No preview available.'}</p>
        </div>

        {showSummary && (
          <div className={styles.summary}>
            {isSummaryLoading ? (
              <p className={styles.loading}>Generating summary...</p>
            ) : (
              <p className={styles.summaryText}>
                {lang === 'en' ? summary || 'No summary available.' : translated || 'Translating...'}
              </p>
            )}
          </div>
        )}

        <div className={styles.actions}>
          <button className={styles.btn} onClick={handleSummaryClick} disabled={isSummaryLoading}>
            {isSummaryLoading ? 'Loading...' : 'Summary'}
          </button>
          <select
            value={lang}
            onChange={(e) => handleTranslate(e, e.target.value)}
            disabled={!summary || isSummaryLoading || transLoading}
            className={styles.langSelect}
            onClick={(e) => e.stopPropagation()}
          >
            <option value="en">EN</option>
            <option value="hi">HI</option>
            <option value="mr">MR</option>
          </select>
          <button className={`${styles.btn} ${styles.saveBtn} ${isSaved ? styles.saved : ''}`} onClick={handleSave}>
            {isSaved ? 'Saved' : 'Save'}
          </button>
          <button className={`${styles.btn} ${styles.listenBtn}`} onClick={handleListen}
            disabled={!summary && !isSummaryLoading}
            title={isSpeaking ? 'Stop listening' : 'Listen to summary'}>
            {isSpeaking ? (isPaused ? '⏸️' : '🔊') : '🔈'}
          </button>

          {/* Share dropdown */}
          <div className={styles.shareContainer} ref={shareMenuRef}>
            <button
              className={styles.btn}
              onClick={handleShareToggle}
              title="Share"
            >
              ⋮
            </button>
            {showShareMenu && (
              <div className={styles.shareDropdown}>
                <a href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`}
                   target="_blank" rel="noopener noreferrer" className={styles.shareOption}
                   onClick={(e) => e.stopPropagation()}>
                  𝕏 Twitter
                </a>
                <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
                   target="_blank" rel="noopener noreferrer" className={styles.shareOption}
                   onClick={(e) => e.stopPropagation()}>
                  💼 LinkedIn
                </a>
                <a href={`https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`}
                   target="_blank" rel="noopener noreferrer" className={styles.shareOption}
                   onClick={(e) => e.stopPropagation()}>
                  📱 WhatsApp
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

export default NewsCard;