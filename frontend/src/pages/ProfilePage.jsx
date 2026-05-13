import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../state/AuthContext';
import { useAppContext } from '../state/useAppContext';
import NewsCard from '../components/NewsCard';
import BackButton from '../components/BackButton';
import styles from '../styles/ProfilePage.module.css';

const EXAMS = ['UPSC', 'MPSC', 'SSC', 'Banking', 'Railways', 'Teaching'];
const ALL_TOPICS = [
  'politics', 'economy', 'international', 'science_tech', 'environment',
  'health', 'education', 'sports', 'history_culture', 'geography',
  'defence_security', 'law_justice',
];

function ProfilePage() {
  const { user, profile, updateProfile } = useAuth();
  const {
    state, notes, setNote,
    readingHistory, quizHistory,
    addToReadingHistory, addToQuizHistory
  } = useAppContext();
  const { articles, savedArticles } = state;
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('dashboard');

  // Daily targets
  const todayStr = new Date().toISOString().split('T')[0];
  const dailyTargets = profile.targets || {};

  const toggleTarget = (topic) => {
    const currentTargets = { ...dailyTargets };
    if (!currentTargets[todayStr]) currentTargets[todayStr] = [];
    const todayTargets = currentTargets[todayStr];
    if (todayTargets.includes(topic)) {
      todayTargets.splice(todayTargets.indexOf(topic), 1);
    } else {
      todayTargets.push(topic);
    }
    updateProfile({ targets: currentTargets });
  };

  // ----- Topic progress from readingHistory (now contains topic) -----
  const topicReadCounts = useMemo(() => {
    const counts = {};
    readingHistory.forEach((entry) => {
      const topic = entry.topic || 'other';
      counts[topic] = (counts[topic] || 0) + 1;
    });
    return counts;
  }, [readingHistory]);

  // Streak (unchanged)
  const streakDays = useMemo(() => {
    const dates = [...new Set(
      readingHistory.map((h) => h.timestamp.split('T')[0])
    )].sort().reverse();
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < dates.length; i++) {
      const expected = new Date(today);
      expected.setDate(expected.getDate() - i);
      const expectedStr = expected.toISOString().split('T')[0];
      if (dates[i] === expectedStr) {
        streak++;
      } else if (i === 0 && dates[i] !== expectedStr) {
        break;
      } else {
        break;
      }
    }
    return streak;
  }, [readingHistory]);

  const quizStats = useMemo(() => {
    if (quizHistory.length === 0) return { avg: 0, best: 0, total: 0 };
    const scores = quizHistory.map((q) => (q.score / q.total) * 100);
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const best = Math.round(Math.max(...scores));
    return { avg, best, total: quizHistory.length };
  }, [quizHistory]);

  const savedList = articles.filter((a) => savedArticles.includes(a.id));

  // ----- Settings helpers -----
  const handleClearHistory = () => {
    if (window.confirm('Delete your entire reading history?')) {
      // setReadingHistory is not directly available, but we can call addToReadingHistory with a reset trick
      // Actually we don't have a clear function; we'll use localStorage directly
      localStorage.removeItem('readingHistory');
      // Reload the page to reflect changes from localStorage
      window.location.reload();
    }
  };

  const handleResetAll = () => {
    if (window.confirm('This will delete your saved articles, notes, history, and preferences. Continue?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className={styles.container}>
      <BackButton />
      <h2 className={styles.pageTitle}>Welcome, {user?.name || 'Aspirant'}!</h2>

      {/* Quick Stats */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>🔥</span>
          <span className={styles.statValue}>{streakDays}</span>
          <span className={styles.statLabel}>Day Streak</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>📚</span>
          <span className={styles.statValue}>{readingHistory.length}</span>
          <span className={styles.statLabel}>Articles Read</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>❤️</span>
          <span className={styles.statValue}>{savedArticles.length}</span>
          <span className={styles.statLabel}>Saved</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>🎯</span>
          <span className={styles.statValue}>{quizStats.avg}%</span>
          <span className={styles.statLabel}>Avg Quiz Score</span>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {['dashboard', 'saved', 'history', 'settings'].map((tab) => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className={styles.tabContent}>
          <h3 className={styles.sectionTitle}>📊 Topic Progress</h3>
          <div className={styles.topicBars}>
            {ALL_TOPICS.map((topic) => {
              const count = topicReadCounts[topic] || 0;
              const max = Math.max(...Object.values(topicReadCounts), 1);
              const width = Math.round((count / max) * 100);
              return (
                <div key={topic} className={styles.topicBarRow}>
                  <span className={styles.topicLabel}>
                    {topic.replace(/_/g, ' ')}
                  </span>
                  <div className={styles.topicBarBg}>
                    <div
                      className={styles.topicBarFill}
                      style={{ width: `${width}%` }}
                    />
                  </div>
                  <span className={styles.topicCount}>{count}</span>
                </div>
              );
            })}
          </div>

          <h3 className={styles.sectionTitle}>📝 Today's Targets</h3>
          <div className={styles.targetsGrid}>
            {profile.topics.map((topic) => (
              <label key={topic} className={styles.targetLabel}>
                <input
                  type="checkbox"
                  checked={(dailyTargets[todayStr] || []).includes(topic)}
                  onChange={() => toggleTarget(topic)}
                />
                <span>{topic.replace(/_/g, ' ')}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Saved Tab – unchanged */}
      {activeTab === 'saved' && (
        <div className={styles.tabContent}>
          <h3 className={styles.sectionTitle}>❤️ Saved Articles</h3>
          {savedList.length === 0 ? (
            <p className={styles.empty}>No saved articles yet.</p>
          ) : (
            savedList.map((a) => (
              <div key={a.id} className={styles.cardWithNote}>
                <NewsCard article={a} />
                <div className={styles.noteArea}>
                  <label className={styles.noteLabel}>Your note:</label>
                  <textarea
                    className={styles.noteInput}
                    value={notes[a.id] || ''}
                    onChange={(e) => setNote(a.id, e.target.value)}
                    placeholder="Add a private note..."
                    rows={2}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* History Tab – unchanged */}
      {activeTab === 'history' && (
        <div className={styles.tabContent}>
          <h3 className={styles.sectionTitle}>🕒 Reading History</h3>
          {readingHistory.length === 0 ? (
            <p className={styles.empty}>You haven't read any articles yet.</p>
          ) : (
            <ul className={styles.historyList}>
              {readingHistory.slice(0, 20).map((entry, idx) => (
                <li key={idx} className={styles.historyItem}>
                  <Link to={`/article/${entry.id}`} className={styles.historyLink}>
                    {entry.title}
                  </Link>
                  <span className={styles.historyTime}>
                    {new Date(entry.timestamp).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                    })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Settings Tab – enhanced */}
      {activeTab === 'settings' && (
        <div className={styles.tabContent}>
          <h3 className={styles.sectionTitle}>⚙️ Preferences</h3>
          <div className={styles.settingGroup}>
            <label className={styles.settingLabel}>Your main exam:</label>
            <select
              value={profile.exam}
              onChange={(e) => updateProfile({ exam: e.target.value })}
              className={styles.select}
            >
              {EXAMS.map((exam) => (
                <option key={exam} value={exam}>{exam}</option>
              ))}
            </select>
          </div>
          <div className={styles.settingGroup}>
            <label className={styles.settingLabel}>Topics you want to follow:</label>
            <div className={styles.topicCheckGrid}>
              {ALL_TOPICS.map((topic) => (
                <label key={topic} className={styles.topicCheckLabel}>
                  <input
                    type="checkbox"
                    checked={profile.topics.includes(topic)}
                    onChange={(e) => {
                      const newTopics = e.target.checked
                        ? [...profile.topics, topic]
                        : profile.topics.filter((t) => t !== topic);
                      updateProfile({ topics: newTopics });
                    }}
                  />
                  {topic.replace(/_/g, ' ')}
                </label>
              ))}
            </div>
          </div>

          {/* Data management */}
          <h3 className={styles.sectionTitle}>🗑️ Data Management</h3>
          <div className={styles.settingGroup}>
            <button className={styles.dangerBtn} onClick={handleClearHistory}>
              Clear Reading History
            </button>
            <button className={styles.dangerBtn} onClick={handleResetAll}>
              Reset All Data
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;