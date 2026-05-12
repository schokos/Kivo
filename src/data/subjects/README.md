# Subject-Datenstruktur

## Pflichtstruktur
- `src/data/subjects/subjects.json` listet alle Fächer
- `src/data/subjects/<fach>/subject.json` beschreibt ein Fach
- `src/data/subjects/<fach>/courses/<kurs>/course.json` beschreibt einen Kurs
- `src/data/subjects/<fach>/courses/<kurs>/lessons/<lektion>/index.html` ist ein eigenstaendiges Modul

## Hard-Cut-Status
- Die alte Struktur `src/data/courses/` wurde entfernt.
- Es gibt keine Kompatibilitaets-Fallbacks auf Legacy-Pfade.
- `index_alt.html` dient nur noch als historische Referenz.

