# Authentifizierung und Autorisierung

OIDC + JWT Bearer + Datenbank-Rollen. Drei Stellen, an denen die Logik passiert.

## 1. JWT validieren

In [`Program.cs`](../../src/api/Program.cs):

- Issuer und Audience werden gegen `Auth:Authority` und `Auth:Audience` geprüft.
- Bei Cognito-Access-Tokens (kein `aud`-Claim) wird auf `client_id` oder `azp` zurückgegriffen.

## 2. UserInfo anreichern

`JwtBearerEvents.OnTokenValidated` ruft den UserInfo-Endpoint des IdPs über den `UserInfoService` und fügt Email-, Given-Name- und Family-Name-Claims hinzu. Fehlt `email`, wird das Token verworfen.

## 3. Claims aus der DB

[`DatabaseAuthenticationClaimsTransformation`](../../src/api/Authentication/DatabaseAuthenticationClaimsTransformation.cs) läuft nach erfolgreicher Token-Validierung:

- Legt den User in `users` an, falls noch nicht vorhanden (Trigger: erste Anmeldung).
- Setzt `Name` aus erstem Buchstaben des Vornamens und Nachnamen, z. B. `M. Bleuler`.
- Fügt die Rolle `Admin` oder `Viewer` aus `User.IsAdmin` hinzu.

## Policies

Definiert in `Program.cs`, Konstanten in [`Authentication/PolicyNames.cs`](../../src/api/Authentication/PolicyNames.cs).

| Policy | Wer kommt durch |
| :--- | :--- |
| `Admin` | Nur Admins. **Default-Fallback-Policy.** |
| `Viewer` | Admins und Viewer. |
| `anonymous` | Alles, was explizit `[AllowAnonymous]` markiert ist (`/health`, `/version`). |

**Wichtig:** `[Authorize]` ohne Policy-Namen niemals verwenden. Stattdessen `[Authorize(Policy = PolicyNames.Viewer)]` oder `[AllowAnonymous]`. Das ist genau so im Source-Kommentar bei der Policy-Definition festgehalten.

## Workgroups und Pro-Bohrung-Berechtigungen

Berechtigungen pro Bohrung gehen über [`BoreholePermissionService`](../../src/api/Services/BoreholePermissionService.cs). Ein User sieht eine Bohrung, wenn:

- die Bohrung public ist, oder
- der User Mitglied der zugewiesenen Workgroup ist.

Admin-Rechte werden separat geprüft und überschreiben die Workgroup-Regel.

## Anonymer Modus

Wenn `Auth:AnonymousModeEnabled = true`:

- Die JWT-Validierung wird **nicht** registriert.
- Die [`AnonymousAuthenticationMiddleware`](../../src/api/Authentication/AnonymousAuthenticationMiddleware.cs) setzt einen Pseudo-Principal ohne Admin-Rolle.
- Read-Endpoints (Viewer-Policy) sind offen, schreibende Endpoints bleiben blockiert.

## Legacy-API

YARP leitet `/api/v1/*` an das Python-API weiter. Das Python-API kennt das JWT nicht, deshalb übersetzt die [`LegacyApiAuthenticationMiddleware`](../../src/api/Authentication/LegacyApiAuthenticationMiddleware.cs) den `sub`-Claim in einen Basic-Auth-Header. Konsequenz: Das Python-API darf **nie** öffentlich erreichbar sein, weil die JWT-Validierung an diesem Hop verloren geht.
