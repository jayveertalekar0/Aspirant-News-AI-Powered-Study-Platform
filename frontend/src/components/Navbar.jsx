import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/Navbar.module.css';
import { useAppContext } from '../state/useAppContext';
import { useAuth } from '../state/AuthContext';
import { useDarkMode } from '../state/DarkModeContext';

function Navbar({ onToggleSidebar }) {
  const { setFilter } = useAppContext();
  const { user, logout } = useAuth();
  const { dark, toggleDark } = useDarkMode();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    if (showProfileMenu) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showProfileMenu]);

  const resetAll = () => {
    setFilter('topic', null);
    setFilter('source', null);
    setFilter('search', '');
    setFilter('saved', false);
  };

  const refreshFeed = async () => {
    try {
      // Trigger backend scraping pipeline
      await fetch('/scrape', { method: 'POST' });
    } catch (err) {
      console.log('Scrape request failed, will still refresh feed', err);
    }
    // Wait a few seconds for some articles to be scraped, then reload
    setTimeout(() => {
      setFilter('refresh', Date.now());
    }, 4000);   // 4 seconds – enough for a handful of articles
  };

  return (
    <header className={styles.navbar}>
      {/* Left side – sidebar toggle + logo */}
      <div className={styles.leftGroup}>
        <button
          className={styles.toggleBtn}
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          ☰
        </button>
        <Link to="/" className={styles.logo}>
          <span className={styles.logoIcon}>📰</span> Aspirants News
        </Link>
      </div>

      {/* Right side – navigation links & actions */}
      <nav className={styles.navLinks}>
        <Link to="/" className={styles.navItem}>Home</Link>
        <Link to="/quiz" className={styles.navItem}>Quiz</Link>
        <Link to="/videos" className={styles.navItem}>Videos</Link>
        <Link to="/epaper" className={styles.navItem}>E‑Paper</Link>
        <button className={styles.resetBtn} onClick={resetAll}>
          Reset Filters
        </button>

        {/* Dark mode toggle */}
        <button
          className={styles.toggleMode}
          onClick={toggleDark}
          aria-label="Toggle dark mode"
        >
          {dark ? '☀️' : '🌙'}
        </button>


        {/* Profile / Login */}
        {user ? (
          <div className={styles.profileContainer} ref={profileMenuRef}>
            <button
              className={styles.profileBtn}
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              title="Profile options"
            >
              👤
            </button>
            {showProfileMenu && (
              <div className={styles.profileDropdown}>
                <span className={styles.profileName}>{user.name}</span>
                <Link to="/profile" className={styles.dropdownItem}>📋 Profile</Link>
                <button className={styles.dropdownItem} onClick={logout}>🚪 Logout</button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login" className={styles.navItem}>Login</Link>
        )}
      </nav>
    </header>
  );
}

export default Navbar;