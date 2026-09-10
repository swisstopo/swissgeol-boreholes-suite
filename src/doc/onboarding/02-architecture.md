# Architektur

Drei Backends, ein Client, alles hinter einem Reverse Proxy.

## Komponenten

```
   Browser
      │
      ▼
   React Client            (Dev: Vite 5173, Prod: statisch über das .NET API ausgeliefert)
      │  HTTP
      ▼
   YARP Reverse Proxy      (im .NET API, Port 5000)
      │
      ├─► .NET API v2          (in-process Controllers)
      ├─► Python API v1        (Port 8888, Legacy)
      ├─► Data Extraction API  (Pfad /dataextraction)
      └─► OCR API              (Pfad /ocr)
```

Die Routing-Konfiguration steht in [`src/api/appsettings.json`](../../src/api/appsettings.json) unter `ReverseProxy`.

## Wichtige Regeln

- **Neue Features** gehen ausschliesslich gegen `/api/v2`. Das Legacy-Python-API wird nicht erweitert.
- Der Reverse-Proxy übernimmt die Authentifizierung. Das Legacy-API trägt nur den `sub`-Claim des Users im Header (kein JWT), siehe [`LegacyApiAuthenticationMiddleware`](../../src/api/Authentication/LegacyApiAuthenticationMiddleware.cs). **Es darf deshalb nie öffentlich erreichbar sein.**
- Health-Endpoint `/health` ist anonym und prüft DB plus S3.

## Auth-Fluss (Übersicht)

1. Client erhält ein ID-Token vom OIDC-Server (Authorization Code Flow mit PKCE).
2. Client schickt das Token im `Authorization: Bearer`-Header an `/api/v2`.
3. JWT-Bearer-Middleware validiert Issuer und Audience. Bei Cognito-Access-Tokens (kein `aud`) wird auf `client_id` oder `azp` zurückgegriffen.
4. `OnTokenValidated` ruft den UserInfo-Endpoint des IdPs und reichert das Principal mit Email-, Vor- und Nachname-Claims an.
5. `DatabaseAuthenticationClaimsTransformation` legt den User in der DB an (falls neu) und setzt die Rolle `Admin` oder `Viewer` aus `User.IsAdmin`.
6. Default-Policy ist `Admin`. Endpoints, die auch für Viewer offen sein sollen, brauchen explizit `[Authorize(Policy = PolicyNames.Viewer)]`.

Details in [09-authentication.md](09-authentication.md).

## Anonymer Modus

Read-only-Variante für öffentliche Instanzen. Mit `Auth:AnonymousModeEnabled = true` aktiviert sich die [`AnonymousAuthenticationMiddleware`](../../src/api/Authentication/AnonymousAuthenticationMiddleware.cs) statt der JWT-Validation. Schreibende Endpunkte bleiben blockiert, weil sie die `Admin`-Policy verlangen.

## Datenfluss bei einem typischen GET

```
React Component
  └─► TanStack Query Hook
        └─► fetchApiV2WithApiError("/api/v2/borehole/123")
              └─► Vite Proxy (Dev) / direkter Aufruf (Prod)
                    └─► YARP: kein Route-Match → eigener Controller
                          └─► BoreholeController.GetById(123)
                                └─► BdmsContext (EF Core + Npgsql + PostGIS)
```

## Hintergrund-Prozesse

- **Maintenance-Tasks**: `LocationMigrationTask`, `CoordinateMigrationTask`, `UserMergeTask`. Werden manuell über den Maintenance-Endpunkt angestossen.
- **`FileOcrBackgroundService`**: HostedService, das hochgeladene PDFs an die OCR-API schickt und den OCR-Status pro Datei pflegt.
