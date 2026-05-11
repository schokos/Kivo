# Kivo Ordnerstruktur Vorschlag

## Ziel
Die App soll so aufgeteilt werden, dass mehrere Personen parallel arbeiten koennen, ohne dauernd in derselben `index.html` zu landen.

## Sinnvoller Zwischenstand
```text
Kivo/
|- assets/              # Bilder, Logos, Icons
|- docs/                # Architektur, Entscheidungen, Setup-Hinweise
|- src/
|  |- js/
|  |  |- app.js         # aktueller zentraler Einstieg
|  |- styles/
|  |  |- main.css       # globales Styling
|  |- components/       # wiederverwendbare UI-Bausteine
|  |- screens/          # einzelne App-Bereiche wie home, courses, profile
|  |- services/         # Supabase, API, Sync, Auth
|  |- state/            # globaler Zustand, localStorage, Session
|  |- utils/            # kleine Hilfsfunktionen
|- index.html           # Einstiegspunkt / Shell / Grundgeruest
```

## Empfohlene fachliche Aufteilung
- `src/screens/home.js`: Dashboard / Startseite
- `src/screens/courses.js`: Kurse und Pool-Auswahl
- `src/screens/challenges.js`: Challenges / Quests
- `src/screens/community.js`: Freunde, Leaderboard, Social
- `src/screens/profile.js`: Profil, Avatar, Einstellungen
- `src/screens/learn/`: Karteikarten, Quiz, Tippen, Matching
- `src/services/supabase.js`: Client-Initialisierung
- `src/services/auth.js`: Login, Register, Logout, Session-Hydration
- `src/services/sync.js`: Sync von Progress, Pools, Chats, Coins
- `src/state/store.js`: aktueller User, Pool, UI-State
- `src/utils/dom.js`: DOM-Helper
- `src/utils/storage.js`: localStorage-Zugriffe
- `src/utils/merge.js`: Merge-Logik fuer local/server Daten

## Wie ihr am besten migriert
1. Erst HTML, CSS und JS trennen.
2. Danach `app.js` nach Themen aufteilen, nicht nach Zufall.
3. Dann fuer jeden Screen eine eigene Datei anlegen.
4. Gemeinsame Helfer auslagern (`storage`, `dom`, `sync`, `auth`).
5. Erst spaeter optional auf Vite/React wechseln, falls ihr Routing, Komponenten und Build-Tools wollt.

## Gute Team-Regeln
- Eine Person arbeitet an `screens/home.js`, eine andere an `screens/community.js`, usw.
- Gemeinsame Utilities nur dann anfassen, wenn wirklich noetig.
- Pro Feature eine eigene Datei oder Unterstruktur anlegen.
- Keine neue grosse Sammeldatei mehr entstehen lassen.

## Naechster sinnvoller Schritt
Der aktuelle beste Folgeschritt ist, `src/js/app.js` in 4 bis 6 Module zu zerlegen:
- `core`
- `auth`
- `community`
- `learning`
- `profile`
- `sync`

Damit erreicht ihr schnell bessere Zusammenarbeit, ohne das ganze Projekt sofort auf ein Framework umstellen zu muessen.
