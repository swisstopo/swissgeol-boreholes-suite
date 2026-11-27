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

Das Projekt kann mit dem Launch Profile _Boreholes_ gestartet werden. Dieses startet API und Client lokal (nicht als Container) und im Hintergrund via `docker-compose` die übrigen Dienste (`db`, `minio`, `oidc-server`, `pgadmin`, `dataextraction`, `ocr`). Mit dem Profil _BoreholesWithoutClient_ wird nur die API lokal gestartet, ohne den Client.

### Entwicklung mit Docker

Mit `docker-compose up` kann eine funktionierende Infrastruktur hochgefahren werden. Sie unterstützt Hot-Reload und lädt den Code aus dem lokalen Verzeichnis. Unter Windows mit Docker-Desktop kann die Synchronisierung in den _mounted volumes_ zu Performance-Problemen führen.

**Folgende Dienste/Anwendungen sind anschliessend wie folgt verfügbar**

| 🔖 Dienst/Anwendung         | 🔗Adresse                                                                                      | 🧞Benutzername | 🔐Passwort     |
| :-------------------------- | :--------------------------------------------------------------------------------------------- | :------------- | :------------- |
| Boreholes of Switzerland    | [localhost:3000](http://localhost:3000/)                                                       | `admin`        | `swissforages` |
| pgAdmin                     | [localhost:3001](http://localhost:3001/)                                                       | n/a            | n/a            |
| .NET REST API (`v2`)[^1]    | [localhost:5000](http://localhost:5000/) [localhost:3000/api/v2](http://localhost:3000/api/v2) | n/a            | n/a            |
| OIDC Server                 | [localhost:4011](http://localhost:4011/)                                                       | `admin`        | `swissforages` |

[^1]: Authentifizierung via `Authorization` Header mit Bearer-Token (`identity_token`) von OIDC Server. Login-Konfigurationen können in [config/oidc-mock-users.json](./config/oidc-mock-users.json) getätigt werden.

### Mehrere Worktrees parallel (Slots)

Mit [Git-Worktrees](https://git-scm.com/docs/git-worktree) lassen sich mehrere Branches gleichzeitig ausgecheckt halten, zum Beispiel um einen Pull Request zu prüfen, während die eigene Arbeit weiterläuft, oder um mehrere Agent-Sitzungen (z.B. Claude Code) an verschiedenen Branches arbeiten zu lassen. Damit jeder Worktree die Applikation auch mit seinem eigenen Stand starten und testen kann, startet er Datenbank, API und OIDC-Mock in einem eigenen _Slot_.

**Warum Slots nötig sind**

Der normale Stack aus `docker-compose.yml` belegt feste Ports (Client 3000, API 5000, Datenbank 5432, OIDC-Mock 4011). Daraus ergeben sich drei Probleme, sobald mehr als ein Checkout die Applikation starten will:

- Ein zweiter Stack startet nicht, weil die Ports bereits belegt sind.
- Ein Worktree, der nur seinen Client startet und den laufenden Stack des Hauptcheckouts mitbenutzt, testet gegen die API, die Migrationen und die Seed-Daten eines anderen Branches. Fehler und erfolgreiche Tests sagen dann nichts über den eigenen Branch aus.
- Der OIDC-Mock leitet nach dem Login nur an registrierte Adressen zurück. Ein Client auf einem beliebigen anderen Port kann sich nicht anmelden.

Ein Slot von 1 bis 9 verschiebt deshalb alle Ports und gibt dem Worktree eine eigene Datenbank. Die Client-Ports aller Slots sind im OIDC-Mock registriert ([config/oidc-mock-clients.json](./config/oidc-mock-clients.json)).

**Was ein Slot startet**

| Dienst    | Port        | Beispiel Slot 1 | Läuft aus                                  |
| :-------- | :---------- | :-------------- | :----------------------------------------- |
| Client    | `3<slot>00` | `3100`          | dem Worktree, mit `npm run start` auf dem Host |
| API       | `5<slot>00` | `5100`          | dem Worktree, als Container (`src/api` wird gemountet, Änderungen werden neu geladen) |
| Datenbank | `5<slot>32` | `5132`          | dem Worktree, als Container mit eigenem Volume |
| OIDC-Mock | `4<slot>11` | `4111`          | dem Worktree, als Container                |

`minio`, `ocr` und `dataextraction` teilen sich alle Slots und laufen aus dem Hauptcheckout. Hochgeladene Dateien erhalten eindeutige Objektnamen, die Slots überschreiben sich also nicht gegenseitig. `pgadmin` und der Client-Container werden in einem Slot nicht gestartet. Die Konfiguration liegt in [docker-compose.worktree.yml](./docker-compose.worktree.yml), die Ports für Vite und Cypress berechnet [src/client/worktree-slot.js](./src/client/worktree-slot.js).

Ohne `BDMS_SLOT` ändert sich nichts: Der Hauptcheckout, das Visual Studio Launch Profile und die CI verwenden weiterhin die Standard-Ports.

**Verwendung**

Alle Slot-Befehle werden im Root des Worktrees ausgeführt, nie im Hauptcheckout. Docker Compose benennt das Projekt nach dem Ordner. Im Hauptcheckout würde der Slot-Stack deshalb den normalen Stack ersetzen.

1. Einmalig die geteilten Dienste im Hauptcheckout starten: `docker compose up -d minio ocr dataextraction`.
2. Einen freien Slot wählen. `docker compose ls` zeigt, welche Worktrees einen Stack laufen haben, `docker ps` die belegten Ports. Meldet Docker "port is already allocated", den nächsten Slot nehmen.
3. Im Worktree Datenbank, API und OIDC-Mock starten. Der Befehl ist fertig, wenn er mit Exit-Code 0 endet. Der erste Start kompiliert die API und befüllt die Datenbank, das dauert bis zu etwa 10 Minuten, spätere Starts etwa eine Minute.
4. In einem zweiten Terminal, mit demselben `BDMS_SLOT`, den Client starten. Die Applikation ist danach unter `http://localhost:3<slot>00` erreichbar (Login wie oben, `admin` / `swissforages`). Ist der Port belegt, bricht Vite ab, statt auf einen anderen Port auszuweichen, auf dem der Login nicht funktionieren würde.
5. Cypress Tests mit demselben `BDMS_SLOT` starten. Sie verwenden automatisch den Client und den OIDC-Mock des Slots.
6. Zum Schluss den Client beenden und den Stack herunterfahren.

PowerShell:

```powershell
$env:BDMS_SLOT = "1"
docker compose -f docker-compose.yml -f docker-compose.worktree.yml up -d --build --wait
# In einem zweiten Terminal, ebenfalls mit $env:BDMS_SLOT = "1"
npm --prefix src/client run start
# Im ersten Terminal
npm --prefix src/client run test -- --spec cypress/e2e/detailPage/attachments.cy.ts
docker compose -f docker-compose.yml -f docker-compose.worktree.yml down
```

Bash:

```bash
export BDMS_SLOT=1
docker compose -f docker-compose.yml -f docker-compose.worktree.yml up -d --build --wait
# In einem zweiten Terminal, ebenfalls mit export BDMS_SLOT=1
npm --prefix src/client run start
# Im ersten Terminal
npm --prefix src/client run test -- --spec cypress/e2e/detailPage/attachments.cy.ts
docker compose -f docker-compose.yml -f docker-compose.worktree.yml down
```

`down` behält Datenbank und Build-Ausgabe der API, der nächste Start ist schnell. `down -v` löscht beide, der nächste Start kompiliert und befüllt wieder von Grund auf. Das ist nötig, wenn die Datenbank des Slots einen veralteten Stand hat, etwa nach einem Wechsel auf einen Branch mit anderen Migrationen oder Seed-Daten.

**Empfehlungen**

- Ein Slot pro Worktree, und den Slot für die Lebensdauer des Worktrees beibehalten. So bleibt die Datenbank des Slots erhalten und Starts bleiben schnell.
- Den Stack herunterfahren, wenn der Worktree nicht mehr gebraucht wird. Jeder Slot braucht eine eigene Datenbank und einen eigenen API-Container, das kostet Arbeitsspeicher.
- Vor dem Entfernen eines Worktrees `down -v` ausführen, sonst bleibt das Datenbank-Volume des Slots in Docker zurück.

## Vitest Unit Tests

Die client seitigen Unit Tests werden mit [Vitest](https://vitest.dev/) ausgeführt. Testdateien folgen dem Muster `*.test.ts` / `*.test.tsx`.
Die Tests können mit folgenden Befehlen ausgeführt werden:

| Befehl | Beschreibung |
| :----- | :----------- |
| `npm run test:unit` | Einmaliger Testlauf aller Unit Tests |
| `npm run test:unit:watch` | Startet Vitest im Watch-Modus für die Entwicklung |

Um einen einzelnen Test auszuführen, kann `npx vitest run <Pfad/zur/Testdatei>` verwendet werden.


## Cypress Tests

Die Cypress Tests können mit `npm run cy` oder `npm run test` gestartet werden. Sie werden zudem automatisch in der CI/CD Pipeline ausgeführt. Das Projekt ist mit [Cypress Cloud](https://cloud.cypress.io/) konfiguriert, wodurch unter anderem die parallele Ausführung der End-to-End (E2E) Tests ermöglicht wird. Testergebnisse und Aufzeichnungen sind ebenfalls direkt in [Cypress Cloud](https://currents.dev/) einsehbar, was die Identifikation und Behebung möglicher Fehler und Probleme erleichtert. Um die detaillierten Testergebnisse einzusehen und die E2E-Tests des Projekts zu debuggen, kann die [Cypress Dashboard-Seite](https://cloud.cypress.io/projects/gv8yue/runs) besucht werden.

Um Cypress Tests in einem Git-Worktree gegen dessen eigenen Branch laufen zu lassen, während ein anderer Worktree oder der Hauptcheckout ebenfalls läuft, siehe [Mehrere Worktrees parallel (Slots)](#mehrere-worktrees-parallel-slots).

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

### Anonymer Modus (read-only)

Die Applikation kann auch im anonymen Modus betrieben werden, um die Bohrdaten öffentlich zugänglich zu machen. In diesem Modus ist die Applikation nur im read-only Modus verfügbar. Die Konfiguration erfolgt über OIDC-Konfiguration (siehe oben). Die Applikation wird im anonymen Modus gestartet, wenn `Auth:AnonymousModeEnabled` auf `true` gesetzt ist.

## Release- und Deployment-Prozess

| Umgebung | Auslöser | Quelle der App-Version |
| --- | --- | --- |
| DEV | Merge in `main` (automatisch) | Version aus dem Publish-Lauf |
| INT | Release als **Pre-release** markieren, die erstellte PR mergen, _Deploy Int_ starten | `environments/int/version.values.yaml` |
| PROD | Release als **Latest** markieren, die erstellte PR mergen, Helm Chart Action abwarten, _Deploy Prod_ starten | `app.version` in `charts/*/values.yaml` |

### Publish und DEV

Jede Änderung, die in den `main`-Branch gemerged wird, löst automatisch den
[Publish-Workflow](./.github/workflows/publish.yml) aus. Dieser vergibt eine neue Versionsnummer, baut die Docker-Images mit derselben Version, taggt sie zusätzlich mit `:edge`, erstellt ein neues GitHub-Release und deployt die Version auf DEV.

Das Release wird bewusst weder als **Pre-release** noch als **Latest** markiert. Diese beiden Promotions sind die Auslöser für die weiteren Umgebungen (siehe unten).

### INT-Deployment

1. Im GitHub [Release-Bereich](https://github.com/swisstopo/swissgeol-boreholes-suite/releases) das Release öffnen und als **„Set as a pre-release"** markieren.
2. Der Workflow [Bump INT version](./.github/workflows/bump-int.yml) erstellt einen PR. Dieser setzt `app.version` in `environments/int/version.values.yaml` auf die neue Version.
3. Den PR reviewen und mergen.
4. Den Workflow [Deploy Int](./.github/workflows/deploy-int.yml) manuell starten.

Alle INT-Releases (App, extern-sync, view-sync) lesen die Version aus `version.values.yaml`. So laufen sie immer mit derselben Version.

Wenn kein PR entsteht, den Workflow _Bump INT version_ manuell mit der Version starten (z.B. `2.2.50`).

### PROD-Release

1. Im GitHub Release-Bereich das Release als **„Set as the latest release"** markieren.
2. Der Workflow [Release](./.github/workflows/release.yml) startet automatisch. Er:
   - taggt die Docker-Images zusätzlich mit `:latest` und `:v<major>`.
   - übernimmt den Eintrag aus `CHANGELOG.md` in die Release Notes.
   - erstellt einen PR _Mark version … as released_. Dieser aktualisiert `CHANGELOG.md`, `app.version` und die Chart-Versionen in `charts/*/`.
3. Den PR reviewen und mergen. Der Workflow [Release Helm Charts](./.github/workflows/charts-release.yml) publiziert danach die neuen Charts.
4. Warten, bis _Release Helm Charts_ erfolgreich ist. Sonst deployt der nächste Schritt das alte Chart.
5. Den Workflow [Deploy Prod](./.github/workflows/deploy-prod.yml) manuell starten. Ohne Angabe nimmt er die neueste Chart-Version.

### Hotfix-Release erstellen

Ein Hotfix-Release wird erstellt, indem vom letzten Release-Git-Tag ein neuer Branch angelegt wird. Dort werden die nötigen Korrekturen gemacht und anschliessend manuell ein neues GitHub [Release](https://github.com/swisstopo/swissgeol-boreholes-suite/releases) erstellt, das dann wiederum als **„Set as the latest release"** markiert werden kann.

### Docker-Image-Tags

| Tag | Beschreibung |
| --- | ----------- |
| `:edge` | Neuester Stand aus `main` (letzter Publish-Lauf) |
| `:v<version>` | Bestimmte Version, z.B. `:v2.1.1427` |
| `:v<major>` | Stabile Major-Version, z.B. `:v2` (wird beim PROD-Release aktualisiert) |
| `:latest` | Aktuelle produktive Version (PROD-Release) |

### Helm Chart Versionen

`app.version` in `charts/*/values.yaml` ist die Version für PROD. Der PROD-Release-PR aktualisiert sie (siehe oben).

Für `dataextraction.version` und `ocr.version` den Workflow [Bump service version](./.github/workflows/bump-service.yml) manuell starten. Er erstellt einen PR, der die Version in `charts/swissgeol-boreholes/values.yaml` und `docker-compose.yml` setzt.

## Developer best practices

#### UI/UX

- Das UI-Design ist in [Figma](https://www.figma.com/design/cEiOoOazAQZqpRY92ZhBeO/SwissGeol?node-id=7390-40928&t=DemUCUzYlysJ5lB4-0) definiert. Unter Pages/Screens sind die definitiven Designs zu finden.
- Standardmässig werden die [Lucid Icons](https://lucide.dev/icons/) verwendet. Custom-Icons können aus [Figma](https://www.figma.com/design/cEiOoOazAQZqpRY92ZhBeO/SwissGeol?node-id=7390-40928&t=DemUCUzYlysJ5lB4-0) kopiert und als SVG eingebunden werden. Um die Icons farblich stylen zu können, müssen `fill` und `stroke` wie folgt angepasst werden `fill="currentColor" stroke="currentColor"`.
- Wo möglich sollten UI-Komponenten der [swissgeol-ui-core](https://github.com/swisstopo/swissgeol-ui-core) und [swissgeol-ui-core-react](https://github.com/swisstopo/swissgeol-ui-core/pkgs/npm/swissgeol-ui-core-react) Libraries verwendet werden.
- Sind keine Komponenten in den Swissgeol UI Libraries vorhanden, muss geklärt werden, ob die Komponente in der Swissgeol UI Library ergänzt werden soll. Je nach Entscheid wird die neue Komponente entwickelt oder [MUI](https://mui.com/) als UI Library verwendet. Allgemeine Styles werden im [AppTheme.ts](./src/client/src/AppTheme.ts) definiert und diese Styles werden, wo immer möglich, verwendet. [MUI Styled Components](https://mui.com/system/styled/) im gleichen File mit der Komponente definieren, sobald die Styles mehrfach gebraucht werden. Übergreifende Styled Components werden in [styledComponents.ts](./src/client/src/components/styledComponents.ts) definiert. Für Abstände (margins, paddings, gaps etc.) sollten möglichst [MUI Spacings](https://mui.com/system/spacing/) verwendet werden.

#### Typescript

- Neue Komponenten werden in Typescript geschrieben.
- Es werden bevorzugt Interfaces statt Types verwendet.
- **API-Typen werden aus der OpenAPI-Spezifikation generiert** (siehe Abschnitt [OpenAPI Codegen](#openapi-codegen) unten). Das generierte File [`types.gen.ts`](./src/client/src/api/generated/types.gen.ts) darf **nicht manuell bearbeitet** werden.
- Verbleibende hand-geschriebene Interfaces für API Calls werden in den entsprechenden domänenspezifischen Files (z.B. `stratigraphy.ts`) definiert oder – für das Legacy API – in [ReduxStateInterfaces.ts](./src/client/src/api-lib/ReduxStateInterfaces.ts).
- Existieren mehrere Interfaces für eine Komponente, werden sie in einem separaten File neben der Komponente abgelegt.
- Das Interface für die React props der Komponente kann im selben File mit der Komponente definiert werden.

#### Translation

- Texte werden mit dem `useTranslation` hook von `react-i18next` übersetzt. Das `withTranslation HOC` wird nicht mehr verwendet.
- Neue Übersetzungskeys alphabetisch sortiert und in CamelCase in den `common.json` Files unter [public/locale](./src/client/public/locale) erfassen.

#### API

- Neue Endpoints werden immer im .NET API erstellt. Das Python Legacy API wird nicht erweitert.
- Redux wird nicht mehr erweitert. Datenabfragen werden mit dem Javascript [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) (siehe [fetchApiV2.ts](src/client/src/api/fetchApiV2.ts)) oder wo sinnvoll mit `useQuery` von `tanstack-query` gemacht.
- Wenn Abfragen aus dem Redux Store in neuen Komponenten gebraucht werden, sollten die React hooks `useSelector` und `useDispatch` verwendet werden.

#### OpenAPI Codegen

Die TypeScript-Typen für das .NET REST API v2 werden automatisch aus der OpenAPI-Spezifikation generiert.

**Workflow bei API-Änderungen:**

1. .NET API lokal starten (z.B. via `docker-compose up` oder Visual Studio)
2. OpenAPI-Spec aktualisieren und Typen neu generieren:
   ```bash
   cd src/client
   npm run openapi        # holt swagger.json vom laufenden Server und generiert types.gen.ts
   # oder einzeln:
   npm run openapi:fetch  # nur swagger.json aktualisieren
   npm run openapi:gen    # nur Typen aus bestehendem swagger.json generieren
   ```
3. Generiertes File [`src/client/src/api/generated/types.gen.ts`](./src/client/src/api/generated/types.gen.ts) via Git committen.

**Konfiguration:** [`src/client/openapi-ts.config.ts`](./src/client/openapi-ts.config.ts)

> ⚠️ `types.gen.ts` wird durch das Tool überschrieben – nie manuell bearbeiten.

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

## Helm Charts

Die Helm Charts für das Deployment der Applikation befinden sich im Ordner [`charts/`](./charts/). Weitere Informationen zur Installation und Konfiguration finden sich in den jeweiligen Chart READMEs:

- [swissgeol-boreholes](./charts/swissgeol-boreholes/README.md)
- [swissgeol-boreholes-view-sync](./charts/swissgeol-boreholes-view-sync/README.md)
- [swissgeol-boreholes-extern-sync](./charts/swissgeol-boreholes-extern-sync/README.md)
