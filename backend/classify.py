import re

PATTERNS = {
    'politics': r'\bpolitics?\b|\belection\b|\bparliament\b|\bmla\b|\bbjp\b|\bcongress\b|\bpresident\b|\bpm\b|\bcm\b',
    'economy': r'\beconomy\b|\bgdp\b|\bstock\b|\bsensex\b|\bnifty\b|\binflation\b|\bbudget\b|\btax\b|\brbi\b',
    'international': r'\binternational\b|\bglobal\b|\bworld\b|\bun\b|\bforeign\b|\bdiplomat\b|\bg20\b|\bimf\b',
    'science_tech': r'\btechnology\b|\btech\b|\bai\b|\bsoftware\b|\bgadget\b|\bstartup\b|\bisro\b|\bnasa\b|\bdrdo\b',
    'environment': r'\benvironment\b|\bclimate\b|\bpollution\b|\bforest\b|\bwildlife\b|\bglobal warming\b',
    'health': r'\bhealth\b|\bcovid\b|\bhospital\b|\bmedical\b|\bdisease\b|\bwho\b',
    'education': r'\beducation\b|\bschool\b|\bcollege\b|\bexam\b|\buniversity\b|\bneet\b|\bjee\b',
    'sports': r'\bsports?\b|\bcricket\b|\bfootball\b|\bolympic\b|\btournament\b|\bleague\b',
    'history_culture': r'\bhistory\b|\bmonument\b|\bheritage\b|\barchaeology\b|\bculture\b|\bfestival\b',
    'geography': r'\bgeography\b|\briver\b|\bmountain\b|\bearthquake\b|\bvolcano\b|\bcyclone\b',
    'defence_security': r'\bdefence\b|\barmy\b|\bnavy\b|\bair force\b|\bterror\b|\bcyber\b|\bsoldier\b',
    'law_justice': r'\blaw\b|\bcourt\b|\bsupreme court\b|\bhigh court\b|\bjudge\b|\bverdict\b|\bconstitution\b',
}

def guess_topic(title: str = '', content_preview: str = '') -> str:
    text = (title + ' ' + content_preview).lower()
    for topic, pattern in PATTERNS.items():
        if re.search(pattern, text):
            return topic
    return 'other'