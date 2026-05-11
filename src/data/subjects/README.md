# Fachdaten

Die neue Zielstruktur lautet jetzt:
- `Faecher` oben
- darin `Kurse`
- darin `Lektionen`

## Beispiel
- `Spanisch`
  - `Vokabeln`
    - `Vokabeln A1`
  - `Grammatik`
    - `Verben`

## Dateien
- `src/data/subjects/<fach>/subject.json` beschreibt ein Fach
- `src/data/subjects/<fach>/courses/<kurs>/course.json` beschreibt einen Kurs
- `src/data/subjects/<fach>/courses/<kurs>/lessons/<lektion>/index.html` ist ein eigenstaendiges Modul

## Hinweis
Die alte `src/data/courses/`-Struktur bleibt vorerst als Altbestand erhalten, damit nichts kaputtgeht. Neue Inhalte sollten ab jetzt in `src/data/subjects/` landen.
