[![.github/workflows/ci.yml](https://github.com/swisstopo/swissgeol-boreholes-suite/actions/workflows/ci.yml/badge.svg)](https://github.com/swisstopo/swissgeol-boreholes-suite/actions/workflows/ci.yml) [![Release](https://github.com/swisstopo/swissgeol-boreholes-suite/actions/workflows/release.yml/badge.svg)](https://github.com/swisstopo/swissgeol-boreholes-suite/actions/workflows/release.yml) [![Latest Release](https://img.shields.io/github/v/release/geoadmin/suite-bdms)](https://github.com/swisstopo/swissgeol-boreholes-suite/releases/latest) [![License](https://img.shields.io/github/license/geoadmin/suite-bdms)](https://github.com/swisstopo/swissgeol-boreholes-suite/blob/main/LICENSE)

# boreholes.swissgeol.ch

Webapplikation zur einfachen strukturierten und harmonisierten Erfassung von geologischen Bohrdaten.

## Einrichten der Entwicklungsumgebung

Folgende Komponenten müssen auf dem Entwicklungsrechner installiert sein:

✔️ Git  
✔️ Docker  
✔️ Visual Studio 2022  
✔️ Node.js 22 LTS  
✔️ Optional, um die Onlinehilfe zu erstellen: [MkDocs](https://www.mkdocs.org/)

### Entwicklung mit Visual Studio 2022

Es wird eine lokale Installation von Node.js benötigt. Diese kann mit Visual Studio 2022 oder mit [nvm](https://github.com/coreybutler/nvm-windows/releases) installiert werden, um mehrere Node Version zu verwalten. Anschliessend kann mit `nvm use` die im Projekt verwendete Node Version aktiviert werden.

Das Projekt kann mit dem Launch Profile _Boreholes_ gestartet werden.

### Entwicklung mit Docker

Mit `docker-compose up` kann eine funktionierende Infrastruktur hochgefahren werden. Sie unterstützt Hot-Reload und lädt den Code aus dem lokalen Verzeichnis. Unter Windows mit Docker-Desktop kann die Synchronisierung in den _mounted volumes_ zu Performance-Problemen führen.

**Folgende Dienste/Anwendungen sind anschliessend wie folgt verfügbar**

| 🔖 Dienst/Anwendung         | 🔗Adresse                                                                                      | 🧞Benutzername | 🔐Passwort     |
| :-------------------------- | :--------------------------------------------------------------------------------------------- | :------------- | :------------- |
| Boreholes of Switzerland    | [localhost:3000](http://localhost:3000/)                                                       | `admin`        | `swissforages` |
| pgAdmin                     | [localhost:3001](http://localhost:3001/)                                                       | n/a            | n/a            |
| Tornado REST API (`v1`)[^1] | [localhost:8888](http://localhost:8888/) [localhost:3000/api/v1](http://localhost:3000/api/v1) | n/a            | n/a            |
| .NET REST API (`v2`)[^1]    | [localhost:5000](http://localhost:5000/) [localhost:3000/api/v2](http://localhost:3000/api/v2) | n/a            | n/a            |
| OIDC Server                 | [localhost:4011](http://localhost:4011/)                                                       | `admin`        | `swissforages` |

[^1]: Authentifizierung via `Authorization` Header mit Bearer-Token (`identity_token`) von OIDC Server. Login-Konfigurationen können in [config/oidc-mock-users.json](./config/oidc-mock-users.json) getätigt werden.

❌Der Debug Output der Tornado REST API ist aktuell in Visual Studio nicht sichtbar. Bitte den Container-Log benutzen `docker compose logs api --follow` oder direkt in Visual Studio im _Containers_-Tab.

## Cypress Tests

Die Cypress Tests können mit `npm run cy` oder `npm run test` gestartet werden. Sie werden zudem automatisch in der CI/CD Pipeline ausgeführt. Das Projekt ist mit [Cypress Cloud](https://cloud.cypress.io/) konfiguriert, wodurch unter anderem die parallele Ausführung der End-to-End (E2E) Tests ermöglicht wird. Testergebnisse und Aufzeichnungen sind ebenfalls direkt in [Cypress Cloud](https://currents.dev/) einsehbar, was die Identifikation und Behebung möglicher Fehler und Probleme erleichtert. Um die detaillierten Testergebnisse einzusehen und die E2E-Tests des Projekts zu debuggen, kann die [Cypress Dashboard-Seite](https://cloud.cypress.io/projects/gv8yue/runs) besucht werden.

## Authentifizierung & Architektur

Die Applikation nutzt das OpenID Connect (OIDC) Protokoll für die Authentifizierung und Teile der Autorisierung. Die Authentifizierung erfolgt über den OIDC Server, welcher in der Entwicklungsumgebung durch [soluto/oidc-server-mock](https://github.com/Soluto/oidc-server-mock) auf Basis von [IdentityServer4](https://identityserver4.readthedocs.io/) simuliert wird. Die Applikation nutzt den _Authorization Code Flow_ mit _PKCE_ für die Authentifizierung. Für den Zugriff auf die API wird der `identity_token` verwendet, welcher die Benutzerinformationen enthält. Die Grundsätzliche Autorisierung erfolgt über die Gruppenzugehörigkeit des Benutzers, welche im `identity_token` enthalten ist. Die Autorisierung auf API-Ebene erfolgt über die in der Datenbank definierten Workgroups & Administratoren-Rechte.

### OpenID Connect (OIDC) Konfiguration

Die Applikation benötigt für die Authentifizierung und Autorisierung eine gültige OIDC-Konfiguration. Diese Konfiguration wird ausschliesslich in BDMS.Api benötigt. Sie wird über `/api/v2/settings` dem Client zur Verfügung gestellt. Die Werte werden durch den OIDC Server vergeben. Die folgenden Konfigurationen müssen gesetzt werden:

| Parameter                 | Beschreibung                                                                                                                                                                                                                                         |
| :------------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Auth:Authority            | Die URL des OpenID Connect Servers. Es ist vorausgesetzt, dass der Server ein gültiges [OpenID Connect Discovery Dokument](https://openid.net/specs/openid-connect-discovery-1_0.html) zur Verfügung stellt.                                         |
| Auth:Audience             | Der Wert des `aud` Claims, welcher in den `identity_token` des [OIDC Servers](https://openid.net/specs/openid-connect-core-1_0.html#IDToken) enthalten ist. Die Audience wird als `client_id` verwendet beim Authentifizieren auf dem OIDC Endpunkt. |
| Auth:Scopes               | Die benötigten Scopes, welche beim Authentifizieren auf dem OIDC Endpunkt angefragt werden. Default: `openid profile`                                                                                                                                |
| Auth:GroupClaimType       | Der Name des Claims, welcher die Gruppenzugehörigkeit des Benutzers enthält. Default: `cognito:groups`                                                                                                                                               |
| Auth:AuthorizedGroupName  | Der Name der Gruppe, welche autorisiert ist, um auf die API zuzugreifen.                                                                                                                                                                             |
| Auth:AnonymousModeEnabled | Gibt an, ob die OIDC-Konfiguration ignoriert und die Authentifizierung abgestellt werden soll. Ist für den Betrieb im anonymen Modus (read-only) erforderlich.                                                                                       |

### Legacy API Authentifizierung

Requests and das Legacy API werden mit dem [YARP Reverse Proxy](https://microsoft.github.io/reverse-proxy/articles/config-files.html) durch das neue API weitergeleitet. Die Authentifizierung wird über das neue API übernommen. Die Authentifizierung erfolgt mit der [LegacyApiAuthenticationMiddleware](src\api\Authentication\LegacyApiAuthenticationMiddleware.cs) welche den `Authorization` Header mit dem `sub` Claim des Benutzers befüllt. **⚠️Da die Validierung des `identity_tokens` dabei verloren geht, darf das Legacy API nicht öffentlich verfügbar sein**. Die Konfiguration des Legacy API Endpunkts erfolgt über die [Konfiguration](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/configuration) von `ReverseProxy:Clusters:pythonApi:Destinations:legacyApi:Address`.

### Anonymer Modus (read-only)

Die Applikation kann auch im anonymen Modus betrieben werden, um die Bohrdaten öffentlich zugänglich zu machen. In diesem Modus ist die Applikation nur im read-only Modus verfügbar. Die Konfiguration erfolgt über OIDC-Konfiguration (siehe oben). Die Applikation wird im anonymen Modus gestartet, wenn `Auth:AnonymousModeEnabled` auf `true` gesetzt ist.

## Release-Prozess

### Pre-release

Jede Änderung, die in den `main`-Branch gemerged wird, löst automatisch den
[Pre-release-Workflow](./.github/workflows/pre-release.yml) aus. Dieser erstellt einen neuen GitHub **Pre-release** mit einer neuen Versionsnummer, baut ein Docker-Image mit derselben Version und taggt das Image zusätzlich mit `:edge`.

### PROD-Release

Ein PROD-Release entsteht, indem ein beliebiger Pre-release im GitHub Release-Bereich
als **„Set as the latest release"** markiert wird. Das entsprechende Docker-Image bekommt dabei zusätzlich den `latest`-Tag.

### Release Candidate (RC)

Um eine bestimmte Version als Release Candidate zu kennzeichnen, kann der GitHub-Workflow
[Release Candidate](./.github/workflows/release-candidate.yml) manuell gestartet werden. Er ergänzt den _Release Candidate_ Docker-Image-Tag für eine bestehende Version.

**So geht's:**

1. Im GitHub Repository unter _Actions_ den Workflow _Release Candidate_ auswählen.
2. Auf _Run workflow_ klicken.
3. Die Quellversion eingeben (z.B. `2.1.1427` ohne `v`).

Der Workflow erstellt dann für alle Docker-Images (Client, API, etc.) einen neuen Tag (z.B. `:v2.1.1427-rc`).

### Hotfix-Release erstellen

Ein Hotfix-Release wird erstellt, indem vom letzten Release-Git-Tag ein neuer Branch angelegt wird. Dort werden die nötigen Korrekturen gemacht und anschliessend manuell ein neuer GitHub [Pre-release](https://github.com/swisstopo/swissgeol-boreholes-suite/releases) erstellt, der dann wiederum als **„Set as the latest release"** markiert werden kann.

### Docker-Image-Tags

| Tag | Beschreibung |
| --- | ----------- |
| `:edge` | Neuester Stand aus `main` (letzter Pre-release) |
| `:v<version>` | Bestimmte Version, z.B. `:v2.1.1427` |
| `:v<version>-rc` | Release Candidate einer bestimmten Version, z.B. `:v2.1.1427-rc` |
| `:latest` | Aktuelle produktive Version (PROD-Release) |

## Developer best practices

#### UI/UX

- Das UI-Design ist in [Figma](https://www.figma.com/design/cEiOoOazAQZqpRY92ZhBeO/SwissGeol?node-id=7390-40928&t=DemUCUzYlysJ5lB4-0) definiert. Unter Pages/Screens sind die definitiven Designs zu finden.
- Standardmässig werden die [Lucid Icons](https://lucide.dev/icons/) verwendet. Custom-Icons können aus [Figma](https://www.figma.com/design/cEiOoOazAQZqpRY92ZhBeO/SwissGeol?node-id=7390-40928&t=DemUCUzYlysJ5lB4-0) kopiert und als SVG eingebunden werden. Um die Icons farblich stylen zu können, müssen `fill` und `stroke` wie folgt angepasst werden `fill="currentColor" stroke="currentColor"`.
- Wo möglich sollten UI-Komponenten der [swissgeol-ui-core](https://github.com/swisstopo/swissgeol-ui-core) und [swissgeol-ui-core-react](https://github.com/swisstopo/swissgeol-ui-core/pkgs/npm/swissgeol-ui-core-react) Libraries verwendet werden.
- Sind keine Komponenten in den Swissgeol UI Libraries vorhanden, muss geklärt werden, ob die Komponente in der Swissgeol UI Library ergänzt werden soll. Je nach Entscheid wird die neue Komponente entwickelt oder [MUI](https://mui.com/) als UI Library verwendet. Allgemeine Styles werden im [AppTheme.ts](./src/client/src/AppTheme.ts) definiert und diese Styles werden, wo immer möglich, verwendet. [MUI Styled Components](https://mui.com/system/styled/) im gleichen File mit der Komponente definieren, sobald die Styles mehrfach gebraucht werden. Übergreifende Styled Components werden in [styledComponents.ts](./src/client/src/components/styledComponents.ts) definiert. Für Abstände (margins, paddings, gaps etc.) sollten möglichst [MUI Spacings](https://mui.com/system/spacing/) verwendet werden.

#### Typescript

- Neue Komponenten werden in Typescript geschrieben.
- Es werden bevorzugt Interfaces statt Types verwendet.
- Interfaces, die API Calls abbilden, werden unter [apiInterfaces.ts](./src/client/api/apiInterfaces.ts) definiert ([ReduxStateInterfaces.ts](./src/client/src/api-lib/ReduxStateInterfaces.ts) für das Legacy API).
- Existieren mehrere Interfaces für eine Komponente, werden sie in einem separaten File neben der Komponente abgelegt.
- Das Interface für die React props der Komponente kann im selben File mit der Komponente definiert werden.

#### Translation

- Texte werden mit dem `useTranslation` hook von `react-i18next` übersetzt. Das `withTranslation HOC` wird nicht mehr verwendet.
- Neue Übersetzungskeys alphabetisch sortiert und in CamelCase in den `common.json` Files unter [public/locale](./src/client/public/locale) erfassen.

#### API

- Neue Endpoints werden immer im .NET API erstellt. Das Python Legacy API wird nicht erweitert.
- Redux wird nicht mehr erweitert. Datenabfragen werden mit dem Javascript [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) (siehe [fetchApiV2.ts](src/client/src/api/fetchApiV2.ts)) oder wo sinnvoll mit `useQuery` von `tanstack-query` gemacht.
- Wenn Abfragen aus dem Redux Store in neuen Komponenten gebraucht werden, sollten die React hooks `useSelector` und `useDispatch` verwendet werden.

#### Error Handling
##### Erwartbare Fehler
Inkorrekte User-Inputs, Formvalidation etc. werden direkt in der Komponente abgefangen und dem User als Inline-Message oder Alert angezeigt.

##### Unerwartete Fehler
Server Error, Render-Fehler etc. werden durch Error Boundaries abgefangen. Sie dienen als Fallback und sollten im normalen Ablauf der Anwendung nicht sichtbar sein.
Wichtig: Error Boundaries im korrekten Scope platzieren (z.B. global, Übersichtsseite, Detailseite, Settings), damit möglichst viel der Applikation weiter funktioniert, wenn ein Fehler auftritt.
Bei Bedarf können zusätzliche feingranularere Error Boundaries ergänzt werden. 

##### Error Handling in Fetch-Requests
Für neue Fetch-Requests sollte immer `fetchApiV2WithApiError` (bzw. `uploadWithApiError`) verwendet werden.

- **Fetch-Requests mit TanStack Query (siehe `queryClient`-Konfiguration in `App.tsx`).:**
    - **GET-Requests Keine Daten im Cache:** Die nächste Error Boundary wird gerendert.
    - **GET-Requests Daten im Cache vorhanden:** Es werden veraltete Daten angezeigt und der Nutzer erhält einen Hinweis (Alert), dass die Daten nicht aktuell sein könnten.
    - **ADD/UPDATE/DELETE-Requests:** Die bisherigen Daten werden weiterhin angezeigt, Nutzer erhält einen Hinweis (Alert), dass die die Aktion nicht erfolgreich war.
    - **Individuelle Reaktion auf Fehler:** Bei Fehlern vom Typ `ApiError` wird kein Standardalert angezeigt (siehe `queryClient`-Konfiguration in `App.tsx`). Der `isError`-State bzw. der `onError`-Handler der Query/Mutation kann verwendet werden, um je nach Bedarf eine Fallback-Komponente zu rendern oder einen Alert anzuzeigen. `ApiError` werden entweder direkt clientseitig von der Fetch-Funktion geworfen (siehe Beispiele in `file.ts` ) oder sie werden für Problem-Responses mit `type:"userError"` geworfen (siehe `handleFetchError` in `fetchApiV2.ts` und `StratigraphyV2Controller.cs`).

- **Fetch-Requests, die nicht von TanStack Query gemanagt werden (legacy):**
  - Wird `fetchApiV2WithApiError` verwendet, muss der Fetch-Request in einem `try-catch`-Block ausgeführt und Fehler explizit behandelt werden.
  - Wird `fetchApiV2Legacy` verwendet, erscheint im Fehlerfall ein Standard-Browser-Alert.
