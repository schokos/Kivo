# Kivo Struktur-Mapping

## Aktueller Stand
- `index.html` ist die Einstiegsseite.
- `app.html` ist die eigentliche Kivo-App.
- `src/styles/main.css` enthaelt das globale App-Styling.
- `src/js/...` enthaelt die globale App-Logik fuer Dashboard, Community, Profil, Faecher und Lernmodi.
- `src/data/subjects/*/subject.json` enthaelt Fach-Metadaten.
- `src/data/subjects/*/courses/*/course.json` enthaelt Kurs-Metadaten.
- `src/data/subjects/*/courses/*/lessons/*/index.html` ist fuer eigenstaendige Lernmodule gedacht.

## Architekturidee
- Haupt-App: Navigation, Login, Dashboard, Community, Profil
- Fachauswahl: z. B. Spanisch, Englisch, Deutsch, Mathe
- Kursauswahl innerhalb eines Fachs: z. B. Vokabeln, Grammatik
- Standalone-Lektionen: eigene HTML-, CSS- und JS-Dateien pro Modul

## Team-Aufteilung
- App-Team: `app.html`, `src/js/*`, `src/styles/*`
- Fach-/Content-Team: `src/data/subjects/*`
- Modul-Team: `src/data/subjects/*/courses/*/lessons/*`

## Hinweis
Die alte `src/data/courses/`-Struktur ist nur noch Altbestand. Neue Inhalte sollten in `src/data/subjects/` aufgebaut werden.
