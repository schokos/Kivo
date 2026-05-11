# Kursdaten

Dieser Ordner trennt jetzt klar zwischen:
- Haupt-App in `app.html`
- Kurs-Metadaten in `course.json`
- eigenstaendigen Lernmodulen in `lektionen/...`

## Strukturidee
- `course.json` beschreibt den Kurs und listet Lektionen auf.
- Jede groessere Lektion kann einen eigenen Ordner bekommen.
- Ein Lektionen-Ordner darf komplett fuer sich stehen, inklusive eigener `index.html`, `style.css` und `script.js`.

## Typische Beispiele
- GeoGebra
- Funktionen-Plotter
- Grammatiktrainer
- Vokabeltrainer
- kleine Spiele oder Simulationen

## Vorteil
So bleibt die Hauptplattform sauber, waehrend Spezialmodule unabhaengig entwickelt werden koennen.
