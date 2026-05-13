import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../state/useAppContext';
import styles from '../styles/SearchBar.module.css';

function SearchBar() {
  const { setFilter } = useAppContext();
  const [input, setInput] = useState('');
  const debounceRef = useRef(null);

  useEffect(() => {
    debounceRef.current = setTimeout(() => {
      setFilter('search', input);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [input, setFilter]);

  return (
    <div className={styles.container}>
      <input
        type="text"
        className={styles.input}
        placeholder="Search news..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      {input && (
        <button className={styles.clearBtn} onClick={() => setInput('')}>
          ✕
        </button>
      )}
    </div>
  );
}

export default SearchBar;