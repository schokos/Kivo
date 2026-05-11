# GitHub Pages Checkliste fuer Kivo

## Was jetzt wichtig ist
- `index.html` ist die Einstiegsseite im Root.
- `app.html` ist die eigentliche Kivo-Lernplattform.
- Standalone-Lektionen liegen unter `src/data/courses/.../lektionen/.../index.html`.
- Alle Pfade sind relativ angelegt und damit fuer GitHub Pages geeignet.

## Das musst du in GitHub einstellen
1. Repository auf GitHub oeffnen.
2. `Settings` -> `Pages` oeffnen.
3. Bei `Build and deployment` als `Source` `Deploy from a branch` waehlen.
4. Branch waehlen:
   - meistens `main`
   - oder euren echten Deploy-Branch
5. Ordner waehlen:
   - `/ (root)`
6. Speichern.

## Wichtig fuer dieses Projekt
- `index.html` muss im Root bleiben.
- `app.html` muss ebenfalls im Root bleiben, weil die Startseite dorthin verlinkt.
- Wenn ihr Lektionen verschiebt, muessen die relativen Rueck-Links nach `app.html` angepasst werden.
- GitHub Pages hostet nur statische Dateien. Alles, was serverseitig waere, funktioniert dort nicht direkt.
- Eure Supabase-Anbindung in `app.html` funktioniert weiterhin, solange die Domain in Supabase erlaubt ist.

## Supabase noch pruefen
In Supabase solltet ihr nachsehen, ob eure GitHub-Pages-URL eingetragen ist:
- `Authentication` -> `URL Configuration`
- `Site URL`: eure Pages-URL
- ggf. unter Redirect-URLs ebenfalls eintragen

## Was ihr nach dem Deploy pruefen solltet
1. Laedt `index.html`?
2. Oeffnet der Button auf `app.html` korrekt?
3. Laden die Dateien aus `src/styles/...` und `src/js/...` in `app.html`?
4. Oeffnen die Lektionen unter `src/data/courses/.../lektionen/.../index.html`?
5. Funktioniert Login mit Supabase noch?

## Empfehlung
Wenn ihr neue grosse Lernmodule baut, legt sie als eigene Unterordner unter `lektionen/` an. Das ist genau die Struktur, fuer die dieses Projekt jetzt vorbereitet ist.
