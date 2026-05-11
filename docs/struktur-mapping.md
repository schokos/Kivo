# Kivo Struktur-Mapping

## Aktueller Stand
- `index.html` ist die Einstiegsseite.
- `app.html` ist die eigentliche Kivo-App.
- `src/styles/main.css` enthaelt das globale App-Styling.
- `src/js/...` enthaelt die globale App-Logik fuer Dashboard, Community, Profil, Kurse und Lernmodi.
- `src/data/courses/*/course.json` enthaelt Kurs-Metadaten.
- `src/data/courses/*/lektionen/*/index.html` ist fuer eigenstaendige Lernmodule gedacht.

## Architekturidee
- Haupt-App: Navigation, Login, Dashboard, Community, Profil
- Standalone-Lektionen: eigene HTML-, CSS- und JS-Dateien pro grossem Modul

## Team-Aufteilung
- App-Team: `app.html`, `src/js/*`, `src/styles/*`
- Content-/Modul-Team: `src/data/courses/*/lektionen/*`

## Beispiel
- Die Haupt-App verlinkt auf oder oeffnet ein Modul wie:
  - `src/data/courses/mathe/lektionen/geogebra/index.html`
- Das Modul kann komplett eigenstaendig weiterentwickelt werden.
