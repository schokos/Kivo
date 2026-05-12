# GitHub Pages Checkliste fuer Kivo

## Zweck
Diese Checkliste beschreibt den aktuellen statischen Deploy-Flow fuer Kivo auf GitHub Pages.

## Aktueller Deploy-Stand
- Einstieg im Root: `index.html`
- Statische Assets/CSS/JS werden relativ aus dem Repo geladen.
- Lesson-Seiten liegen unter `src/data/subjects/.../lessons/.../index.html`.

## GitHub-Einstellungen
1. Repository in GitHub oeffnen.
2. `Settings` -> `Pages`.
3. Unter `Build and deployment` als Source `Deploy from a branch` waehlen.
4. Branch waehlen (`main` oder euer Deploy-Branch).
5. Ordner `/ (root)` waehlen.
6. Speichern.

## Supabase-Abgleich
- In Supabase unter `Authentication` -> `URL Configuration` pruefen:
  - `Site URL` auf eure GitHub-Pages-URL setzen.
  - Redirect-URLs fuer Login/Flows bei Bedarf ergaenzen.

## Pflichtchecks nach Deploy
1. Laedt `index.html` korrekt?
2. Laden `src/styles/main.css` und `src/js/*` ohne 404?
3. Oeffnen Lesson-Seiten unter `src/data/subjects/.../lessons/.../index.html`?
4. Funktioniert Supabase-Login in der Pages-Domain?

## Doku-Pflicht bei Deploy-Aenderungen
- Wenn Einstiegspfade, Host-Annahmen oder Deploy-Regeln geaendert werden:
  - `LLM.md` aktualisieren.
  - Diese Checkliste im selben PR aktualisieren.
