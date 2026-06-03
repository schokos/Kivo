# Kivo Ordnerstruktur (Normative Spezifikation)

## Zweck
Dieses Dokument definiert verbindlich die Zielstruktur im Repository.

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
|  |  |- core/
|  |  |- screens/
|  |  |  |- learn/
|  |  |- services/
|  |  |- state/
|  |  |- utils/
|  |- styles/
|- index.html
|- LLM.md
|- llm_voise.md
```

## MUST-Regeln
- Neue Fachinhalte MUESSEN unter `src/data/subjects/` angelegt werden.
- Der Kurskatalog MUSS aus `src/data/subjects/subjects.json` gelesen werden.
- Jede Lesson MUSS einen eigenen Ordner unter `lessons/<lektion>/` haben.
- Deployment-relevante Einstiegspfade MUESSEN statisch aufloesbar sein.
- Wenn `index.html` Lernscreen-Helfer laedt, MUESSEN die Script-Pfade den realen Dateien unter `src/js/screens/learn/` entsprechen.
- Bei Strukturregel-Aenderungen MUESSEN `LLM.md` und `docs/struktur-mapping.md` im selben PR aktualisiert werden.

## SHOULD-Regeln
- Feature-Code SOLLTE im passenden Modul liegen statt in zentralen Sammeldateien.
- Neue Daten- oder Service-Schnittstellen SOLLTEN nahe am fachlichen Modul dokumentiert werden.
- Dateinamen SOLLTEN konsistent kleingeschrieben und sprechend sein.

## Inputs / Outputs / Regeln (LLM-lesbar)
- Input: Neue Dateien, neue Faecher/Kurse/Lessons, Refactors.
- Output: Struktur bleibt maschinenlesbar und vorhersagbar.
- Regel: Kein Legacy-Rueckfall auf alte Content-Strukturen.
