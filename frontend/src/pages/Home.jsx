import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAppContext } from '../state/useAppContext';
import { fetchArticles } from '../services/api';
import NewsCard from '../components/NewsCard';
import SearchBar from '../components/SearchBar';
import HorizontalTopics from '../components/HorizontalTopics';
import styles from '../styles/Home.module.css';

const PER_PAGE = 10;
const POLL_INTERVAL = 2000;
const MAX_POLL_TIME = 15000;
const MIN_NEW_ARTICLES = 5;        // wait for at least 5 new articles before showing

export default function Home() {
  const { state, setFilter } = useAppContext();
  const { filters } = state;
  const [articles, setArticles] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [ready, setReady] = useState(false);          // ← allow refresh only after first load

  const fetching = useRef(false);
  const loaderRef = useRef(null);
  const topSentinelRef = useRef(null);
  const seenIds = useRef(new Set());
  const lastFetchedPage = useRef(0);
  const pauseObserver = useRef(false);
  const isRefreshing = useRef(false);
  const newestIdRef = useRef(0);
  const topTimer = useRef(null);                     // delay timer

  // Reset on filter change
  useEffect(() => {
    setPage(1);
    setArticles([]);
    setHasMore(true);
    seenIds.current.clear();
    lastFetchedPage.current = 0;
    pauseObserver.current = true;
    setTimeout(() => { pauseObserver.current = false; }, 2000);
    isRefreshing.current = false;
    newestIdRef.current = 0;
    setRefreshing(false);
    setReady(false);               // wait for first fetch
    clearTimeout(topTimer.current);
  }, [filters.topic, filters.source, filters.search, filters.refresh]);

  // Pause observer when tab becomes visible again
  useEffect(() => {
    const handleVisibility = () => {
      if (!document.hidden) {
        pauseObserver.current = true;
        setTimeout(() => { pauseObserver.current = false; }, 2000);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  // ---- Top sentinel: triggers refresh after pause at top ----
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isRefreshing.current && !pauseObserver.current && ready) {
          // require a 0.5s pause before firing
          clearTimeout(topTimer.current);
          topTimer.current = setTimeout(() => {
            handleTopRefresh();
          }, 500);
        } else {
          clearTimeout(topTimer.current);
        }
      },
      { threshold: 0.1 }
    );
    if (topSentinelRef.current) observer.observe(topSentinelRef.current);
    return () => {
      observer.disconnect();
      clearTimeout(topTimer.current);
    };
  }, [ready]);   // reactivate when ready changes

  // ---- Bottom sentinel: infinite scroll ----
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasMore &&
          !fetching.current &&
          !pauseObserver.current
        ) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 }
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore]);

  const fetchPage = useCallback(async (pageNum) => {
    if (fetching.current || pageNum === lastFetchedPage.current) return;
    fetching.current = true;
    setLoading(true);

    try {
      const data = await fetchArticles({
        page: pageNum,
        limit: PER_PAGE,
        source: filters.source,
        topic: filters.topic,
        search: filters.search,
      });

      const freshArticles = (data.articles || []).filter(
        (a) => !seenIds.current.has(a.id)
      );
      freshArticles.forEach((a) => seenIds.current.add(a.id));

      setArticles((prev) =>
        pageNum === 1 ? freshArticles : [...prev, ...freshArticles]
      );
      setHasMore(data.page < data.pages);
      setPage(data.page);
      lastFetchedPage.current = data.page;

      freshArticles.forEach((a) => {
        if (a.id > newestIdRef.current) newestIdRef.current = a.id;
      });

      if (pageNum === 1) setReady(true);   // allow refresh after first page loaded

      pauseObserver.current = true;
      setTimeout(() => { pauseObserver.current = false; }, 2000);
    } catch (err) {
      console.error('Failed to fetch articles:', err);
    } finally {
      fetching.current = false;
      setLoading(false);
    }
  }, [filters.topic, filters.source, filters.search]);

  useEffect(() => {
    fetchPage(page);
  }, [page]);

  const handleTopRefresh = async () => {
    if (isRefreshing.current) return;
    isRefreshing.current = true;
    setRefreshing(true);

    try {
      await fetch('/scrape', { method: 'POST' });
    } catch { /* ignore */ }

    const startTime = Date.now();
    let newArticles = [];

    while (Date.now() - startTime < MAX_POLL_TIME && newArticles.length < MIN_NEW_ARTICLES) {
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
      try {
        const res = await fetchArticles({
          page: 1,
          limit: 20,
          source: filters.source,
          topic: filters.topic,
          search: filters.search,
          since_id: newestIdRef.current,
        });
        newArticles = res.articles || [];
      } catch { /* keep polling */ }
    }

    if (newArticles.length > 0) {
      const fresh = newArticles.filter((a) => !seenIds.current.has(a.id));
      fresh.forEach((a) => seenIds.current.add(a.id));
      setArticles((prev) => [...fresh, ...prev]);
      fresh.forEach((a) => {
        if (a.id > newestIdRef.current) newestIdRef.current = a.id;
      });
    }

    isRefreshing.current = false;
    setRefreshing(false);
  };

  const handleTopicChange = (topic) => {
    setFilter('topic', topic);
  };

  return (
    <div>
      {/* Top sentinel – placed naturally at the very top of the feed (no negative margin) */}
      <div ref={topSentinelRef} style={{ height: 1 }} />

      {/* Spinner shown only during active refresh */}
      {refreshing && (
        <div className={styles.refreshIndicator}>
          <div className={styles.spinner} />
          <span className={styles.refreshText}>Fetching fresh news…</span>
        </div>
      )}

      <SearchBar />
      <HorizontalTopics selected={filters.topic} onSelect={handleTopicChange} />
      <div className={styles.feed}>
        {articles.length === 0 && !loading ? (
          <div className={styles.noResults}>No articles found.</div>
        ) : (
          articles.map((a) => <NewsCard key={a.id} article={a} />)
        )}
      </div>

      <div ref={loaderRef} style={{ height: 80, margin: '2rem 0' }}>
        {loading && <div className={styles.status}>Loading more articles...</div>}
        {!hasMore && articles.length > 0 && (
          <div className={styles.noResults}>You've reached the end.</div>
        )}
      </div>
    </div>
  );
}