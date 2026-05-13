import React, { useState, useEffect } from 'react';
import BackButton from '../components/BackButton';
import styles from '../styles/VideosPage.module.css';

function VideosPage() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/videos?limit=20')
      .then((r) => r.json())
      .then((d) => setVideos(d.videos || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className={styles.container}>Loading videos...</div>;

  return (
    <div className={styles.container}>
      <BackButton />
      <h2>Videos</h2>
      {videos.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyIcon}>🎬</p>
          <p className={styles.emptyText}>No videos found.</p>
          <p className={styles.emptyHint}>
            Videos are extracted from articles when available. Try scraping more news sources – some articles contain YouTube embeds.
          </p>
        </div>
      ) : (
        videos.map((v) => (
          <div key={v.id} className={styles.videoItem}>
            <h4>{v.title}</h4>
            <iframe
              src={v.video_url}
              style={{ width: '100%', height: 300 }}
              allowFullScreen
              title={v.title}
            />
          </div>
        ))
      )}
    </div>
  );
}

export default VideosPage;