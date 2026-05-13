export function guessTopic(title = '', preview = '') {
  const text = (title + ' ' + preview).toLowerCase();
  if (/\bpolitics?\b|\belection\b|\bparliament\b|\bmla\b|\bbjp\b|\bcongress\b/.test(text)) return 'politics';
  if (/\beconomy\b|\bgdp\b|\bstock\b|\binflation\b|\bbudget\b|\btax\b/.test(text)) return 'economy';
  if (/\btechnology\b|\btech\b|\bai\b|\bsoftware\b|\bgadget\b|\bstartup\b/.test(text)) return 'technology';
  if (/\binternational\b|\bglobal\b|\bworld\b|\bun\b|\bforeign\b|\bdiplomat\b/.test(text)) return 'international';
  if (/\bsports?\b|\bcricket\b|\bfootball\b|\bolympic\b|\btournament\b|\bleague\b/.test(text)) return 'sports';
  if (/\bhealth\b|\bcovid\b|\bhospital\b|\bmedical\b|\bdisease\b/.test(text)) return 'health';
  if (/\beducation\b|\bschool\b|\bcollege\b|\bexam\b|\buniversity\b/.test(text)) return 'education';
  if (/\bentertainment\b|\bfilm\b|\bmovie\b|\bbollywood\b|\bhollywood\b|\bcinema\b/.test(text)) return 'entertainment';
  return 'other';
}

export function applyFilters(articles, filters, savedArticles) {
  let result = [...articles];
  if (filters.saved) return result.filter(a => savedArticles.includes(a.id));
  if (filters.topic) result = result.filter(a => guessTopic(a.title, a.content_preview) === filters.topic);
  if (filters.source) result = result.filter(a => a.source === filters.source);
  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(a => `${a.title || ''} ${a.content_preview || ''}`.toLowerCase().includes(q));
  }
  return result;
}