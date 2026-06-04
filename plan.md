# **LLM.md: KI-gestütztes Lernsystem für die Sekundarstufe II**
*Dokumentation für ein adaptives, dialogbasiertes Lernsystem mit Fokus auf Mustererkennung, Lerntypen und Transfertests*

---

## **📌 1. Zielsetzung**
Ein **vollständig KI-gestütztes Lernsystem** für die **Sekundarstufe II**, das:
✅ **Eigenständiges Lernen** ohne Lehrer ermöglicht (KI als personalisierter Tutor).
✅ **Individuelle Lerntypen** (Kolb, VARK, Felder-Soloman) erkennt und berücksichtigt.
✅ **Neugierde weckt** und **emotional führt** (Dialog statt Theorie-Frontalunterricht).
✅ **Mustererkennung trainiert** und gezielt auf **Transfertests** vorbereitet.
✅ **Verständnis bestätigt** (kein Auswendiglernen, sondern echte Kompetenz).
✅ **Dynamisch anpasst**: Lerntypen und Schwierigkeitsgrade werden laufend optimiert.

---

---

## **🧠 2. Wissenschaftliche Grundlagen**

### **A. Lerntypen-Modelle**
#### **1. Kolbs Erfahrungsbasiertes Lernen (1984)**
- **4 Lernphasen**:
  1. **Konkrete Erfahrung** (z. B. GeoGebra-Simulation ausprobieren).
  2. **Reflektierende Beobachtung** (KI fragt: *"Was ist dir aufgefallen?"*).
  3. **Abstrakte Konzeptbildung** (KI erklärt Regel *nach* der Erfahrung).
  4. **Aktives Experimentieren** (Nutzer wendet Regel an).
- **4 Lerntypen**:
  | Typ            | Präferenz                          | KI-Anpassung                                                                 |
  |----------------|------------------------------------|------------------------------------------------------------------------------|
  | **Divergierer** | Kreativ, ideenreich                | Offene Fragen: *"Wie würdest du das Problem angehen?"*                     |
  | **Assimilierer**| Logisch, theorielastig             | Klare Strukturen: Schritt-für-Schritt-Erklärungen.                         |
  | **Konvergierer**| Pragmatisch, lösungsorientiert    | Praktische Anwendungen: *"Berechne die Flugbahn eines Balls."*             |
  | **Akkommodierer**| Handlungsorientiert               | Interaktive Tools: GeoGebra, Simulationen.                                  |

#### **2. VARK-Modell (Fleming, 1987)**
- **4 Hauptlerntypen**:
  - **Visuell (V)**: Bilder, Diagramme, GeoGebra-Grafiken.
  - **Auditiv (A)**: Erklärvideos, Sprachausgabe der KI.
  - **Lese-/Schreibtyp (R)**: Texte, Zusammenfassungen, Lernzettel.
  - **Kinästhetisch (K)**: Interaktion, Simulationen, "Learning by Doing".

#### **3. Felder-Soloman-Modell (1988)**
- **4 Dimensionen** (Spektrum):
  1. **Aktiv vs. Reflektierend**
  2. **Sensing vs. Intuitiv**
  3. **Visuell vs. Verbal**
  4. **Sequenziell vs. Global**

---
### **B. Mustererkennung & Transfertests**
- **Ziel**: Nutzer sollen **Muster erkennen** und auf **neue Probleme übertragen** können.
- **Methoden**:
  | Muster-Typ          | Beispiel (Mathe)               | KI-Umsetzung                                                                 |
  |---------------------|--------------------------------|------------------------------------------------------------------------------|
  | **Numerisch**       | Folgen (2, 4, 8, 16, ...)      | Unvollständige Folgen generieren, Nutzer soll nächste Zahl nennen.        |
  | **Visuell**         | Symmetrie von Funktionen       | GeoGebra: *"Was haben diese Parabeln gemeinsam?"*                          |
  | **Algorithmen**     | Ableitungsregeln              | *"Welche Regel wurde hier angewendet?"* (Potenzregel, Kettenregel etc.)     |
  | **Anwendungsbezogen**| Physik (Bewegung)             | *"Wie hängt die Ableitung von s(t) mit v(t) zusammen?"*                     |

- **Transfertest-Vorbereitung**:
  - KI generiert **Aufgaben mit steigender Abstraktion**:
    1. **Einfach**: Direkte Anwendung (z. B. Ableitung von x² berechnen).
    2. **Mittel**: Kombinierte Regeln (z. B. Produktregel + Kettenregel).
    3. **Komplex**: Reale Anwendungen (z. B. *"Berechne die maximale Höhe eines geworfenen Balls"*).
  - **Feedback**: KI erklärt **nicht die Lösung**, sondern gibt **Hinweise** (z. B. *"Erinnere dich an die Kettenregel!"*).

---
### **C. Psychologische Prinzipien**
| Prinzip               | Umsetzung in der App                                                                 | Wissenschaftliche Basis                     |
|-----------------------|--------------------------------------------------------------------------------------|-----------------------------------------------|
| **Neugierde wecken**  | Offene Fragen, reale Anwendungen, Rätsel.                                            | Intrinsische Motivation (Deci & Ryan, 1993)   |
| **Keine Überforderung**| Zone der nächsten Entwicklung (Wygotski), dynamische Schwierigkeitsanpassung.     | Kognitive Belastungstheorie (Sweller)        |
| **Emotionale Führung**| KI als Lernbegleiter (Empathie, Humor, Ermutigung).                                | Emotionale Intelligenz in KI (IBM, 2025)      |
| **Verständnischeck** | Selbsterklärung, Transferaufgaben, Fehleranalyse.                                  | Feynman-Technik, Metakognition                |

---

---

## **🛠️ 3. Technische Architektur**

### **A. Systemkomponenten**
```mermaid
graph TD
    A[Frontend: Web/App] --> B[Backend: KI-Engine]
    B --> C[Lerntyp-Erkennung]
    B --> D[Aufgabengenerierung]
    B --> E[Dialog-System (NLP)]
    B --> F[GeoGebra-Integration]
    B --> G[Fortschritts-Tracking]
    C --> H[Kolb/VARK/Felder-Soloman]
    D --> I[Mustererkennung & Transfertests]
    E --> J[Emotionale Analyse]
    F --> K[Interaktive Mathe-Aufgaben]
    G --> L[Level-System & Badges]
```

### **B. KI-Module**
| Modul                  | Technologie                          | Funktion                                                                 |
|------------------------|--------------------------------------|--------------------------------------------------------------------------|
| **Lerntyp-Erkennung**  | Machine Learning (Clustering)       | Analysiert Nutzerverhalten (z. B. nutzt oft Simulationen → kinästhetisch). |
| **Mustererkennung**    | Neuronale Netze (Pattern Recognition)| Erkennt häufige Fehler (z. B. Vorzeichenfehler bei Ableitungen).         |
| **Emotionale Analyse** | NLP (Sentiment Analysis)             | Erkennt Frustration/Begeisterung in Nutzertexten.                       |
| **Adaptive Aufgaben**  | Reinforcement Learning               | Passt Schwierigkeit basierend auf Erfolgsquote an.                      |
| **Verständnischecks** | NLP + Rule-Based Systems             | Prüft, ob Nutzer Erklärungen in eigenen Worten geben kann.              |
| **GeoGebra-Integration**| Web API + Iframe-Einbettung         | Nutzer löst Aufgaben direkt in GeoGebra, KI wertet aus.                 |

---

---

## **📝 4. Nutzerjourney & Lernablauf**

### **A. Onboarding**
1. **Registrierung**:
   - Nutzer wählt **Fächer** (z. B. Mathe, Physik, Englisch).
   - **Kurzer Lerntyp-Test** (Multiple Choice, siehe [Kapitel 5](#5-lerntyp-test)).
2. **Einstufungstest**:
   - 5–10 Aufgaben pro Fach, um **Start-Level** zu ermitteln.
3. **Profil**:
   - **Dashboard** mit Fortschritt, Badges, Lernhistorie.

### **B. Lernablauf pro Level**
1. **Neugierde wecken** (emotionaler Einstieg + reale Anwendung).
   - *Beispiel (Mathe)*: *"Stell dir vor, du fährst mit dem Fahrrad bergab. Wie misst man die Steigung der Straße?"*
2. **Lerntyp berücksichtigen** (visuell/auditiv/kinästhetisch + Kolb/Felder-Soloman).
   - KI passt **Erklärungsmethode** an (z. B. GeoGebra für Visuelle, Audio für Auditive).
3. **Muster erkennen lassen** (interaktive Aufgaben mit KI-Feedback).
   - *Beispiel*: *"Erkennst du das Muster? 2, 4, 8, 16, ___"*
4. **Emotional führen** (Dialog, Empathie, Motivation).
   - *KI*: *"Krass, dass du das rausgefunden hast! Hier kommt die nächste Herausforderung."*
5. **Verständnis bestätigen** (Selbsterklärung, Transferaufgaben).
   - *KI*: *"Erkläre mir die Kettenregel, als würdest du sie einem Freund erklären."*
6. **Belohnen & nächste Stufe freischalten** (Badges, Level-Aufstieg).

### **C. Transfertest-Vorbereitung**
- **Ziel**: Nutzer sollen **gelernte Muster auf neue Probleme anwenden**.
- **KI-Methoden**:
  1. **Abstraktionsstufen**:
     - **Einfach**: Direkte Anwendung (z. B. Ableitung von x³).
     - **Mittel**: Kombinierte Regeln (z. B. Produktregel + Kettenregel).
     - **Komplex**: Reale Anwendungen (z. B. *"Berechne die maximale Höhe eines geworfenen Balls"*).
  2. **Feedback-Schleifen**:
     - Bei Fehlern: KI gibt **Hinweise**, nicht Lösungen (z. B. *"Erinnere dich an die Kettenregel!"*).
     - Bei Erfolg: KI **bestätigt Verständnis** und steigert die Schwierigkeit.

---

---

## **🔍 5. Lerntyp-Test: Dynamische Erkennung**

### **A. Initialer Test (Multiple Choice)**
- **Format**: 5–10 Fragen, bei denen **eine Aufgabe** gestellt wird und die **Antworten die Lerntypen repräsentieren**.
- **Beispiel-Frage (Mathe-Thema "Ableitungen")**:
  > **Aufgabe**: *"Du sollst die Ableitung von f(x) = x² lernen. Wie würdest du am liebsten vorgehen?"*
  > - **A)** *"Ich möchte eine Grafik sehen, die zeigt, wie sich die Steigung ändert."* → **Visuell (VARK) / Akkommodierer (Kolb)**
  > - **B)** *"Ich möchte eine Formel und Beispiele zum Auswendiglernen."* → **Lese-/Schreibtyp (VARK) / Assimilierer (Kolb)**
  > - **C)** *"Ich möchte es selbst in GeoGebra ausprobieren und die Tangente zeichnen."* → **Kinästhetisch (VARK) / Akkommodierer (Kolb)**
  > - **D)** *"Ich möchte eine reale Anwendung sehen, z. B. wie die Ableitung in der Physik genutzt wird."* → **Konvergierer (Kolb)**

- **Auswertung**:
  - KI **zählt die Häufigkeit der Antworten** und ordnet den Nutzer einem **primären Lerntyp** zu.
  - **Speicherung**: Lerntyp wird im Nutzerprofil hinterlegt, aber **nicht in Stein gemeißelt** (siehe [Dynamische Anpassung](#d-dynamische-anpassung)).

### **B. Lerntyp-Anpassung pro Lektion**
- **KI beobachtet Nutzerverhalten** während des Lernens:
  - **Nutzt der Nutzer oft GeoGebra?** → **Kinästhetisch/Visuell** stärken.
  - **Liest der Nutzer lieber Texte?** → **Lese-/Schreibtyp** bevorzugen.
  - **Springt der Nutzer zwischen Themen hin und her?** → **Globaler Lerntyp (Felder-Soloman)**.
- **Anpassung der Aufgaben**:
  - KI **generiert Aufgaben**, die zum **aktuellen Lerntyp** passen.
  - *Beispiel*:
    - **Visuell**: Mehr Grafiken/Animationen.
    - **Auditiv**: Mehr Erklärvideos/Audio-Feedback.
    - **Kinästhetisch**: Mehr interaktive Simulationen.

### **C. Unstimmigkeiten & Re-Test**
- **Kriterien für Unstimmigkeiten**:
  - Nutzer **scheitert häufig** an Aufgaben, die zu seinem Lerntyp passen sollten.
  - Nutzer **wechselt plötzlich** das Verhalten (z. B. nutzt plötzlich nur noch Texte, obwohl er vorher kinästhetisch war).
  - Nutzer **gibt Feedback** wie *"Ich verstehe das besser mit Grafiken!"*.
- **Maßnahme**:
  - KI **schlägt einen erneuten Test vor** (5–10 Fragen).
  - **Beispiel-Prompt**:
    > *"Ich merke, dass du heute anders lernst als sonst. Möchtest du einen kurzen Test machen, um deinen aktuellen Lerntyp zu überprüfen?"*
  - **Neue Einordnung**: Lerntyp wird **dynamisch angepasst**.

### **D. Dynamische Anpassung**
- **Algorithmus**:
  1. **Start**: Initialer Lerntyp-Test.
  2. **Laufend**: KI trackt **Nutzerverhalten** (z. B. genutzte Medien, Fehlerquoten, Zeit pro Aufgabe).
  3. **Anpassung**:
     - Wenn Nutzer **80% der Aufgaben eines Typs richtig löst** → **Schwierigkeit erhöhen**.
     - Wenn Nutzer **häufig scheitert** → **Lerntyp oder Schwierigkeit anpassen**.
  4. **Re-Test**: Alle **5–10 Lektionen** oder bei Unstimmigkeiten.

---
---
## **🧩 6. Mustererkennung & Transfertests**

### **A. Mustererkennung trainieren**
- **Ziel**: Nutzer sollen **Strukturen und Zusammenhänge** in Daten/Funktionen erkennen.
- **Aufgabentypen**:
  | Typ               | Beispiel                                                                 | KI-Feedback                                                                 |
  |-------------------|--------------------------------------------------------------------------|-----------------------------------------------------------------------------|
  | **Numerisch**     | *"Ergänze die Folge: 3, 6, 12, 24, ___"*                                  | *"Richtig! Jedes Glied wird mit 2 multipliziert."*                        |
  | **Visuell**       | *"Welche dieser Funktionen sind symmetrisch zur y-Achse?"* (GeoGebra) | *"Genau! Das sind die geraden Funktionen."*                              |
  | **Algorithmen**   | *"Welche Ableitungsregel wurde hier angewendet: f(x) = (x² + 3x)²"*    | *"Fast! Es ist die Kettenregel + Potenzregel."*                           |
  | **Anwendungsbezogen** | *"Wie hängt die Ableitung von s(t) mit der Geschwindigkeit v(t) zusammen?"* | *"Perfekt! v(t) ist die Ableitung von s(t) – das ist die Momentangeschwindigkeit."* |

### **B. Vorbereitung auf Transfertests**
- **Strategie**: Nutzer sollen **gelernte Konzepte auf neue, unbekannte Probleme anwenden**.
- **KI-Methoden**:
  1. **Abstraktionsstufen**:
     - **Stufe 1 (Einfach)**: Direkte Anwendung (z. B. Ableitung von x³ berechnen).
     - **Stufe 2 (Mittel)**: Kombinierte Regeln (z. B. Produktregel + Kettenregel).
     - **Stufe 3 (Komplex)**: Reale Anwendungen (z. B. *"Ein Ball wird geworfen. Wann erreicht er seine maximale Höhe?"*).
  2. **Feedback**:
     - **Bei Fehlern**: KI gibt **Hinweise**, nicht Lösungen (z. B. *"Erinnere dich an die Kettenregel!"*).
     - **Bei Erfolg**: KI **bestätigt Verständnis** und steigert die Schwierigkeit.
  3. **Transferaufgaben**:
     - *"Du hast gelernt, wie man Ableitungen berechnet. Jetzt wende das auf dieses Problem an: Ein Unternehmen hat die Gewinnfunktion G(x) = -x³ + 6x² + 100. Bei welcher produzierten Menge x ist der Gewinn am höchsten?"*

---
---
## **💬 7. Emotionale Führung & Dialogbasiertes Lernen**

### **A. KI als Lernbegleiter**
- **Ziel**: Die KI soll **nicht wie ein Lehrer wirken**, sondern wie ein **Motivator und Gesprächspartner**.
- **Eigenschaften**:
  | Eigenschaft          | Beispiel                                                                 | Technische Umsetzung                     |
  |----------------------|--------------------------------------------------------------------------|------------------------------------------|
  | **Empathie**         | *"Ich merke, das Thema ist knifflig – lass uns nochmal von vorne anfangen."* | NLP (Sentiment Analysis)                 |
  | **Fehler normalisieren** | *"Jeder macht Fehler! Ich auch, als ich das gelernt habe."*          | Vordefinierte Antworten + NLP            |
  | **Erfolge feiern**   | *"Boah, das war eine richtig gute Lösung! Wie bist du darauf gekommen?"* | Belohnungssystem (Badges, Level-Aufstieg) |
  | **Persönlichkeit**   | Humorvoll, ermutigend, oder sachlich – je nach Nutzerpräferenz.         | Nutzerprofil (Sprachstil-Einstellung)    |

### **B. Dialogbeispiele**
| Situation               | KI-Antwort                                                                 | Ziel                          |
|-------------------------|----------------------------------------------------------------------------|-------------------------------|
| **Nutzer scheitert**    | *"Kein Stress! Lass uns eine Pause machen oder ein einfacheres Beispiel nehmen."* | Frustration reduzieren        |
| **Nutzer ist unsicher** | *"Was denkst du, warum ist das Ergebnis so?"*                          | Selbstreflexion fördern       |
| **Nutzer hat Erfolg**   | *"Super, dass du das checkst! Hier kommt die nächste Herausforderung."* | Motivation steigern            |
| **Nutzer ist gelangweilt** | *"Ich sehe, du bist schnell. Probier mal diese Knobelaufgabe!"*       | Neugierde wecken               |

### **C. Technische Umsetzung**
- **Natural Language Processing (NLP)**:
  - **Sentiment Analysis**: Erkennt Stimmungen (z. B. Frustration, Begeisterung).
  - **Intent Recognition**: Versteht, was der Nutzer meint (z. B. *"Ich verstehe das nicht"* → KI erklärt es anders).
- **Sprachstil**:
  - **Jugendsprache** (z. B. *"Krass, dass du das rausgefunden hast!"*).
  - **Emojis & GIFs** (z. B. 🎉 bei Erfolg, 🤔 bei Denkaufgaben).

---
---
## **✅ 8. Verständnisbestätigung**

### **A. Methoden zur Verifizierung**
| Methode               | Beispiel                                                                 | Warum es funktioniert                     |
|-----------------------|--------------------------------------------------------------------------|--------------------------------------------|
| **Selbsterklärung**   | *"Erkläre mir die Kettenregel, als würdest du sie einem 10-Jährigen erklären."* | Feynman-Technik: Verständnis zeigt sich in einfacher Erklärung. |
| **Anwendungsaufgaben**| *"Wende die Kettenregel auf f(x) = sin(3x²) an."*                          | Transfertest: Verständnis zeigt sich in der Anwendung. |
| **Fehleranalyse**     | *"Hier ist eine falsche Lösung. Wo liegt der Fehler?"*                   | Metakognition: Nutzer muss aktiv nachdenken. |
| **Lehrvideos erstellen** | *"Erstelle ein 1-minütiges Video, in dem du die Produktregel erklärst."* | Aktives Lernen: Durch Lehren festigt man Wissen. |
| **Dialogbasierte Fragen** | *"Warum funktioniert die Potenzregel?"*                              | Tiefenverständnis: Oberflächliches Auswendiglernen reicht nicht. |

### **B. KI-Algorithmus für Verständnischecks**
1. **Nutzer löst Aufgabe** (z. B. Ableitung berechnen).
2. **KI prüft**:
   - **Ergebnis** (richtig/falsch).
   - **Lösungsweg** (hat der Nutzer die richtige Regel angewendet?).
   - **Zeit** (zu schnell = vielleicht geraten?).
   - **Selbstbewusstsein** (KI fragt: *"Wie sicher bist du dir?"*).
3. **Bei Unsicherheit**:
   - KI fragt nach: *"Wie bist du zu diesem Ergebnis gekommen?"*
   - Nutzer erklärt → KI **vergleicht mit Musterlösungen** (NLP).
4. **Bestätigung**:
   - Wenn Nutzer **konsistent richtige Erklärungen** liefert → **Verständnis bestätigt**.
   - Wenn nicht → **KI gibt gezielte Hinweise** (nicht die Lösung, sondern Denkanstöße).

---
---
## **📊 9. Fortschritts-Tracking & Gamification**

### **A. Level-System**
- **Aufbau**:
  - Jedes **Fach** (z. B. Mathe) → **Thema** (z. B. "Differentialrechnung") → **Level 1–5**.
  - Jedes Level enthält:
    - **Theorie** (kurz, interaktiv).
    - **Aufgaben** (KI-generiert, angepasst an Lerntyp & Fortschritt).
    - **Prüfung** (zum Level-Aufstieg: z. B. 80% richtig).
- **Besonderheiten**:
  - **Langsamer Aufstieg**: Pro Level sind **mehrere Sessions** nötig (z. B. 3x 100% in Aufgaben).
  - **Kein Level-Verlust**: Bei Fehlern → **zusätzliche Übungen** statt Abstufung.
  - **Inaktivitätsphase**:
    - Nach **>14 Tagen Inaktivität** → **Einführungsphase** (5–10 Aufgaben aus vorherigem Level) **ohne Level-Einfluss**.

### **B. Gamification-Elemente**
| Element          | Umsetzung                                                                 | Psychologischer Effekt          |
|------------------|----------------------------------------------------------------------------|----------------------------------|
| **Badges**       | Für Meilensteine (z. B. "10 Tage am Stück gelernt").                     | Erfolgserlebnis, Zielorientierung |
| **Streaks**      | Tägliche Lernziele.                                                       | Gewohnheitsbildung              |
| **Leaderboard**  | Optional, pro Klasse/Schule.                                               | Sozialer Vergleich (Motivation) |
| **Fortschrittsbalken** | Visualisierung: *"Du bist zu 60% auf Level 3 in Mathe!"*          | Transparenz, Motivation          |

---
---
## **🔧 10. GeoGebra-Integration**

### **A. Ziel**
- **API-Nutzung**, um:
  - **Interaktive Mathe-Aufgaben** direkt in der App zu lösen.
  - **Automatische Auswertung** (z. B. prüfen, ob Gerade korrekt gezeichnet).
- **Funktionen**:
  - **Aufgaben-Templates** (z. B. *"Zeichne die Funktion und gib die Nullstelle an"*).
  - **Echtzeit-Feedback** (z. B. *"Fast richtig! Die Tangente sollte steiler sein."*).

### **B. Technische Umsetzung**
  - Einbettung von GeoGebra-Applets via **Iframe**.
  - **Datenübergabe**: Nutzerlösungen werden an die KI gesendet (z. B. als Koordinaten).

---
---
## **📅 11. Roadmap & Nächste Schritte**

### **A. Priorisierte Features (MVP)**
| Phase       | Zeitraum   | Fokus                                                                 |
|-------------|------------|-----------------------------------------------------------------------|
| **1. MVP**  | 2–3 Monate | Lerntyp-Test, KI-Dialog, GeoGebra-Integration, Level-System.          |
| **2. Beta** | 1 Monat    | Mustererkennung, Transfertests, Untis-Integration, Kollaboration.    |
| **3. Release** | 2 Monate | Gamification-Features, weitere Fächer, Feature-Vervollständigung.      |

### **B. Offene Fragen**
1. **KI-Aufgaben**:
   - Soll die KI **komplett neue Aufgaben** generieren oder **Vorlagen anpassen**?
   - Welche Tools benötigt die KI für die Erstellung neuer Aufgaben (z.B. GeoGebra-API, CAS, MathML-Generator)?
   
2. **Rechtliche Fragen**:
   - Lizenzen klären (GeoGebra Non-Commercial License, eigene Inhalte)
   - Impressum und Datenschutz implementieren

### **C. Nächste Schritte für die Entwicklung**
1. **Lerntyp-Test implementieren** (Multiple Choice, 5–10 Fragen).
2. **GeoGebra-Integration finalisieren** - API! Siehe [geo_test.html](geo_test.html) für Demo.
3. **KI-Dialog-System aufsetzen** (NLP-Modell für emotionale Führung).
4. **Mustererkennungstraining umsetzen** (Aufgabenbank mit adaptiven Mustern).
5. **Verständnischecks entwickeln** (Selbsterklärung, Transferaufgaben).

---
---
## **📌 12. Anhang: Code-Snippets & Beispiele**

### **A. Beispiel: Lerntyp-Test (JSON)**
```json
{
  "fragen": [
    {
      "aufgabe": "Du sollst die Ableitung von f(x) = x² lernen. Wie würdest du am liebsten vorgehen?",
      "antworten": [
        {
          "text": "Ich möchte eine Grafik sehen, die zeigt, wie sich die Steigung ändert.",
          "lerntyp": ["Visuell (VARK)", "Akkommodierer (Kolb)"]
        },
        {
          "text": "Ich möchte eine Formel und Beispiele zum Auswendiglernen.",
          "lerntyp": ["Lese-/Schreibtyp (VARK)", "Assimilierer (Kolb)"]
        },
        {
          "text": "Ich möchte es selbst in GeoGebra ausprobieren und die Tangente zeichnen.",
          "lerntyp": ["Kinästhetisch (VARK)", "Akkommodierer (Kolb)"]
        },
        {
          "text": "Ich möchte eine reale Anwendung sehen, z. B. wie die Ableitung in der Physik genutzt wird.",
          "lerntyp": ["Konvergierer (Kolb)"]
        }
      ]
    }
  ]
}
```

### **B. Beispiel: KI-Dialog (Python Pseudocode)**
```python
def handle_user_input(user_input, user_profile):
    # 1. Sentiment Analysis
    sentiment = analyze_sentiment(user_input)
    if sentiment == "frustrated":
        return "Kein Stress! Lass uns eine Pause machen oder ein einfacheres Beispiel nehmen."

    # 2. Intent Recognition
    intent = recognize_intent(user_input)
    if intent == "does_not_understand":
        return explain_differently(user_profile["current_topic"], user_profile["learning_type"])

    # 3. Verständnischeck
    if intent == "solution_submitted":
        if verify_understanding(user_input, user_profile["current_task"]):
            return "Perfekt! 🎉 Du hast es verstanden. Hier ist dein Badge für 'Ableitungs-Meister Level 2'!"
        else:
            return "Fast richtig! Erinnere dich an die Kettenregel. Versuche es nochmal."

    # 4. Standard-Dialog
    return generate_encouraging_response(user_profile)
```

### **C. Beispiel: GeoGebra-Aufgabe (HTML/JS)**
```html
<!-- Einbettung eines GeoGebra-Applets -->
<iframe
  src="https://www.geogebra.org/geometry/abc123"
  width="800px"
  height="600px"
  allowfullscreen
></iframe>

<!-- KI-Auswertung (Pseudocode) -->
<script>
  function checkGeogebraSolution() {
    // 1. Nutzerlösung abrufen (z. B. Koordinaten der gezeichneten Tangente)
    const userSolution = getUserDrawing();
    // 2. Mit Musterlösung vergleichen
    const isCorrect = compareWithSolution(userSolution, correctSolution);
    // 3. Feedback geben
    if (isCorrect) {
      showFeedback("Super! Die Tangente ist korrekt gezeichnet.");
    } else {
      showFeedback("Fast richtig! Die Steigung sollte 2 betragen.");
    }
  }
</script>
```

---
---
## **📚 13. Quellen & Weiterführendes**
- **Lerntypen**:
  - Kolb, D. A. (1984). *Experiential Learning: Experience as the Source of Learning and Development*.
  - Fleming, N. D. (1987). *VARK: A Guide to Learning Styles*.
  - Felder, R. M., & Soloman, B. A. (1988). *Learning and Teaching Styles in Engineering Education*.
- **Mustererkennung**:
  - Tenenbaum, J. (MIT). *Computational Cognitive Science*.
  - Kidd, C., & Hayden, B. (2015). *The Psychology of Curiosity*.
- **Emotionale KI**:
  - IBM (2025). *Dialogorientierte KI: Emotionale Intelligenz*.
  - Deci, E. L., & Ryan, R. M. (1993). *Intrinsic Motivation and Self-Determination in Human Behavior*.
- **Transfertests**:
  - Wygotski, L. (1978). *Mind in Society: The Development of Higher Psychological Processes*.
  - Sweller, J. (1988). *Cognitive Load Theory*.

---
---
## **💡 14. FAQ**
### **F: Wie oft wird der Lerntyp angepasst?**
A: Der Lerntyp wird **laufend beobachtet** und bei **Unstimmigkeiten oder alle 5–10 Lektionen** durch einen **Re-Test** überprüft.

### **F: Was passiert, wenn ein Nutzer den Lerntyp-Test ignoriert?**
A: Die KI **startet mit einem Standard-Lerntyp** (z. B. "Visuell") und passt sich **automatisch** basierend auf dem Nutzerverhalten an.

### **F: Wie wird sichergestellt, dass der Nutzer das Thema *wirklich* versteht?**
A: Durch **Verständnischecks** (Selbsterklärung, Transferaufgaben, Fehleranalyse) und **dialogbasierte Fragen** (KI stellt offene Fragen).

### **F: Kann die KI auch komplexe Mathe-Aufgaben (z. B. Integralrechnung) erklären?**
A: Ja! Die KI **zerlegt komplexe Themen** in kleinere Schritte und nutzt **GeoGebra für Visualisierungen**.

### **F: Wie wird die Mustererkennung trainiert?**
A: Durch **adaptive Aufgaben** (z. B. Folgen, Symmetrien, Ableitungsregeln) und **Transfertests** (Anwendung auf neue Probleme).