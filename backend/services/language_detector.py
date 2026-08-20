import re


def detect_language_simple(text: str) -> str:
    telugu_chars = len(re.findall(r'[\u0C00-\u0C7F]', text))
    hindi_chars = len(re.findall(r'[\u0900-\u097F]', text))
    tamil_chars = len(re.findall(r'[\u0B80-\u0BFF]', text))
    kannada_chars = len(re.findall(r'[\u0C80-\u0CFF]', text))
    malayalam_chars = len(re.findall(r'[\u0D00-\u0D7F]', text))
    bengali_chars = len(re.findall(r'[\u0980-\u09FF]', text))
    gujarati_chars = len(re.findall(r'[\u0A80-\u0AFF]', text))
    punjabi_chars = len(re.findall(r'[\u0A00-\u0A7F]', text))

    counts = {
        'te': telugu_chars,
        'hi': hindi_chars,
        'ta': tamil_chars,
        'kn': kannada_chars,
        'ml': malayalam_chars,
        'bn': bengali_chars,
        'mr': hindi_chars,  # Hindi/Marathi share Unicode range
        'gu': gujarati_chars,
        'pa': punjabi_chars,
    }

    max_lang = max(counts, key=counts.get)
    if counts[max_lang] > 2:
        return max_lang
    return 'en'
