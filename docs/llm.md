# LLM-Integration & KI-Aufgaben

Dieses Dokument beschreibt die Integration von Sprachmodellen (LLM) und die Fähigkeiten der KI, Aufgaben zu erstellen und zu bearbeiten.

## KI-Aufgaben-Generierung

Die KI soll in der Lage sein, neue Aufgaben zu erstellen. Dafür benötigt sie verschiedene Tools und Schnittstellen:

### GeoGebra-Integration

Die KI kann GeoGebra-Applets erstellen und steuern. Siehe [geo_test.html](geo_test.html) für eine vollständige Demo der GeoGebra-API-Funktionen.

**Wichtige Funktionen:**
- `evalCommand(cmd)` - Führt GeoGebra-Befehle aus
- `getAllObjectNames()` - Listet Objekte in der Konstruktion
- `setValue(name, value)` - Setzt numerische Werte
- `setCoords(name, x, y)` - Setzt Punktkoordinaten
- `setVisible(name, bool)` - Zeigt/versteckt Objekte
- `getXML()` - Exportiert die Konstruktion als XML
- `refreshViews()` - Aktualisiert alle Ansichten

**Beispiel-Aufgaben, die die KI erstellen kann:**
- Geometry constructions
- Function graphing
- 3D visualizations
- Interactive geometry puzzles
- Algebraic curve explorations

**Beispiel-Tools:**
- `evalCommand(cmd)` - Führt GeoGebra-Befehle aus
- `getAllObjectNames()` - Listet Objekte in der Konstruktion
- `setValue(name, value)` - Setzt numerische Werte
- `setCoords(name, x, y)` - Setzt Punktkoordinaten
- `setVisible(name, bool)` - Zeigt/versteckt Objekte
- `getXML()` - Exportiert die Konstruktion als XML

### CAS-Integration

Für mathematische Aufgaben benötigt die KI einen Computer-Algebra-System-Zugriff:

```
- Gleichungen lösen (solve())
- Terme vereinfachen (simplify())
- Ableitungen und Integrale berechnen (diff(), integrate())
- Matrizenoperationen
- Funktionen analysieren
- Muster in Zahlenfolgen erkennen
```

### MathML-Generator

Erstellt mathematische Ausdrücke in standardisierter Form:

```
- LaTeX-Strings generieren
- MathML für Web-Darstellung
- Unicode-Mathematiknotation
- Standardisierte Formatierung für Aufgaben
```

### Aufgaben-Templates

Die KI kann bestehende Vorlagen anpassen oder komplett neue Aufgaben erstellen. Mögliche Ansätze:

```
1. Vorlagen-Bibliothek durchsuchen
2. Parameter anpassen (Zahlen, Variablen, Bedingungen)
3. Schwierigkeitsgrad anpassen
4. Kontext anpassen (Schuljahr, Lehrplan)
5. Vollständig neue Aufgaben generieren mit:
   - Zufallszahlen
   - Variablen
   - Bedingungen
   - Grafiken
```

## Rechtliche Anforderungen

Für die Veröffentlichung müssen folgende Punkte geklärt werden:

### GeoGebra-Lizenz

- GeoGebra Non-Commercial License für eingebettete Applets
- Keine Login- oder Account-Funktionen
- Keine Datenweitergabe an GeoGebra

### Eigene Inhalte

- Impressum mit Verantwortlichen
- Datenschutzerklärung
- Nutzungsbedingungen
- Cookie-Hinweis (falls Tracking)

### Aufgaben-Inhalte

- Eigene Aufgaben: Volle Rechte
- Adaptierte Aufgaben: Lizenz klären
- Externe Quellen: Quellenangabe

## Implementierungsbeispiel

Die KI kann verschiedene Aufgabentypen erstellen:

```
1. Multiple-Choice-Fragen (Lerntyp-Test)
2. GeoGebra-Konstruktionsaufgaben (Geometrie)
3. Rechenaufgaben (Mathematik)
4. Transferaufgaben (Anwendung)
5. CAS-Aufgaben (Algebra, Analysis)
6. Mustererkennungsaufgaben (Logik)
```

Jeder Aufgabentyp benötigt spezifische Tools und Eingabemöglichkeiten.
