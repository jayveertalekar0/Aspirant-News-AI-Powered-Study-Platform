export const initialArticleState = {
  articles: [],
  filters: { topic: null, source: null, search: '', saved: false, refresh: null },   // ← added refresh
  savedArticles: [],
  summaryCache: {},
  loadingSummaries: {},
  loading: false,
  error: null,
};

export function articleReducer(state, action) {
  switch (action.type) {
    case 'SET_ARTICLES':
      return { ...state, articles: action.payload };

    case 'SET_FILTER':
      return {
        ...state,
        filters: { ...state.filters, [action.payload.filterType]: action.payload.value },
      };

    case 'TOGGLE_SAVED': {
      const id = action.payload;
      const isSaved = state.savedArticles.includes(id);
      const savedArticles = isSaved
        ? state.savedArticles.filter((s) => s !== id)
        : [...state.savedArticles, id];
      return { ...state, savedArticles };
    }

    case 'LOAD_SAVED_ARTICLES':
      return { ...state, savedArticles: action.payload };

    case 'CACHE_SUMMARY':
      return {
        ...state,
        summaryCache: { ...state.summaryCache, [action.payload.id]: action.payload.summary },
      };

    case 'SET_LOADING_SUMMARY':
      return {
        ...state,
        loadingSummaries: { ...state.loadingSummaries, [action.payload.id]: action.payload.loading },
      };

    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    default:
      return state;
  }
}