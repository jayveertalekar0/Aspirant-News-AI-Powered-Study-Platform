# translate.py
import time
from deep_translator import GoogleTranslator

LANGUAGE_MAP = {
    "hi": "hindi",
    "mr": "marathi",
    "en": "english"
}

def translate_to_language(text: str, target_lang: str) -> str:
    """Translate text with retries."""
    if target_lang not in LANGUAGE_MAP:
        raise ValueError(f"Unsupported language: {target_lang}")
    if not text:
        return text

    last_error = None
    for attempt in range(3):
        try:
            translated = GoogleTranslator(source='auto', target=target_lang).translate(text)
            return translated
        except Exception as e:
            last_error = e
            time.sleep(1)
    raise last_error