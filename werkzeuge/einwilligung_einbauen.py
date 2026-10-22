#!/usr/bin/env python3
"""Baut assets/js/einwilligung.js wortgleich in alle Spiele ein, die etwas speichern.

Aufruf im Hauptordner des Repositorys:  python3 werkzeuge/einwilligung_einbauen.py
Der Block steht zwischen <!-- EINWILLIGUNG --> und <!-- /EINWILLIGUNG --> direkt nach <meta charset>
und wird bei jedem Aufruf ersetzt. So laufen die Spiele weiter als einzelne Dateien, auch offline.
"""
import pathlib
import re
import sys

WURZEL = pathlib.Path(__file__).resolve().parent.parent
QUELLE = WURZEL / 'assets' / 'js' / 'einwilligung.js'
SPIELE = [
    'Das-Raetsel-von-Abteil-7.html',
    'Der-Kasus-Teich.html',
    'Der-Zeitfaden.html',
    'Die-Faelscherwerkstatt.html',
    'Die-Wortwurfbude.html',
]

code = QUELLE.read_text(encoding='utf-8').strip()
block = '<!-- EINWILLIGUNG -->\n<script>\n' + code + '\n</script>\n<!-- /EINWILLIGUNG -->'
muster = re.compile(r'<!-- EINWILLIGUNG -->.*?<!-- /EINWILLIGUNG -->', re.S)

for name in SPIELE:
    pfad = WURZEL / 'Programme' / name
    text = pfad.read_text(encoding='utf-8')
    if muster.search(text):
        neu = muster.sub(lambda m: block, text, count=1)
    else:
        treffer = re.search(r'<meta charset=[^>]*>', text, re.I)
        if not treffer:
            sys.exit(f'{name}: kein <meta charset> gefunden')
        neu = text[:treffer.end()] + '\n' + block + text[treffer.end():]
    if neu != text:
        pfad.write_text(neu, encoding='utf-8')
        print('eingebaut:', name)
    else:
        print('unverändert:', name)
