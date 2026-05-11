# Kursdaten

Dieser Ordner ist die neue Heimat fuer redaktionelle Kursinhalte.
Die aktuelle App liest ihre Pools noch aus Local Storage und Supabase.

Empfohlenes Format pro Fach:
- `course.json` fuer Metadaten
- `lektionen/*.json` fuer Inhalte

Beispiel fuer eine Lektion:
```json
[
  ["Begriff auf Deutsch", "Antwort / Loesung"],
  ["Zweiter Begriff", "Zweite Antwort"]
]
```

Das passt spaeter gut zur bestehenden Pool-Struktur in `app.js` (`subcats`).
