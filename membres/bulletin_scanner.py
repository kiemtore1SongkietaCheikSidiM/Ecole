"""Extraction de donnees depuis des bulletins PDF texte ou images."""

import re
from pathlib import Path


MAX_PDF_SIZE = 10 * 1024 * 1024


def extract_pdf_text(uploaded_file):
    """Extract text with pypdf, then use OCR when the PDF contains only images."""
    from pypdf import PdfReader

    reader = PdfReader(uploaded_file)
    pages = [(page.extract_text() or '').strip() for page in reader.pages]
    text = '\n'.join(page for page in pages if page)
    if text.strip():
        return text, len(reader.pages)

    try:
        import fitz
        import pytesseract

        uploaded_file.seek(0)
        document = fitz.open(stream=uploaded_file.read(), filetype='pdf')
        ocr_pages = []
        for page in document:
            image = page.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)
            ocr_pages.append(pytesseract.image_to_string(image.tobytes('png'), lang='fra+eng').strip())
        text = '\n'.join(page for page in ocr_pages if page)
    except (ImportError, RuntimeError, OSError):
        text = ''
    return text, len(reader.pages)


def _find_value(text, labels):
    label_pattern = '|'.join(re.escape(label) for label in labels)
    match = re.search(rf'(?im)^\s*(?:{label_pattern})(?!\w)\s*[:\-]?\s*(.+?)\s*$', text)
    return match.group(1).strip() if match else None


def _parse_student(text):
    full_name = _find_value(text, ('Nom et prénom', 'Nom/Prénom', 'Eleve', 'Élève'))
    nom = _find_value(text, ('Nom',))
    prenom = _find_value(text, ('Prénom', 'Prenom'))
    if full_name and not (nom and prenom):
        parts = full_name.split(None, 1)
        nom = nom or parts[0]
        prenom = prenom or (parts[1] if len(parts) > 1 else None)
    return {
        'nom': nom,
        'prenom': prenom,
        'classe': _find_value(text, ('Classe', 'Niveau')),
    }


def _parse_notes(text):
    notes = []
    ignored_labels = {'nom', 'prenom', 'prénom', 'classe', 'niveau', 'eleve', 'élève', 'composition'}
    note_pattern = re.compile(
        r'^\s*(?P<matiere>[^:;\d\n][^:;\n]*?)\s*[:\-]?\s*'
        r'(?P<note>\d{1,2}(?:[\.,]\d{1,2})?)\s*(?:/\s*(?P<sur>\d{1,3}))?'
        r'(?:\s*(?:coef(?:ficient)?\.?\s*[:=]?\s*(?P<coefficient>\d+(?:[\.,]\d+)?)))?\s*$',
        re.IGNORECASE,
    )
    for line in text.splitlines():
        match = note_pattern.match(line)
        if not match or match.group('matiere').strip().lower() in ignored_labels:
            continue
        notes.append({
            'matiere': match.group('matiere').strip(),
            'note': float(match.group('note').replace(',', '.')),
            'sur': int(match.group('sur') or 20),
            'coefficient': float(match.group('coefficient').replace(',', '.')) if match.group('coefficient') else None,
        })
    return notes


def _parse_composition(text):
    value = _find_value(text, ('Composition', 'Composition générale', 'Examen'))
    if value:
        match = re.search(r'\d{1,2}(?:[\.,]\d{1,2})?', value)
        if match:
            return float(match.group().replace(',', '.'))
    return None


def scan_bulletin(uploaded_file):
    """Valide un bulletin puis retourne l'identite, les notes et la composition."""
    if not uploaded_file.name.lower().endswith('.pdf'):
        raise ValueError('Le fichier doit être au format PDF.')
    if uploaded_file.size > MAX_PDF_SIZE:
        raise ValueError('Le fichier PDF ne doit pas dépasser 10 Mo.')

    text, pages = extract_pdf_text(uploaded_file)
    if not text.strip():
        raise ValueError('Aucun texte détectable. Ce PDF est probablement scanné comme image; activez un moteur OCR.')

    student = _parse_student(text)
    return {
        'nom_fichier': Path(uploaded_file.name).name,
        'pages': pages,
        'eleve': student,
        'notes': _parse_notes(text),
        'composition': _parse_composition(text),
        'texte_detecte': text,
    }