# LLM Router fuer Kivo

Diese Datei ist der zentrale Einstieg fuer LLMs und Agenten. Ziel ist ein schneller, robuster Projektueberblick mit klaren Pflegepflichten fuer Dokumentation bei jeder relevanten Aenderung.

## 1) Projektueberblick

Kivo ist eine browserbasierte Lernplattform mit statischem Frontend (`index.html`) und Supabase als Backend. Lernmodi, KI-Chat, Gamification und Social-Funktionen laufen ohne Build-Tooling direkt im Browser.

- Einstieg: `index.html`
- Styling: `src/styles/main.css`
- App-Logik: `src/js/**`
- Inhalte/Faecher: `src/data/subjects/**`
- Deployment: GitHub Pages (statisch)

## 2) Architektur-Kern

Zweck:
- Lern- und Uebungsfunktionen fuer mehrere Faecher
- KI-gestuetzte Unterstuetzung im Bereich Chat/Vokabeln
- Local-first Nutzererlebnis mit nachgelagerter Synchronisation

Inputs:
- Nutzerinteraktionen (UI, Lernmodi, Profil, Social)
- Lokale Daten aus LocalStorage
- Supabase-Session und Supabase-Daten

Outputs:
- Gerenderte Screens in `index.html`
- Persistierte Nutzerdaten in LocalStorage und Supabase
- Synchronisierte Profile, Pools, Progress und Chat-Zustaende

Aenderungsregeln:
- Keine Secrets im Frontend hinterlegen.
- Bei Datenfluss-Aenderungen immer Sync-Verhalten mitdenken.
- Bei Screen-/Feature-Aenderungen die zustaendigen Screen-Dateien und Doku mitziehen.

## 3) Datenfluss-Kern

Zweck:
- Konsistente Datenhaltung zwischen lokalem Zustand und Supabase.

Inputs:
- LocalStorage-Keys (u. a. XP, Pools, Progress, Chat, Avatar, Quests)
- Supabase Tabellen (`profiles`, `pools`, `progress`, `friendships`, `pool_shares`)
- Edge Functions (`kivo-ai`, optional weitere Functions)

Outputs:
- Merged Nutzerzustand nach Hydration
- Debounced Sync in Domaenen (`profile`, `pools`, `progress`, `chats`)

Aenderungsregeln:
- Lokale Einzelnutzerdaten zuerst lokal schreiben, dann passende Sync-Domaene markieren.
- Konfliktregeln (Set-Union/Max/Timestamp) bewusst beibehalten oder explizit dokumentiert aendern.
- Bei neuen Persistenzfeldern: LocalStorage + Supabase + Hydration + Sync zusammen betrachten.

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
- Datei: `llm_voise.md`
- Aktualisieren bei: Voice-Flow, STT/LLM/TTS-Integrationslogik, Supabase-Voice-APIs, Fallback-Strategien.

5. Diese Router-Datei selbst:
- Datei: `LLM.md`
- Immer aktualisieren, wenn sich Architektur-Kern, Datenfluss-Kern oder Doku-Mapping aendert.

## 5) Dokumentierter Voice-Standard

Voice-Features sind hybrid zu denken:
- Primaer: Cloud-first ueber Supabase (LLM/Orchestrierung serverseitig)
- Sekundaer: Lokaler Browser-Fallback (transformers.js), wenn Cloud nicht verfuegbar ist

Details, API-Vertraege und Implementierungsfahrplan stehen in `llm_voise.md`.

## 6) Schnellcheck vor Abschluss

Vor Abgabe einer Aenderung:
1. Stimmen alle referenzierten Dateipfade?
2. Wurden betroffene Pflicht-Dokumente aktualisiert?
3. Sind neue/veraenderte Datenfluesse dokumentiert?
4. Sind veraltete Annahmen entfernt (z. B. nicht existente Einstiegspfade)?

Wenn eine dieser Fragen mit Nein beantwortet wird, ist die Aenderung unvollstaendig.
