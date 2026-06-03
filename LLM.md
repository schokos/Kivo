# LLM Router fuer Kivo

Diese Datei ist der zentrale Einstieg fuer LLMs und Agenten. Ziel ist ein schneller, robuster Projektueberblick mit klaren Pflegepflichten fuer Dokumentation bei jeder relevanten Aenderung.

## 1) Projektueberblick

Kivo ist eine browserbasierte Lernplattform mit statischem Frontend (`index.html`) und Supabase als Backend. Lernmodi, KI-Chat, Gamification und Social-Funktionen laufen ohne Build-Tooling direkt im Browser.

- Einstieg: `index.html`
- Styling: `src/styles/main.css`
- App-Logik: `src/js/**`
- Inhalte/Faecher: `src/data/subjects/**`
- Deployment: GitHub Pages (statisch)

### Temporaere Architektur-Notizen (2026-05-13)

- Vokabel-Lernmodi wurden aus den zentralen `src/js/screens/learn/*`-Einstiegen ausgelagert und laufen nun als Subject-Course unter `src/data/subjects/english/courses/vocabulary/`.
- Kurse werden im Kivo-System eingebettet geladen (Iframe im `courses`-Screen), damit Shell und BOTTOM NAV sichtbar bleiben.
- Die Shell-Screens `overview`, `stats` und `gap` nutzen weiterhin gemeinsame Legacy-Lernlogik aus `src/js/screens/learn/` und muessen von `index.html` exakt aus diesem Unterordner geladen werden.
- Die Spaced-Repetition-Helfer in `src/js/screens/learn/cards.js` werden auch ausserhalb des Kartenmodus verwendet (z. B. in Pool-Verwaltung, Statistik, Quiz, Typing und Matching) und muessen deshalb im globalen Script-Bootstrap vor diesen Abhaengigkeiten geladen werden.
- Der KI-Chat speichert optionale personalisierte Memory-Hinweise in `profiles.chat_data.memory` und im lokalen Chat-Payload. Nutzung und Speicherung sind nur nach ausdruecklicher Aktivierung ueber die Profileinstellungen erlaubt.
- Temporaer entfernt bis Neufassung:
  - Foto-Import (UI-Entry-Points und Modal-Zugang)
  - Dashboard-Bereiche `Empfohlenes Fach` und `Faecher entdecken`
  - Community-Bereich `Pool an Freund senden` (Pools-Tab ausgeblendet)

## 2) Architektur-Kern

Zweck:
- Lern- und Uebungsfunktionen fuer mehrere Faecher
- KI-gestuetzte Unterstuetzung im Bereich Chat/Vokabeln
- Local-first Nutzererlebnis mit nachgelagerter Synchronisation
- Erweiterbarkeit fuer externe Schulplattformen (Untis, Teams, Moodle)

Inputs:
- Nutzerinteraktionen (UI, Lernmodi, Profil, Social)
- Lokale Daten aus LocalStorage
- Supabase-Session und Supabase-Daten
- Externe Plattformdaten (Kalender, Aufgaben, Termine, Meetings)

Outputs:
- Gerenderte Screens in `index.html`
- Persistierte Nutzerdaten in LocalStorage und Supabase
- Synchronisierte Profile, Pools, Progress und Chat-Zustaende
- Konsolidierte externe Lern-/Zeitplan-Informationen

Aenderungsregeln:
- Keine Secrets im Frontend hinterlegen.
- Bei Datenfluss-Aenderungen immer Sync-Verhalten mitdenken.
- Bei Screen-/Feature-Aenderungen die zustaendigen Screen-Dateien und Doku mitziehen.
- Externe APIs nur ueber serverseitige/geschuetzte Integrationspfade anbinden.

## 3) Datenfluss-Kern

Zweck:
- Konsistente Datenhaltung zwischen lokalem Zustand und Supabase.

Inputs:
- LocalStorage-Keys (u. a. XP, Pools, Progress, Chat, Avatar, Quests)
- Supabase Tabellen (`profiles`, `pools`, `progress`, `friendships`, `pool_shares`)
- Edge Functions (`kivo-ai`, optional weitere Functions)
- Integrationsadapter fuer Untis, Teams und Moodle

Outputs:
- Merged Nutzerzustand nach Hydration
- Debounced Sync in Domaenen (`profile`, `pools`, `progress`, `chats`)
- Optional normalisierte Integrationsdaten fuer Kalender/Aufgaben/Events

Aenderungsregeln:
- Lokale Einzelnutzerdaten zuerst lokal schreiben, dann passende Sync-Domaene markieren.
- Konfliktregeln (Set-Union/Max/Timestamp) bewusst beibehalten oder explizit dokumentiert aendern.
- Bei neuen Persistenzfeldern: LocalStorage + Supabase + Hydration + Sync zusammen betrachten.
- Bei Integrationen immer Mapping in ein internes Normalformat dokumentieren.

## 4) Pflicht-Dokumente bei Aenderungen (MUSS)

Wenn du Code oder Struktur in einem Bereich aenderst, musst du die referenzierten Docs im selben PR/Commit aktualisieren.

1. Struktur und Verantwortlichkeiten:
- Datei: `docs/struktur-mapping.md`
- Aktualisieren bei: neue Module, verschobene Verantwortlichkeiten, geaenderte Team-Schnittstellen.

2. Verbindliche Repo-Struktur:
- Datei: `docs/ordnerstruktur-vorschlag.md`
- Aktualisieren bei: neuen Verzeichniskonventionen, neuen Pflichtdateien, geaenderten MUST/SHOULD-Regeln.

3. Deployment/GitHub Pages:
- Datei: `docs/github-pages-checkliste.md`
- Aktualisieren bei: geaenderten Einstiegsseiten, Deployment-Pfaden, Hosting-Annahmen.

4. Voice-/Conversation-Architektur:
- Datei: `docs/llm_voise.md`
- Aktualisieren bei: Voice-Flow, STT/LLM/TTS-Integrationslogik, Supabase-Voice-APIs, Fallback-Strategien.

5. WebUntis-Integration:
- Datei: `docs/webuntis_llm.md`
- Aktualisieren bei: Login-Flow, Timetable/Homework-Mapping, JSON-RPC-Endpunkten, Session-Handling.

6. Microsoft Teams-Integration:
- Datei: `docs/teams_llm.md`
- Aktualisieren bei: Graph-Scopes, Meeting/Chat/Kursfluss, Auth-Strategie, Webhook-/Sync-Modellen.

7. Moodle-Integration:
- Datei: `docs/moodle_llm.md`
- Aktualisieren bei: AJAX-Methoden, sesskey-Handling, Kalender-/Aufgaben-Mapping, Session-Flow.

8. Diese Router-Datei selbst:
- Datei: `LLM.md`
- Immer aktualisieren, wenn sich Architektur-Kern, Datenfluss-Kern oder Doku-Mapping aendert.

## 5) Integrationsstandard (Untis, Teams, Moodle)

Zweck:
- Externe Plattformdaten in ein gemeinsames Kivo-Format ueberfuehren.

Mindest-Normalformat pro Eintrag:
- `source`: `untis | teams | moodle`
- `externalId`: Original-ID aus der Quelle
- `type`: `lesson | homework | event | meeting | task | message`
- `title`: Kurzbezeichnung
- `startsAt` / `endsAt`: ISO-Datetime
- `courseRef`: Kurs/Fach-Referenz in Kivo
- `metadata`: quellspezifische Details

Regeln:
- OAuth-/Credentials nur serverseitig speichern.
- Frontend bekommt nur noetige, gefilterte Daten.
- Zeitangaben vor Anzeige in Nutzerzeitzone umrechnen.

## 6) Schnellcheck vor Abschluss

Vor Abgabe einer Aenderung:
1. Stimmen alle referenzierten Dateipfade?
2. Wurden betroffene Pflicht-Dokumente aktualisiert?
3. Sind neue/veraenderte Datenfluesse dokumentiert?
4. Sind veraltete Annahmen entfernt?
5. Ist das Integrations-Mapping fuer Untis/Teams/Moodle konsistent?

Wenn eine dieser Fragen mit Nein beantwortet wird, ist die Aenderung unvollstaendig.
