# Moodle LLM Context fuer Kivo

## Zweck
Dieses Dokument erklaert, wie Moodle-Daten fuer Kivo integriert werden koennen, sodass ein LLM den Datenfluss, die APIs und die Sicherheitsregeln schnell versteht.

## Zielbild in Kivo
- Moodle liefert Kalender-/Termin-/Aufgaben-Kontext.
- Kivo mappt Moodle-Daten in ein internes Normalformat.
- Nutzer sieht Moodle-Events optional in einer einheitlichen Lern-/Planungsansicht.

## Technischer Kern
Moodle nutzt AJAX-Webservices ueber:
- `POST /lib/ajax/service.php?sesskey={key}&info={methodnames}` (auth)
- `GET /lib/ajax/service-nologin.php?info={methodnames}&cachekey={rev}` (public)

Wichtige Eigenschaften:
- Requests koennen gebatcht sein.
- `sesskey` ist fuer schreibende Calls Pflicht.
- Session-/Capability-Logik liegt serverseitig.

## Relevante Methoden fuer Integration
- `core_calendar_get_calendar_monthly_view`
- `core_calendar_get_calendar_day_view`
- `core_calendar_get_calendar_upcoming_view`
- `core_calendar_get_calendar_event_by_id`
- Optional fuer Schreibpfade:
  - `core_calendar_submit_create_update_form`
  - `core_calendar_update_event_start_day`
  - `core_calendar_delete_calendar_events`

## Datenmapping nach Kivo-Normalformat
Pflichtfelder:
- `source = "moodle"`
- `externalId` aus Event-ID
- `type = "event" | "task"`
- `title` aus Eventtitel
- `startsAt`, `endsAt` aus Moodle-Timestamps
- `courseRef` aus Kurskontext
- `metadata` fuer Originaldetails

## Integrationsarchitektur (empfohlen)
1. Frontend fordert Kivo-Integrationsdaten an (nicht direkt Moodle-Credentials verwenden).
2. Supabase Edge Function/Backend-Adapter spricht mit Moodle.
3. Adapter normalisiert Daten.
4. Kivo speichert/cachet Ergebnis optional lokal und zeigt es in der UI.

## Sicherheit
- Keine Moodle-Login-Daten im Browser speichern.
- `sesskey`, Cookies und Tokens nur serverseitig verarbeiten.
- Berechtigungen immer serverseitig validieren.
- Rate-Limits und Retry mit Backoff nutzen.

## Fehlerbehandlung
Typische Fehler:
- Session abgelaufen
- Fehlende Berechtigung
- Methodenname/Argumente ungueltig

Regel:
- Fehler im Adapter in stabile Kivo-Fehlercodes mappen, z. B. `unauthorized`, `forbidden`, `invalid_params`, `upstream_unavailable`.

## Aenderungspflicht
Bei Aenderungen an Moodle-Integration im selben PR aktualisieren:
- `docs/moodle_llm.md`
- `LLM.md`
- ggf. `docs/struktur-mapping.md` (bei neuem Modul/Ownership)
