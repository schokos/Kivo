# llm_voise.md

## Zweck
Diese Datei beschreibt, wie ein KI-Voise Assistent fuer Kivo integriert wird (Issue #15) und wie daraus ein Vokabeln Conversation Mode entsteht (Issue #16).

Standardannahme:
- Primaerer Pfad: Cloud-first ueber Supabase (LLM/Orchestrierung serverseitig)
- Sekundaerer Pfad: Lokale Browser-Modelle als Fallback (transformers.js)

## Ausgangslage aus dem Demo-Prototyp
Quelle war `text-to-text-demo-mit-transformers-js(7).html`.

Der Prototyp zeigte bereits:
- STT mit Whisper (`automatic-speech-recognition`)
- Text-Generation mit TinyLlama (`text-generation`)
- TTS mit SpeechT5 (`text-to-speech`)
- Live-Loop mit Mikrofonaufnahme und turn-basierter Verarbeitung

Abgeleitete Staerken:
- Vollstaendig lokal lauffaehig im Browser
- Schneller Machbarkeitsnachweis fuer Voice-Pipeline

Abgeleitete Grenzen:
- Hohe Client-Last (GPU/CPU/RAM)
- Browser-/Device-Inkompatibilitaeten
- Kein zentraler Governance-Layer (Kosten, Safety, Logging, Limits)

## Zielbild fuer Kivo

### 1) Produktziel
- Nutzer spricht mit dem KI-Assistenten ueber Lerninhalte.
- Assistent antwortet sprachlich und textlich.
- Optional erzeugt der Assistent Vokabelvorschlaege oder Lernaktionen (z. B. Pool-Import).

### 2) Conversation-Mode-Ziel
- Mehrturn-Gespraeche mit Lernkontext (Fach, Kurs, Pool, Schwierigkeit).
- Antwort kann erklaeren, abfragen, korrigieren und Mini-Uebungen vorschlagen.
- Sprachmodus und Textmodus bleiben kompatibel.

## Hybrid-Architektur

### Cloud-first (Standard)
1. Browser erfasst Audio.
2. Browser sendet Voice-Turn an Supabase Function (z. B. `kivo-voice`).
3. Function orchestriert STT -> LLM -> TTS (anbieterabhaengig).
4. Browser erhaelt transkribierten Input, Antworttext, optionale Audio-Referenz und optionale Lernaktionen.

Vorteile:
- Einheitliche Modellsteuerung
- Kosten-/Rate-Limit-Kontrolle
- Zentrale Safety/Logging-Moeglichkeiten

### Local Fallback
- Wenn Cloud nicht verfuegbar oder explizit deaktiviert ist:
  - STT/LLM/TTS lokal via transformers.js
- Fallback nutzt denselben Turn-Vertrag (gleiche Request/Response-Form), damit UI identisch bleibt.

## Integrationspunkte in Kivo

### UI / Screen
- Primaerer Integrationsort: `src/js/screens/aibot.js`
- Ergaenzungen:
  - Mikrofonsteuerung (Start/Stop)
  - Modusumschalter `Text <-> Voice`
  - Statusanzeige (`recording`, `transcribing`, `thinking`, `speaking`, `error`)

### State / Persistenz
- Chat-Historie bleibt kompatibel mit bestehender KI-Session-Logik.
- Voice-Turns werden als normale Messages plus Metadaten abgelegt.
- Sync-Domaene bleibt `chats` (ueber bestehende Mechanik).

### Services
- Neuer Voice-Service in `src/js/services/` (z. B. `voice.js`) empfohlen.
- Verantwortlich fuer:
  - Aufnahme/Audio-Preprocessing
  - Cloud-Request und Fallback-Routing
  - Fehlerbehandlung/Retry-Entscheidung

## API-/Datenvertrag (Cloud-first)

## Request (Voice Turn)
```json
{
  "sessionId": "string",
  "turnId": "string",
  "input": {
    "audioBase64": "string optional",
    "transcript": "string optional"
  },
  "context": {
    "language": "de|en|es|...",
    "subject": "mathe|deutsch|englisch|spanisch|...",
    "poolKey": "string optional",
    "mode": "conversation|vocab_practice",
    "userLevel": "string optional"
  },
  "options": {
    "returnAudio": true,
    "maxTokens": 256,
    "temperature": 0.4
  }
}
```

Regel:
- Entweder `audioBase64` oder `transcript` MUSS vorhanden sein.

## Response (Voice Turn)
```json
{
  "turnId": "string",
  "input": {
    "transcript": "string"
  },
  "assistant": {
    "text": "string",
    "audio": {
      "base64": "string optional",
      "mime": "audio/wav|audio/mpeg"
    }
  },
  "vocabSuggestions": [
    { "term": "string", "translation": "string", "example": "string optional" }
  ],
  "actions": [
    { "type": "import_vocab", "payload": { "poolName": "string", "items": [] } }
  ],
  "usage": {
    "provider": "string",
    "model": "string",
    "latencyMs": 0
  },
  "error": null
}
```

## Fehlerfall
```json
{
  "turnId": "string",
  "error": {
    "code": "stt_failed|llm_failed|tts_failed|rate_limited|unauthorized|network",
    "message": "string",
    "retryable": true
  }
}
```

## Sicherheits- und Betriebsregeln
- Keine Service-Keys im Frontend.
- Auth nur ueber Supabase Session Token (`Authorization: Bearer ...`).
- Rate-Limits serverseitig erzwingen (pro User/IP/Zeitfenster).
- Kostenkontrolle:
  - Modelwahl serverseitig steuerbar
  - Harte Token-/Audio-Limits
  - Optionales Budget-Monitoring pro Nutzer
- Privacy:
  - Klare Kennzeichnung, ob Audio gespeichert wird.
  - Default: minimale Datenspeicherung (nur noetige Metadaten/Transkripte).

## Ende-zu-Ende-Flow (inkl. Fehler)
1. Nutzer startet Voice in `aibot`.
2. Client nimmt Audio auf und sendet Turn an Cloud-Endpoint.
3. Cloud liefert Transkript + Antworttext + optional TTS.
4. Client zeigt Antworttext, spielt Audio ab und speichert Turn in Chat-Session.
5. Sync-Domaene `chats` wird markiert und via bestehendem Mechanismus synchronisiert.
6. Fehlerfall `rate_limited`:
- UI zeigt klare Meldung.
- Kein Absturz der Session.
- Optionaler lokaler Fallback wird angeboten.

## Implementierungsfahrplan

### MVP (Phase 1)
- Voice-UI in `aibot` (Start/Stop, Status, Textausgabe)
- Cloud-Endpoint fuer STT->LLM->TTS mit obigem Vertrag
- Speicherung als normale Chat-Turns

### Ausbau (Phase 2)
- Vokabeln Conversation Mode mit `subject/pool`-Kontext
- `vocabSuggestions` und `import_vocab` Action in UI nutzbar machen
- Verbesserte Fehler-/Retry-Strategie

### Robustheit (Phase 3)
- Lokaler transformers.js-Fallback
- Telemetrie fuer Latenz/Fehlerraten
- Feingranulare Limits pro Nutzerstufe

## Aenderungspflicht
Wenn Voice-/Conversation-Logik geaendert wird, muessen im selben PR aktualisiert werden:
- `llm_voise.md`
- `LLM.md`
- ggf. `docs/struktur-mapping.md` (bei Modul-/Ownership-Aenderungen)
