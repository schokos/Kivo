# Kivo Struktur-Mapping (Hard Cut)

## Aktueller Stand
- `index.html` ist die Einstiegsseite.
- `app.html` ist die eigentliche Kivo-App.
- `src/styles/main.css` enthaelt globales Styling.
- `src/js/core/*` enthaelt Shell/UI/Navigation/Bootstrap.
- `src/js/screens/*` enthaelt die Fachbereiche und Lernmodi.
- `src/js/services/*` enthaelt Supabase, Auth und Sync.
- `src/data/subjects/subjects.json` ist der einzige Einstieg in den Fachkatalog.

## Verbindliche Content-Struktur
- `src/data/subjects/<fach>/subject.json`
- `src/data/subjects/<fach>/courses/<kurs>/course.json`
- `src/data/subjects/<fach>/courses/<kurs>/lessons/<lektion>/index.html`

## Team-Aufteilung
- App-Team: `app.html`, `src/js/core/*`, `src/js/screens/*`, `src/styles/*`
- Fach-/Content-Team: `src/data/subjects/*`
- Modul-Team: `src/data/subjects/*/courses/*/lessons/*`

## Migration-Entscheidung
- `src/data/courses/` wurde entfernt.
- Keine Runtime-Fallbacks auf alte Pfade.
- `index_alt.html` bleibt nur als Archiv/Referenz.
