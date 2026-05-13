import React from 'react';
import styles from '../styles/HorizontalTopics.module.css';

const topics = [
  { label: 'All', key: null },
  { label: 'Polity', key: 'politics' },
  { label: 'Economy', key: 'economy' },
  { label: 'International', key: 'international' },
  { label: 'Science & Tech', key: 'science_tech' },
  { label: 'Environment', key: 'environment' },
  { label: 'Health', key: 'health' },
  { label: 'Education', key: 'education' },
  { label: 'Sports', key: 'sports' },
  { label: 'History & Culture', key: 'history_culture' },
  { label: 'Geography', key: 'geography' },
  { label: 'Defence & Security', key: 'defence_security' },
  { label: 'Law & Justice', key: 'law_justice' },
];

function HorizontalTopics({ selected, onSelect }) {
  return (
    <div className={styles.container}>
      {topics.map((t) => (
        <span
          key={t.key || 'all'}
          className={`${styles.topic} ${selected === t.key ? styles.active : ''}`}
          onClick={() => onSelect(t.key)}
        >
          {t.label}
        </span>
      ))}
    </div>
  );
}

export default HorizontalTopics;