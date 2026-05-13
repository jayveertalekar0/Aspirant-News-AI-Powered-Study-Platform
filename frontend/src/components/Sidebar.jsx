import React from 'react';
import { useAppContext } from '../state/useAppContext';
import styles from '../styles/Sidebar.module.css';

const sources = [
  'THE HINDU',
  'INDIAN EXPRESS',
  'TIMES OF INDIA',
  'INDIA TODAY',
  'NEWS18',
  'HINDUSTAN TIMES',
  'ECONOMIC TIMES',
  'BUSINESS STANDARD',
  'THE WIRE',
  'SCROLL.IN',
  'NDTV (Business)',
  'ABP NEWS',
  'NEWSLAUNDRY',
  'THE QUINT',
  'DECCAN HERALD',
];

function Sidebar({ isOpen }) {
  const { state, setFilter } = useAppContext();
  const { filters } = state;

  return (
    <aside className={`${styles.sidebar} ${!isOpen ? styles.collapsed : ''}`}>
      <div className={styles.section}>
        <h3 className={styles.heading}>Channels</h3>
        <ul>
          {sources.map((source) => (
            <li
              key={source}
              className={`${styles.item} ${filters.source === source ? styles.active : ''}`}
              onClick={() => setFilter('source', filters.source === source ? null : source)}
            >
              {source}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

export default Sidebar;