# Kivo Project Guide for LLMs

Diese Datei ist die zentrale Orientierung fuer LLMs und Agenten, die an Kivo weiterarbeiten. Sie beschreibt den aktuellen Projektstand, die Architektur, das Backend und die wichtigsten Datenfluesse.

## Pflicht fuer zukuenftige LLMs (MUSS-Regel)

Wenn du ein Feature implementierst, einen Datenfluss aenderst, Backend-Tabellen beruehrst, Sync-Verhalten anpasst oder wichtige UI-/Produktlogik veraenderst, **musst** du diese `LLM.md` im selben Arbeitsschritt aktualisieren.

Pull Requests oder Aufgaben gelten als unvollstaendig, wenn relevante Aenderungen ohne `LLM.md`-Update abgegeben werden.

Dokumentiere mindestens:

- Was neu ist oder sich geaendert hat
- Welche Dateien, Funktionen oder Datenbereiche betroffen sind
- Welche Supabase-Tabellen, Edge Functions oder LocalStorage-Keys betroffen sind
- Welche Annahmen, Risiken oder bekannten Einschraenkungen danach gelten
- Welche Tests oder manuellen Checks sinnvoll sind

Diese Datei soll nicht perfekt literarisch sein. Sie soll zukuenftige Implementierungen sicherer, schneller und weniger erratisch machen.

## Projektueberblick

Kivo ist eine browserbasierte Lernplattform fuer Vokabeln, Lernkarten, Quiz, Tipptraining, Matching, KI-gestuetzte Vokabellisten, Avatar-/Shop-Mechaniken, Freundesfunktionen und Fortschrittsspeicherung.

Der aktuelle Code ist modular aufgeteilt:

- `index.html`: Shell/Markup und Script-Einbindung
- `src/styles/main.css`: zentrales Styling inkl. Theme-Variablen
- `src/js/**`: Core, Services und Screens (u. a. Auth, Sync, Theme, Kurse, Profil, KI-Chat)
- `assets/logo_light.png` und `assets/logo_dark.png`: App-Logos fuer Light/Dark
- `.github/workflows/static.yml`: statische GitHub-Pages/Deployment-Konfiguration

Es gibt kein separates Build-System, keine Package-Dateien und keinen lokalen Backend-Code im Repository. Externe Libraries werden per CDN geladen.

## Laufzeitmodell

Die App ist eine statische HTML-Seite. Sie laedt:

- Supabase JS v2 per CDN
- `marked` fuer Markdown-Rendering im KI-Chat
- `DOMPurify` fuer HTML-Sanitizing
- KaTeX fuer mathematische Darstellung

Der Einstieg passiert ueber `src/js/core/bootstrap.js`:

- `KivoTheme.initTheme()` setzt Theme + Asset-Switching (Icons/Meta)
- `loadState()` baut den lokalen App-Zustand aus Built-in-Pools und LocalStorage auf
- `initAuth()` laedt Supabase-Session und ruft `hydrateSession(session)` auf
- `checkShareUrl()` verarbeitet Pool-Share-URLs
- `updateNavIcons()` aktualisiert Avatar-/Profilnavigation
- `initAiChatPersistence()` initialisiert Chat-Persistenz

## Theme- und Icon-Logik

- Theme-Engine: `src/js/core/theme.js`
- Modi: `light`, `dark`, `system`, `auto`
- Effektives Theme wird auf `document.documentElement.dataset.theme` gesetzt
- Browser-/PWA-Branding:
  - `meta[name="theme-color"]` wird dynamisch gesetzt
  - `link[rel="icon"]` und `link[rel="apple-touch-icon"]` werden theme-basiert auf `logo_light`/`logo_dark` gesetzt
  - Webapp-Manifest in `bootstrap.js` nutzt ebenfalls theme-basierte Kivo-Logos
- GitHub-Icons:
  - Dark Theme: `GitHub_Invertocat_White_Clearspace.svg`
  - Light Theme: `GitHub_Invertocat_Black_Clearspace.svg`

## Frontend-Struktur

Die App verwendet kein Komponentenframework. UI, CSS und JavaScript liegen direkt in `index.html`.

Wichtige Bereiche:

- Globale Konstanten und App-State: User, Pools, Lernzustand, XP, Waehrung, Items
- Supabase-Konfiguration: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `sb`
- Storage-Helfer: `lsGet`, `lsSet`, `safeJsonParse`, Merge-Helfer
- Local-first Sync: Dirty Flags, Debounce, Flush, Server-Sync-Funktionen
- Pool-/Vokabel-Logik: `POOLS`, `BUILTIN`, `saveCustom`, `syncPools`
- Lernmodi: Flashcards, Quiz, Typing, Matching
- XP/Quests/Streak: `addXp`, `calcStreak`, Quest-State
- KI-Chat: Chat-Sessions, Markdown/LaTeX-Rendering, Edge Function Calls
- Profil/Avatar/Shop: Items, Pass, Avatar Builder, Profilbild
- Social: Freundschaften, Leaderboard, Pool Shares

Da alles in einer Datei liegt, sind Namenskollisionen und doppelte Funktionsdefinitionen ein reales Risiko. Vor groesseren Aenderungen immer mit `rg` pruefen, ob eine Funktion mehrfach existiert.

## Backend

Das Backend ist Supabase.

Aktuelles Projekt:

- Supabase URL: `https://mfnlugxssqwihiwkryzi.supabase.co`
- Supabase Project Ref: `mfnlugxssqwihiwkryzi`
- Region: `eu-central-1`

Der Client nutzt den publishable/anon Key aus `index.html`. Niemals einen `service_role` Key in diese App oder in dieses Repository schreiben.

## Supabase Tabellen

### `public.profiles`

Zentrale User-Profil-Tabelle. Wichtige Spalten:

- `id`: UUID, referenziert `auth.users.id`
- `username`: Anzeigename, eindeutig
- `email`: E-Mail
- `avatar_url`: Profilbild als URL oder Data URL
- `avatar_data`: Avatar-Builder-Daten als JSONB
- `xp_total`: berechnete Gesamt-XP
- `streak`: aktueller Streak
- `xp_data`: XP pro Datum als JSONB
- `currency`: Coins/Muenzen
- `items`: gekaufte Items als JSONB-Liste
- `pass_data`: Pass-/Reward-State als JSONB
- `chat_data`: KI-Chat-Historie als JSONB
- `is_dev`: Dev-Flag fuer besondere Rechte/Features
- `updated_at`: letzte Aktualisierung

### `public.pools`

Speichert eigene Vokabelpools.

- `id`: Text-ID, aktuell nach Muster `userId_escapedPoolKey`
- `user_id`: Besitzer
- `lang`: Sprache/Kategorie
- `name`: Poolname
- `data`: Poolinhalt als JSONB
- `updated_at`: letzte Aktualisierung

### `public.progress`

Speichert bekannte Vokabeln pro Pool.

- `user_id`
- `pool_key`
- `known_ids`: Liste bekannter Vokabel-IDs als JSONB
- `updated_at`

Primaerschluessel ist `user_id + pool_key`.

### `public.friendships`

Freundesbeziehungen.

- `user_id`
- `friend_id`
- `status`: `pending` oder `accepted`
- `created_at`

### `public.pool_shares`

Direkte Pool-Einladungen zwischen Nutzern.

- `from_user_id`
- `from_username`
- `to_user_id`
- `pool_key`
- `pool_name`
- `data`
- `accepted`
- `created_at`

### Weitere Tabellen

- `public.shares`: Share-Token fuer Pools
- `public.scan_usage`: Nutzungslimit/-zaehler fuer Foto-Scan
- `public.xp_events`: alte/eventbasierte XP-Ereignisse
- `public.webauthn_credentials`, `public.webauthn_challenges`: WebAuthn-Tabellen, aktuell nicht Hauptpfad der App

## Edge Functions

Die App ruft Supabase Edge Functions per `fetch` auf.

Bekannte Functions:

- `kivo-ai`: KI-Antworten und Vokabellisten im Chat
- `scan-vocab`: Foto-/Bildscan fuer Vokabelimport

Die Helper-Funktion `edgeHeaders()` holt die aktuelle Supabase Session und setzt `Authorization: Bearer <access_token>`.

## LocalStorage

Kivo ist stark LocalStorage-getrieben. Viele Daten werden lokal sofort gelesen/geschrieben und danach mit Supabase synchronisiert.

Wichtige Keys:

- `kivo_xp`: XP pro Datum
- `kivo_currency`: Coins/Muenzen
- `kivo_items`: gekaufte Shop-/Avatar-Items
- `kivo_pass`: Pass-/Reward-State
- `kivo_custom`: eigene Vokabelpools
- `kivo_kn_<poolKey>`: bekannte Vokabel-IDs pro Pool
- `kivo_ml`: Fehler-/Mistake-Log
- `kivo_sess`: Quiz-/Training-Sessions
- `kivo_quests`: Daily-/Weekly-Quest-State
- `kivo_streak`: berechneter Streak
- `kivo_ak`: aktiver Pool-Key
- `kivo_avatar_data`: Avatar-Builder-State
- `kivo_avatar_url`: Profilbild
- `kivo_username`: lokaler Username
- `kivo_equipped`: aktuell nur teilweise genutzt
- `kivo_sr_<poolKey>_<id>`: Spaced-Repetition-State
- `kivo_ai_chat_sessions_v1`: KI-Chat-Historie
- `kivo_ai_active_session_v1`: aktive KI-Chat-ID

## Feature: LocalStorage zu Datenbank Sync

Das aktuelle Feature stellt Kivo auf ein local-first Modell um:

1. User-Aktionen schreiben sofort in LocalStorage oder lokalen Runtime-State.
2. Die UI aktualisiert sich direkt aus dem lokalen Zustand.
3. Dirty Flags markieren, welche Domaene geaendert wurde.
4. Ein kurzer Debounce startet den Supabase-Sync.
5. Beim Verlassen der Seite wird ein Flush versucht.

Wichtige Funktionen:

- `_markLocalDirty(kind)`: markiert `profile`, `pools`, `progress` oder `chats`
- `flushLocalSync({ force })`: schreibt ausstehende lokale Daten in Supabase
- `_syncProfileToServer()`: synchronisiert Profil, XP, Coins, Items, Pass, Avatar
- `_syncPoolsToServer()`: synchronisiert eigene Pools
- `_syncProgressToServer()`: synchronisiert bekannte Vokabeln
- `_syncChatsToServer()`: synchronisiert KI-Chats in `profiles.chat_data`
- `syncProfile()`, `syncPools()`, `syncProgress()`, `syncChats()`: kleine Wrapper fuer Dirty Flags

Konfliktstrategie:

- XP-Daten werden pro Datum mit Maximum gemerged
- Items und bekannte Vokabeln werden als Sets vereinigt
- Pass-Claims werden vereinigt; `proOwned` bleibt true, wenn lokal oder serverseitig true ist
- Chat-Sessions werden nach `id` zusammengefuehrt; bei Konflikt gewinnt die hoehere `updatedAt`/`createdAt`
- Pools werden aus Serverdaten und lokalen Custom-Pools zusammengefuehrt, lokale Versionen ueberschreiben bei gleichem Namen

Wichtig: Profilbilder bleiben funktional wie bisher sichtbar, werden aber ueber die Profil-Sync-Domaene gespiegelt.

## Auth und Hydration

`initAuth()` holt die aktuelle Session und registriert `onAuthStateChange`.

`hydrateSession(session)` ist besonders kritisch. Sie:

- laedt `profiles`
- merged lokale und serverseitige XP, Coins, Items, Pass-Daten
- laedt Pools und Progress aus Supabase
- merged KI-Chats aus `profiles.chat_data`
- baut `currentUser`
- aktualisiert UI und Friend-Badge
- markiert geaenderte Domaenen fuer Sync, wenn lokale Daten neuer/umfangreicher sind

Beim Arbeiten an Auth oder Sync immer pruefen, ob `hydrateSession` mehrfach definiert ist. In dieser Datei gab es waehrend des Local-first-Umbaus zeitweise doppelte Definitionen. Die spaetere Definition gewinnt in JavaScript, aber doppelte Altbloecke sollten langfristig bereinigt werden.

## KI-Chat

Der KI-Chat speichert Sessions lokal unter `kivo_ai_chat_sessions_v1`.

Eine Session enthaelt:

- `id`
- `title`
- `createdAt`
- `updatedAt`
- `messages`
- `streaming`

`aiSaveChatSessions()` schreibt lokal und markiert `chats` dirty. Der DB-Sync schreibt das gemergte Payload nach `profiles.chat_data`.

KI-Antworten laufen ueber `kivo-ai`. Antworten koennen Vokabellisten enthalten, die per `importAiList(...)` als Custom Pool importiert werden.

## Lernlogik

Kivo bietet mehrere Lernmodi:

- Flashcards: Karten umdrehen und bekannt/nicht bekannt markieren
- Quiz: Multiple Choice
- Typing: freie Eingabe mit Levenshtein-Toleranz
- Matching: Paare finden
- Spaced Repetition: lokaler SM-2-aehnlicher Zustand pro Pool/Vokabel

Fortschritt wird hauptsaechlich ueber `known_ids`, XP, Sessions und SR-Keys abgebildet.

## Gamification

Gamification besteht aus:

- XP pro Lernaktion
- Level basierend auf XP
- Coins fuer Level-Ups und Quests
- Daily/Weekly Quests
- Shop Items
- Pass Rewards
- Avatar Builder

Coins, Items und Pass-Daten sind Teil des Profil-Syncs.

## Social Features

Social Features nutzen Supabase direkt:

- Freunde suchen
- Freundschaftsanfragen senden/annehmen/ablehnen
- Freunde entfernen
- Leaderboard anzeigen
- Pools an Freunde senden
- Pool-Einladungen annehmen/ablehnen

Diese sozialen Aktionen sind aktuell nicht vollstaendig local-first. Sie bleiben bewusst direkte Backend-Aktionen, weil sie andere Nutzer betreffen.

## Entwicklungsregeln fuer LLMs

Vor Aenderungen:

- Mit `rg` pruefen, ob Funktionen mehrfach existieren
- Bei Supabase-Aenderungen aktuelle Tabellenstruktur pruefen
- Bei LocalStorage-Aenderungen diese Datei und die Sync-Domaenen aktualisieren
- Bei UI-Aenderungen die bestehende dunkle Kivo-Optik respektieren

Beim Implementieren:

- Lokale User-Daten zuerst lokal schreiben
- Danach passenden Dirty Wrapper aufrufen: `syncProfile`, `syncPools`, `syncProgress`, `syncChats`
- Keine neuen direkten DB-Writes fuer lokale Einzelnutzer-Daten einfuehren, wenn sie in eine Sync-Domaene passen
- Direkte DB-Writes sind fuer soziale oder serverseitige Aktionen okay, wenn andere Nutzer betroffen sind
- Keine Service-Keys oder geheimen API-Schluessel ins Frontend schreiben

Nach Aenderungen:

- Eingebettetes JavaScript syntaktisch pruefen
- Manuell Login/Hydration testen, wenn Auth/Sync betroffen ist
- Mindestens einen lokalen Write und den anschliessenden Supabase-Sync pruefen, wenn Datenpersistenz betroffen ist
- `LLM.md` aktualisieren

## Schneller Syntax-Check

Da die App kein Build-System hat, kann das eingebettete JavaScript mit Node geprueft werden:

```powershell
@'
const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const scripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1]);
const code = scripts.join('\n');
new Function(code);
console.log('JS syntax ok');
'@ | node -
```

Dieser Check findet Syntaxfehler, aber keine Laufzeitfehler durch fehlende DOM-Elemente, Supabase Policies oder Netzwerkprobleme.

## Bekannte Risiken und technische Schulden

- `index.html` ist sehr gross und enthaelt viele Verantwortlichkeiten.
- Einige Bereiche wurden historisch direkt gegen Supabase geschrieben und spaeter auf local-first umgestellt.
- Doppelte Funktionsdefinitionen koennen existieren; JavaScript nutzt die spaetere Definition.
- LocalStorage-Key-Namen sind nicht zentral typisiert.
- Der Sync ist debounce-basiert und nicht transaktional.
- `beforeunload`/`pagehide` Flushs sind best-effort; Browser koennen async Arbeit abbrechen.
- Social Features sind nicht local-first und brauchen Online-Verbindung.
- RLS/Policies muessen bei neuen Tabellen oder Spalten immer mitgedacht werden.

## Gute naechste Refactors

- Legacy-Sync-Funktionen und doppelte Definitionen bereinigen
- Storage-/Sync-Code aus `index.html` logisch gruppieren oder auslagern
- Zentrale Liste der LocalStorage-Keys einfuehren
- Local-first Sync mit expliziten Versions-/Timestamp-Feldern robuster machen
- Kleine smoke tests fuer Auth-Hydration, Chat-Sync und Pool-Sync ergaenzen
- Supabase-Policies und Security Advisors regelmaessig pruefen
