import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchArticleById } from '../services/api';
import { useAppContext } from '../state/useAppContext';
import BackButton from '../components/BackButton';
import { exportArticlePDF } from '../utils/exportPDF';
import styles from '../styles/ArticlePage.module.css';

function ArticlePage() {
  const { id } = useParams();
  const { addToReadingHistory } = useAppContext();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSource, setShowSource] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchArticleById(id)
      .then((data) => {
        if (!cancelled) {
          setArticle(data);
          if (data) {
            addToReadingHistory({
              id: data.id,
              title: data.title,
              topic: data.topic,
            });
          }
        }
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [id, addToReadingHistory]);

  if (loading) return <div className={styles.container}>Loading article...</div>;
  if (!article) return <div className={styles.container}>Article not found.</div>;

  return (
    <div className={styles.container}>
      {/* ---- Top bar (always visible) ---- */}
      <div className={styles.topBar}>
        <BackButton />
        <div className={styles.topActions}>
          <button className={styles.exportBtn} onClick={() => exportArticlePDF(article)}>
            📄 Export PDF
          </button>
          {article.url && (
            <button
              className={styles.sourceBtn}
              onClick={() => setShowSource(!showSource)}
            >
              🔗 {showSource ? 'Hide Source' : 'View Original Source'}
            </button>
          )}
        </div>
      </div>

      {/* ---- Inline source iframe: appears at the top when toggled ---- */}
      {showSource && article.url && (
        <div className={styles.sourceFrame}>
          <iframe
            src={article.url}
            title="Original source"
            className={styles.sourceIframe}
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          />
        </div>
      )}

      {/* ---- Article content: hidden when source is visible ---- */}
      {!showSource && (
        <>
          <h1>{article.title}</h1>
          {article.image_url && (
            <img src={article.image_url} alt="" style={{ maxWidth: '100%', borderRadius: 8 }} />
          )}
          <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, marginTop: '1rem' }}>
            {article.content}
          </div>
          {article.video_url && (
            <iframe
              src={article.video_url}
              title="Video"
              style={{ width: '100%', height: 400 }}
              allowFullScreen
            />
          )}
        </>
      )}
    </div>
  );
}

export default ArticlePage;