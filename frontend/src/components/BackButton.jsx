import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/BackButton.module.css';

function BackButton() {
  const navigate = useNavigate();

  const goBack = () => {
    // If there's a previous page in history, go back; otherwise go Home
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <button className={styles.backBtn} onClick={goBack}>
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="15 18 9 12 15 6" />
      </svg>
      Back
    </button>
  );
}

export default BackButton;