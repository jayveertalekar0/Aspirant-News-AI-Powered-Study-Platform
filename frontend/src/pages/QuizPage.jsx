import React, { useState, useMemo } from 'react';
import { useAppContext } from '../state/useAppContext';
import { generateQuiz } from '../utils/generateQuiz';
import BackButton from '../components/BackButton';
import styles from '../styles/QuizPage.module.css';

function QuizPage() {
  const { state, addToQuizHistory } = useAppContext();
  const { articles } = state;

  // Articles from the last 3 days (to increase question pool)
  const recentArticles = useMemo(() => {
    const last3days = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    return articles.filter((a) => {
      if (!a.scraped_at) return false;
      return new Date(a.scraped_at) >= last3days;
    });
  }, [articles]);

  const questions = useMemo(() => generateQuiz(recentArticles), [recentArticles]);

  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const handleSelect = (questionId, option) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const handleSubmit = () => {
    let correct = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) correct++;
    });
    setScore(correct);
    setSubmitted(true);
    addToQuizHistory(correct, questions.length);
  };

  const handleRetry = () => {
    setAnswers({});
    setSubmitted(false);
    setScore(0);
    setCurrentQuestion(0);
  };

  if (recentArticles.length < 2) {
    return (
      <div className={styles.container}>
        <BackButton />
        <h2 className={styles.title}>📝 Daily Current Affairs Quiz</h2>
        <p className={styles.empty}>
          Not enough articles yet. Try scraping more news or check back later.
        </p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className={styles.container}>
        <BackButton />
        <h2 className={styles.title}>📝 Daily Current Affairs Quiz</h2>
        <p className={styles.empty}>
          Could not generate quiz questions. Need at least 2 articles from different sources or topics.
        </p>
      </div>
    );
  }

  const progress = Math.round(((currentQuestion + 1) / questions.length) * 100);
  const isSourceQuiz = questions[0].mode === 'sourceGuess';
  const instruction = isSourceQuiz
    ? 'Identify which news source published each headline.'
    : 'Identify the topic of each headline.';

  return (
    <div className={styles.container}>
      <BackButton />
      <h2 className={styles.title}>📝 Daily Current Affairs Quiz</h2>
      <p className={styles.subtitle}>{instruction}</p>

      {/* Progress bar */}
      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: `${progress}%` }} />
      </div>
      <p className={styles.progressText}>
        Question {currentQuestion + 1} of {questions.length}
      </p>

      {submitted && (
        <div className={styles.resultBanner}>
          🎯 You scored <strong>{score}</strong> out of {questions.length}!
          <button className={styles.retryBtn} onClick={handleRetry}>
            Try Again
          </button>
        </div>
      )}

      <div className={styles.questionCard}>
        <p className={styles.questionTitle}>
          {questions[currentQuestion].title}
        </p>
        <div className={styles.options}>
          {questions[currentQuestion].options.map((opt) => {
            let optionClass = styles.option;
            if (submitted) {
              if (opt === questions[currentQuestion].correctAnswer) {
                optionClass += ` ${styles.correct}`;
              } else if (
                answers[questions[currentQuestion].id] === opt &&
                opt !== questions[currentQuestion].correctAnswer
              ) {
                optionClass += ` ${styles.wrong}`;
              }
            } else if (answers[questions[currentQuestion].id] === opt) {
              optionClass += ` ${styles.selected}`;
            }
            return (
              <button
                key={opt}
                className={optionClass}
                onClick={() => handleSelect(questions[currentQuestion].id, opt)}
                disabled={submitted}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      <div className={styles.navButtons}>
        <button
          className={styles.navBtn}
          onClick={() => setCurrentQuestion((p) => Math.max(0, p - 1))}
          disabled={currentQuestion === 0}
        >
          ← Previous
        </button>
        {currentQuestion < questions.length - 1 ? (
          <button
            className={styles.navBtn}
            onClick={() => setCurrentQuestion((p) => Math.min(questions.length - 1, p + 1))}
          >
            Next →
          </button>
        ) : (
          !submitted && (
            <button className={styles.submitBtn} onClick={handleSubmit}>
              Submit Quiz
            </button>
          )
        )}
      </div>

      <div className={styles.dots}>
        {questions.map((q, idx) => (
          <button
            key={q.id}
            className={`${styles.dot} ${
              idx === currentQuestion ? styles.dotActive : ''
            } ${
              submitted && answers[q.id] === q.correctAnswer
                ? styles.dotCorrect
                : submitted && answers[q.id] !== q.correctAnswer
                ? styles.dotWrong
                : ''
            }`}
            onClick={() => setCurrentQuestion(idx)}
          >
            {idx + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

export default QuizPage;