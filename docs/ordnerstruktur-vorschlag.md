# Kivo Ordnerstruktur (Verbindlich)

## Zielbild
```text
Kivo/
|- assets/
|- docs/
|- src/
|  |- data/
|  |  |- subjects/
|  |     |- subjects.json
|  |     |- <fach>/
|  |        |- subject.json
|  |        |- courses/
|  |           |- <kurs>/
|  |              |- course.json
|  |              |- lessons/
|  |                 |- <lektion>/
|  |                    |- index.html (+ optional script/style/json)
|  |- js/
|  |  |- core/          # Shell, UI, Navigation, Bootstrap
|  |  |- screens/       # Home, Courses, Community, Learn, Profile ...
|  |  |- services/      # Supabase, Auth, Sync
|  |  |- state/
|  |  |- utils/
|  |- styles/
|- index.html
|- app.html
```

## Verbindliche Regeln
- Neue Inhalte nur unter `src/data/subjects/` anlegen.
- Kein Wiedereinführen von `src/data/courses/`.
- Kurskatalog immer aus `src/data/subjects/subjects.json` laden.
- Pro Lektion ein eigener Ordner unter `lessons/<lektion>/`.

## Team-Regeln
- Neue Features nicht in `src/js/app.js` sammeln.
- Shell-/Navigationslogik in `src/js/core/*` halten.
- Fachlogik in `screens/*`, Sync/Auth in `services/*`.
- Bei neuen Faechern: `subject.json`, mindestens ein `course.json`, und Lessons konsistent anlegen.
