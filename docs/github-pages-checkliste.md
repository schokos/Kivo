# GitHub Pages Checkliste fuer Kivo

## Was jetzt schon passt
- `index.html` liegt im Projekt-Root.
- CSS und JavaScript werden ueber relative Pfade aus `src/...` geladen.
- `assets/` liegt ebenfalls relativ zur Startseite und ist damit fuer GitHub Pages grundsaetzlich geeignet.

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
- Die Startdatei muss weiter `index.html` im Root bleiben.
- Wenn ihr Dateien verschiebt, muessen die relativen Pfade in `index.html` stimmen.
- GitHub Pages hostet nur statische Dateien. Alles, was serverseitig waere, funktioniert dort nicht direkt.
- Eure Supabase-Anbindung funktioniert weiterhin, solange die Domain in Supabase erlaubt ist.

## Supabase noch pruefen
In Supabase solltet ihr nachsehen, ob eure GitHub-Pages-URL eingetragen ist:
- `Authentication` -> `URL Configuration`
- `Site URL`: eure Pages-URL
- ggf. unter Redirect-URLs ebenfalls eintragen

Typische URL:
- `https://USERNAME.github.io/REPO-NAME/`

## Wichtiger Punkt bei Repository-Namen
Wenn eure GitHub Pages unter einem Repo-Pfad laufen, also nicht direkt auf der Hauptdomain, dann ist diese URL normal:
- `https://USERNAME.github.io/Kivo/`

Das ist fuer euer Projekt okay, weil ihr relative Pfade nutzt:
- `src/styles/main.css`
- `src/js/app.js`
- `assets/logo.png`

## Falls spaeter etwas nicht laedt
Pruefe diese Punkte:
1. Wurde wirklich der Root-Ordner deployed?
2. Heisst die Startdatei wirklich `index.html`?
3. Stimmen die Dateinamen in Gross-/Kleinschreibung exakt?
4. Gibt es in der Browser-Konsole 404-Fehler fuer CSS, JS oder Assets?
5. Ist die GitHub-Pages-Domain in Supabase als erlaubte URL eingetragen?

## Wenn ihr spaeter einen Custom Domain nutzt
Dann zusaetzlich:
1. Domain in GitHub Pages eintragen.
2. DNS korrekt setzen.
3. Die neue Domain auch in Supabase bei den erlaubten URLs eintragen.

## Empfehlung nach Aenderungen
Nach groesseren Umbauten kurz pruefen:
- laedt `index.html`
- laedt `src/styles/main.css`
- laedt die Script-Dateien aus `src/js/...`
- funktioniert Login mit Supabase noch
