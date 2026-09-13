"""Extraction et normalisation des creneaux d'un emploi du temps PDF."""

import re
from pathlib import Path

from .bulletin_scanner import extract_pdf_text
from .models import MATIERE_CHOICES, NIVEAU_CHOICES


MAX_TIMETABLE_SIZE = 10 * 1024 * 1024
DAY_NAMES = {
    'LUNDI': 'LUNDI',
    'MARDI': 'MARDI',
    'MERCREDI': 'MERCREDI',
    'JEUDI': 'JEUDI',
    'VENDREDI': 'VENDREDI',
    'SAMEDI': 'SAMEDI',
}
TIME_RANGE_PATTERN = re.compile(
    r'(?P<start>\d{1,2}[:h]\d{2})\s*(?:-|–|a|à)\s*(?P<end>\d{1,2}[:h]\d{2})',
    re.IGNORECASE,
)
TIME_PAIR_PATTERN = re.compile(r'(?P<start>\d{1,2}[:h]\d{2})\s+(?P<end>\d{1,2}[:h]\d{2})', re.IGNORECASE)


def _normalise_time(value):
    return value.lower().replace('h', ':')


def _find_choice(text, choices):
    for value, label in choices:
        if re.search(rf'(?<!\w){re.escape(value)}(?!\w)', text, re.IGNORECASE):
            return value
        if re.search(rf'(?<!\w){re.escape(label)}(?!\w)', text, re.IGNORECASE):
            return value
    return None


def _extract_subject(text):
    subject = _find_choice(text, MATIERE_CHOICES)
    if subject:
        return subject

    aliases = {
        'MATHS': 'MATHEMATIQUE',
        'MATHEMATIQUES': 'MATHEMATIQUE',
        'FRANCAIS': 'FRANCAIS',
        'FRANÇAIS': 'FRANCAIS',
        'HISTOIRE': 'HISTOIRE_GEOGRAPHIE',
        'GEOGRAPHIE': 'HISTOIRE_GEOGRAPHIE',
        'PHYSIQUE': 'PHYSIQUE_CHIMIE',
        'CHIMIE': 'PHYSIQUE_CHIMIE',
    }
    upper_text = text.upper()
    return next((value for alias, value in aliases.items() if alias in upper_text), 'FRANCAIS')


def _extract_class(text):
    return _find_choice(text.upper(), NIVEAU_CHOICES)


def _extract_room(text):
    match = re.search(r'\b(?:salle|sal|room)\s*[:#-]?\s*([\w/-]+)', text, re.IGNORECASE)
    return match.group(1) if match else ''


def scan_timetable(uploaded_file):
    """Retourne les creneaux detectes avec classe, jour, horaires et salle."""
    if not uploaded_file.name.lower().endswith('.pdf'):
        raise ValueError('Le fichier doit être au format PDF.')
    if uploaded_file.size > MAX_TIMETABLE_SIZE:
        raise ValueError('Le fichier PDF ne doit pas dépasser 10 Mo.')

    text, pages = extract_pdf_text(uploaded_file)
    if not text.strip():
        raise ValueError('Aucun texte détectable dans le fichier. Activez un moteur OCR pour les PDF image.')

    current_class = None
    entries = []
    for raw_line in text.splitlines():
        line = ' '.join(raw_line.split())
        if not line:
            continue
        detected_class = _extract_class(line)
        if detected_class:
            current_class = detected_class

        day_match = re.search(r'(?<!\w)(' + '|'.join(DAY_NAMES) + r')(?!\w)', line, re.IGNORECASE)
        time_match = TIME_RANGE_PATTERN.search(line) or TIME_PAIR_PATTERN.search(line)
        if not day_match or not time_match or not current_class:
            continue

        remaining = line[:time_match.start()] + line[time_match.end():]
        remaining = re.sub(r'(?<!\w)(' + '|'.join(DAY_NAMES) + r')(?!\w)', '', remaining, flags=re.IGNORECASE)
        entries.append({
            'classe': current_class,
            'jour': DAY_NAMES[day_match.group(1).upper()],
            'heure_debut': _normalise_time(time_match.group('start')),
            'heure_fin': _normalise_time(time_match.group('end')),
            'matiere': _extract_subject(remaining),
            'salle': _extract_room(remaining),
        })

    if not entries:
        raise ValueError('Aucun créneau détecté. Utilisez un PDF texte ou un PDF scanné avec OCR.')

    return {
        'nom_fichier': Path(uploaded_file.name).name,
        'pages': pages,
        'classes': sorted({entry['classe'] for entry in entries}),
        'creneaux': entries,
    }