# Kivo Struktur-Mapping

## Was schon umgesetzt ist
- `index.html` ist der Einstiegspunkt.
- `src/styles/main.css` enthaelt das globale Styling.
- `src/js/app.js` enthaelt aktuell noch die zentrale Laufzeitlogik.
- `src/js/screens/*` sind die vorgesehenen Zielmodule fuer die vorhandenen Screens.
- `src/js/services/*` sind die vorgesehenen Zielmodule fuer Technik-Bausteine.
- `src/data/courses/*` ist die neue Struktur fuer redaktionelle Kursdaten.

## Aktuelle Screens aus der App
- `home`
- `courses`
- `challenges`
- `community`
- `cards`
- `quiz`
- `typing`
- `matching`
- `overview`
- `stats`
- `gap`
- `aibot`
- `profile`
- `shop`
- `pass`

## Empfohlene Team-Aufteilung
- Person 1: `src/js/screens/home.js`, `src/js/screens/challenges.js`
- Person 2: `src/js/screens/courses.js`, `src/js/screens/overview.js`
- Person 3: `src/js/screens/community.js`, `src/js/screens/profile.js`
- Person 4: `src/js/screens/learn/*`
- Person 5: `src/js/services/auth.js`, `src/js/services/sync.js`, `src/js/utils/storage.js`
- Content-Team: `src/data/courses/*`

## Wichtiger Hinweis
Die neuen Dateien sind als stabile Zielstruktur angelegt. Damit die App nicht auf einmal bricht, bleibt die bestehende Gesamtlogik vorerst in `src/js/app.js`.
Der naechste technische Schritt ist, die Funktionen schrittweise aus `app.js` in die neuen Dateien zu verschieben.
