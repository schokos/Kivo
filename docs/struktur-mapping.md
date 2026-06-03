# Kivo Struktur-Mapping

## Zweck
Dieses Dokument beschreibt die aktuelle technische Zuordnung von Verantwortlichkeiten in Kivo. Es ist die Referenz fuer Architektur-, Team- und Modulgrenzen.

## Ist-Zustand (Repo-Wahrheit)
- Einstiegspunkt: `index.html`
- Globales Styling: `src/styles/main.css`
- Core/Shell/Navigation: `src/js/core/*`
- Screen-Logik je Bereich: `src/js/screens/*`
- Gemeinsame Legacy-Lernscreen-Logik fuer Poolverwaltung, Statistik, KI-Lueckentext und Spaced-Repetition-Helfer: `src/js/screens/learn/*`
- Services fuer Supabase/Auth/Sync: `src/js/services/*`
- State/Utilities: `src/js/state/*`, `src/js/utils/*`
- Fach-/Content-Daten: `src/data/subjects/*`
- Fachkatalog-Einstieg: `src/data/subjects/subjects.json`
- Optionale KI-Personalisierung/Memory: UI in `src/js/screens/profile.js` und `src/js/screens/aibot.js`, Persistenz-/Merge-Logik in `src/js/services/auth.js` und `src/js/services/sync.js`

## Soll-Zustand (stabile Zielstruktur)
- Shell-/App-Rahmen bleibt in `index.html` + `src/js/core/*`.
- Fachliche UI-Logik bleibt in `src/js/screens/*`.
- Wiederverwendete Lernfunktionen duerfen unter `src/js/screens/learn/*` verbleiben, solange Shell und eingebettete Kurse dieselben Helfer teilen.
- Wenn Shell-Screens oder Lernmodi Funktionen aus `src/js/screens/learn/*` indirekt mitbenutzen, muessen die Script-Dateien im `index.html` in Abhaengigkeitsreihenfolge global eingebunden bleiben.
- Backend-nahe Logik bleibt in `src/js/services/*`.
- Content bleibt strikt unter `src/data/subjects/*`.

## Ownership-Modell
- App-Team:
  - `index.html`
  - `src/js/core/*`
  - `src/js/screens/*`
  - `src/styles/*`
- Service-/Backend-Team:
  - `src/js/services/*`
  - `src/js/state/*`
  - `src/js/utils/*`
- Content-Team:
  - `src/data/subjects/*`

## Migrations- und Aenderungsregeln
- Alte Strukturpfade duerfen nicht reaktiviert werden (kein Rueckfall auf Legacy-Datenpfade).
- Neue Feature-Logik darf nicht zentral in einem Monolith-File gesammelt werden, wenn ein passender Modulbereich existiert.
- Bei Verschiebung von Verantwortlichkeiten sind `LLM.md` und dieses Dokument im selben PR zu aktualisieren.

## Inputs / Outputs / Regeln (LLM-lesbar)
- Input: Neue Features, Refactors, Datei-Verschiebungen.
- Output: Aktualisierte Verantwortungszuordnung und konsistente Pfade.
- Regel: Jede Aenderung an Modulgrenzen muss hier dokumentiert werden.
