# Microsoft Teams LLM Context fuer Kivo

## Zweck
Dieses Dokument beschreibt die Integrationsgrundlagen fuer Microsoft Teams, damit ein LLM Teams-Daten planbar in Kivo anbinden kann.

## Zielbild in Kivo
- Teams liefert Meeting-, Aufgaben- und Kommunikationskontext fuer Lernen.
- Kivo nutzt Teams nicht als Primar-UI, sondern als Datenquelle/Trigger.

## Bevorzugte API-Ebene
- Microsoft Graph API (Teams, Kalender, Chats, Aufgaben)
- Auth ueber Microsoft Entra ID (OAuth 2.0)

## Typische Datenquellen
- Meetings/Termine (Kalender)
- Channel-/Chat-Kontext (lesend)
- Aufgaben/Planner-ToDos (falls im Scope)

## Empfohlene Kivo-Adapterstruktur
1. OAuth-Consent serverseitig initialisieren.
2. Access/Refresh Tokens verschluesselt serverseitig speichern.
3. Geplante Sync-Jobs oder on-demand Fetch gegen Graph API.
4. Ergebnis in Kivo-Normalformat mappen.

## Kivo-Normalformat (Teams)
Pflichtfelder:
- `source = "teams"`
- `externalId` (Graph ID)
- `type = "meeting" | "task" | "message" | "event"`
- `title`
- `startsAt`, `endsAt` (falls zeitbasiert)
- `courseRef` (wenn aus Team/Kanal ableitbar)
- `metadata` (z. B. teamId, channelId, joinUrl)

## Sicherheitsregeln
- Keine Graph-Client-Secrets im Frontend.
- Least-Privilege Scopes nutzen.
- Tenant-/User-Bindung vor jedem Sync validieren.
- Webhook-/Subscription-Events signaturpruefen.

## Betriebsregeln
- Inkrementelles Sync-Modell bevorzugen (Delta/Changed-Sets).
- API-Limits beachten, mit Backoff reagieren.
- Zeitangaben konsistent als ISO speichern und lokal anzeigen.

## Fehlerbehandlung
Stabile interne Fehlercodes nutzen:
- `unauthorized`
- `forbidden`
- `rate_limited`
- `upstream_unavailable`
- `mapping_failed`

## Aenderungspflicht
Bei Aenderungen an Teams-Integration im selben PR aktualisieren:
- `docs/teams_llm.md`
- `LLM.md`
- ggf. `docs/struktur-mapping.md`
