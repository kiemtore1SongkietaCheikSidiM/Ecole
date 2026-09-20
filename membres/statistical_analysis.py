"""Calculs statistiques des resultats scolaires."""

from collections import defaultdict
from statistics import mean, median, pstdev


PASSING_SCORE = 10.0


def _normalised_note(note):
    if not isinstance(note, dict):
        return None
    try:
        value = float(note.get('note'))
        maximum = float(note.get('sur') or 20)
    except (TypeError, ValueError):
        return None
    if maximum <= 0 or value < 0:
        return None
    return max(0.0, min(20.0, value * 20 / maximum))


def _rounded(value):
    return round(float(value), 2)


def _empty_statistics():
    return {
        'nombre_notes': 0,
        'moyenne': None,
        'mediane': None,
        'ecart_type': None,
        'minimum': None,
        'maximum': None,
        'taux_reussite': None,
    }


def summarise_scores(scores):
    values = [float(score) for score in scores]
    if not values:
        return _empty_statistics()
    return {
        'nombre_notes': len(values),
        'moyenne': _rounded(mean(values)),
        'mediane': _rounded(median(values)),
        'ecart_type': _rounded(pstdev(values)),
        'minimum': _rounded(min(values)),
        'maximum': _rounded(max(values)),
        'taux_reussite': _rounded(sum(score >= PASSING_SCORE for score in values) * 100 / len(values)),
    }


def _record_scores(record):
    scores = []
    notes = record.notes if isinstance(record.notes, list) else []
    for note in notes:
        score = _normalised_note(note)
        if score is not None:
            scores.append(score)
    if record.composition is not None:
        try:
            scores.append(max(0.0, min(20.0, float(record.composition))))
        except (TypeError, ValueError):
            pass
    return scores


def analyse_records(records):
    all_scores = []
    by_subject = defaultdict(list)
    by_trimester = defaultdict(list)
    by_student = defaultdict(list)

    for record in records:
        scores = _record_scores(record)
        all_scores.extend(scores)
        subject = record.matiere or 'NON_RENSEIGNEE'
        by_subject[subject].extend(scores)
        by_trimester[str(record.trimestre)].extend(scores)
        by_student[record.eleve_id].extend(scores)

    return {
        'global': summarise_scores(all_scores),
        'matieres': {subject: summarise_scores(scores) for subject, scores in sorted(by_subject.items())},
        'trimestres': {trimester: summarise_scores(scores) for trimester, scores in sorted(by_trimester.items())},
        'eleves': {str(student_id): summarise_scores(scores) for student_id, scores in sorted(by_student.items())},
    }


def records_for_student(records, student_id):
    return [record for record in records if record.eleve_id == student_id]
