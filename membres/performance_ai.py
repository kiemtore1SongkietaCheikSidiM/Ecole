"""Analyse explicable des performances, sans service externe."""


def _subject_recommendation(subject, stats):
    average = stats.get('moyenne')
    if average is None:
        return None
    if average < 8:
        priority = 'haute'
        message = f'Revoir les bases de {subject} et prevoir un accompagnement regulier.'
    elif average < 10:
        priority = 'moyenne'
        message = f'Renforcer les exercices et la correction en {subject}.'
    else:
        priority = 'faible'
        message = f'Conserver les acquis en {subject} avec des exercices progressifs.'
    return {'matiere': subject, 'priorite': priority, 'moyenne': average, 'message': message}


def generate_performance_analysis(statistics):
    global_stats = statistics['global']
    average = global_stats['moyenne']
    if average is None:
        summary = 'Aucune note exploitable ne permet encore une analyse.'
        level = 'insuffisant'
    elif average < 10:
        summary = 'Les resultats sont en dessous du seuil de reussite; un suivi cible est recommande.'
        level = 'a_renforcer'
    elif average < 14:
        summary = 'Les resultats sont satisfaisants; la regularite peut encore progresser.'
        level = 'satisfaisant'
    else:
        summary = 'Les resultats sont tres satisfaisants; il faut consolider les acquis.'
        level = 'tres_satisfaisant'

    recommendations = [
        recommendation
        for subject, subject_stats in statistics['matieres'].items()
        if (recommendation := _subject_recommendation(subject, subject_stats))
    ]
    recommendations.sort(key=lambda item: {'haute': 0, 'moyenne': 1, 'faible': 2}[item['priorite']])
    return {
        'niveau': level,
        'resume': summary,
        'recommandations': recommendations,
        'limites': 'Analyse indicative basee uniquement sur les notes disponibles, sans diagnostic pedagogique automatise.',
    }
