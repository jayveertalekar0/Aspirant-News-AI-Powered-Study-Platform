const BASE_URL = import.meta.env.VITE_API_URL || '';

export async function fetchArticles({ page = 1, limit = 10, source, topic, search, since_id } = {}) {
  const params = new URLSearchParams({ page, limit });
  if (source) params.set('source', source);
  if (topic) params.set('topic', topic);
  if (search) params.set('search', search);
  if (since_id) params.set('since_id', since_id);   // ← add this

  const res = await fetch(`${BASE_URL}/news?${params.toString()}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch articles (${res.status}): ${text}`);
  }
  return res.json();
}

export async function fetchArticleById(id) {
  const res = await fetch(`${BASE_URL}/news/${id}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Article not found (${res.status}): ${text}`);
  }
  return res.json();
}

export async function translateText(text, targetLang) {
  const res = await fetch(`${BASE_URL}/translate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, target_lang: targetLang }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Translation failed (${res.status}): ${text}`);
  }
  const data = await res.json();
  return data.translated;
}

export async function scrapeNewArticles() {
  const res = await fetch(`${BASE_URL}/scrape`, {
    method: 'POST',
  });
  if (!res.ok) {
    throw new Error(`Scrape request failed (${res.status})`);
  }
  return res.json();
}