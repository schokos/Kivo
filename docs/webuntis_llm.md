# WebUntis LLM Context fuer Kivo

## Zweck
Dieses Dokument beschreibt die WebUntis-Integration fuer Kivo auf Basis der JSON-RPC-API und gaengiger Wrapper, damit ein LLM die technische Umsetzung sicher planen kann.

## Ausgangslage
- WebUntis nutzt JSON-RPC 2.0.
- Standard-Endpunkte:
  - `POST /WebUntis/jsonrpc.do`
  - `POST /WebUntis/jsonrpc2.do`
- Typische Hosts:
  - `https://{schule}.webuntis.com`
  - optional mobile Endpoint: `https://mobile.webuntis.com/WebUntis/jsonrpc.do`

Hinweis:
- Die API ist nicht vollstaendig oeffentlich dokumentiert; Verhalten kann je Schulserver variieren.

## Relevante Methoden fuer Kivo
- Stundenplan:
  - `getTimetable`
  - `getCustomTimetable`
  - `getTimetableWithAbsences`
- Hausaufgaben:
  - `getHomeworks`
  - `getHomework`
- Stammdaten:
  - `getTeachers`, `getKlassen`, `getRooms`, `getSubjects`
- Vertretungen:
  - `getSubstitutions`

## Authentifizierungsoptionen
- Benutzername/Passwort
- Secret-Login
- QR-basierte Auth
- Optional anonym/public, falls Schule aktiviert

Regel fuer Kivo:
- Zugangsdaten nie im Frontend persistieren.
- Untis-Login und Session-Verwaltung nur serverseitig.

## Datenmapping nach Kivo-Normalformat
Pflichtfelder:
- `source = "untis"`
- `externalId` aus Period/Homework/Entity-ID
- `type = "lesson" | "homework" | "event"`
- `title` aus lessonText/Fach/Task-Text
- `startsAt`, `endsAt` aus Datum+Zeit
- `courseRef` aus Klasse/Fach
- `metadata` fuer Lehrer/Raum/Vertretungstext etc.

## Beispiel: JSON-RPC Request
```json
{
  "jsonrpc": "2.0",
  "method": "getTimetable",
  "params": {
    "id": 301,
    "type": "klassen",
    "startDate": "2026-05-13",
    "endDate": "2026-05-19"
  },
  "id": 1
}
```

## Integrationsarchitektur (empfohlen)
1. Kivo-Frontend fordert normalisierte Daten via Supabase/Backend-Adapter an.
2. Adapter authentifiziert sich gegen WebUntis.
3. Adapter ruft Timetable/Homework/Vertretungen ab.
4. Adapter mappt auf Kivo-Normalformat und gibt nur noetige Felder zurueck.
5. Kivo zeigt Daten in Lern-/Planungsansichten an.

## Fehler- und Session-Handling
Typische Fehler:
- `401` (ungueltige Anmeldedaten)
- `403` (keine Berechtigung)
- `404` (Element nicht gefunden)
- JSON-RPC `-32602` (invalid parameters)

Regel:
- Untis-Fehler in stabile interne Fehlercodes mappen (`unauthorized`, `forbidden`, `not_found`, `invalid_params`, `upstream_unavailable`).
- Session-Timeouts abfangen und kontrolliert neu authentifizieren.

## Zeitformat
- Datum: `YYYY-MM-DD`
- Zeit: `HH:MM`
- Schulzeitkontext beachten (lokale Zeitzone)

## Aenderungspflicht
Bei Aenderungen an Untis-Integration im selben PR aktualisieren:
- `docs/webuntis_llm.md`
- `LLM.md`
- ggf. `docs/struktur-mapping.md`
