# summariser.py
import logging
import re
from collections import Counter

logger = logging.getLogger(__name__)

STOP_WORDS = {
    "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for",
    "of", "with", "by", "from", "is", "are", "was", "were", "be", "been",
    "being", "have", "has", "had", "do", "does", "did", "will", "would",
    "could", "should", "may", "might", "shall", "can", "need", "dare",
    "ought", "used", "it", "its", "they", "them", "their", "he", "she",
    "his", "her", "we", "us", "our", "you", "your", "i", "my", "me",
    "not", "no", "nor", "so", "if", "then", "than", "too", "very",
    "just", "about", "above", "after", "again", "all", "also", "any",
    "because", "before", "between", "both", "each", "few", "more",
    "most", "other", "some", "such", "only", "own", "same", "while",
    "who", "how", "what", "which", "where", "when",
}

def clean_text(text: str) -> str:
    text = text.replace("\n", " ")
    text = " ".join(text.split())
    junk_phrases = [
        "Story continues below",
        "Read more",
        "Click here",
        "Advertisement",
        "View this post on Instagram",
        "A post shared by",
        "Story continues below this ad",
        "Written by",
        "Photo credit",
        "©",
        "Express Photo",
        "Taking to X (formerly Twitter)",
    ]
    for j in junk_phrases:
        text = text.replace(j, "")
    return text.strip()

def split_sentences(text: str):
    return re.split(r'(?<=[.!?])\s+', text)

def rank_sentences(text: str, top_n: int = 2) -> str:
    sentences = split_sentences(text)
    if len(sentences) <= top_n:
        return text
    words = re.findall(r'\b[a-zA-Z]{3,}\b', text.lower())
    words = [w for w in words if w not in STOP_WORDS]
    if not words:
        return text
    word_freq = Counter(words)
    max_freq = max(word_freq.values(), default=1)
    sentence_scores = []
    for sent in sentences:
        sent_words = re.findall(r'\b[a-zA-Z]{3,}\b', sent.lower())
        sent_words = [w for w in sent_words if w in word_freq]
        score = sum(word_freq[w] / max_freq for w in sent_words) / max(1, len(sent_words))
        sentence_scores.append((score, sent))
    sentence_scores.sort(key=lambda x: x[0], reverse=True)
    top_sentences = [sent for _, sent in sentence_scores[:top_n]]
    ordered = [sent for sent in sentences if sent in top_sentences]
    return " ".join(ordered)

def summarize_text(content: str, title: str = "") -> str:
    """Offline extractive summariser – no model needed."""
    try:
        content = clean_text(content)
        base_text = f"{title}. {content}" if title else content
        sentences = split_sentences(base_text)
        if len(sentences) <= 2:
            return base_text
        top = rank_sentences(base_text, top_n=2)
        return top if top else sentences[0]
    except Exception as e:
        logger.error(f"Summarisation failed: {e}")
        clean = clean_text(content)
        return clean[:200] + ("..." if len(clean) > 200 else "")