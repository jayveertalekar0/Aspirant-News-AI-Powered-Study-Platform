// Generates MCQ quiz questions from articles.
// Modes:
// - "sourceGuess"  → Which source published: <title>? (needs ≥3 sources)
// - "topicGuess"   → Which topic: <title>? (needs ≥1 article)

const ALL_TOPICS = [
  'politics', 'economy', 'international', 'science_tech', 'environment',
  'health', 'education', 'sports', 'history_culture', 'geography',
  'defence_security', 'law_justice',
];

export function generateQuiz(articles) {
  if (!articles || articles.length < 2) return [];

  // Try source‑based quiz first (need ≥3 distinct sources)
  const allSources = [...new Set(articles.map((a) => a.source).filter(Boolean))];
  if (allSources.length >= 3) {
    return articles.slice(0, 10).map((article) => {
      const correctAnswer = article.source || 'Unknown';
      const otherSources = allSources
        .filter((s) => s !== correctAnswer)
        .sort(() => Math.random() - 0.5)
        .slice(0, 2);
      const options = [correctAnswer, ...otherSources, 'None of these']
        .sort(() => Math.random() - 0.5);

      return {
        id: article.id,
        title: article.title,
        correctAnswer,
        options,
        mode: 'sourceGuess',
      };
    });
  }

  // Fallback: topic‑based quiz (works with 2+ articles)
  return articles.slice(0, 10).map((article) => {
    const correctTopic = article.topic || 'other';
    const otherTopics = ALL_TOPICS
      .filter((t) => t !== correctTopic)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    const options = [correctTopic, ...otherTopics]
      .sort(() => Math.random() - 0.5);

    return {
      id: article.id,
      title: article.title,
      correctAnswer: correctTopic,
      options: options.map((t) => t.replace(/_/g, ' ')),
      mode: 'topicGuess',
    };
  });
}