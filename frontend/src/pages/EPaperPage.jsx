import React from 'react';
import BackButton from '../components/BackButton';
import styles from '../styles/EPaperPage.module.css';

function EPaperPage() {
  const pdfUrl = '/epaper/today.pdf';

  return (
    <div className={styles.container}>
      <BackButton />
      <h2>E‑Paper</h2>
      <div className={styles.paperFrame}>
        <iframe
          src={pdfUrl}
          title="E‑Paper"
          className={styles.iframe}
          allowFullScreen
        />
        <p className={styles.fallback}>
          If the paper doesn't load,{' '}
          <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
            open it directly
          </a>.
        </p>
      </div>
    </div>
  );
}

export default EPaperPage;