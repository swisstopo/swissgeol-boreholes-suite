[![.github/workflows/ci.yml](https://github.com/geoadmin/suite-bdms/actions/workflows/ci.yml/badge.svg)](https://github.com/geoadmin/suite-bdms/actions/workflows/ci.yml) [![Release](https://github.com/geoadmin/suite-bdms/actions/workflows/release.yml/badge.svg)](https://github.com/geoadmin/suite-bdms/actions/workflows/release.yml) [![Latest Release](https://img.shields.io/github/v/release/geoadmin/suite-bdms)](https://github.com/geoadmin/suite-bdms/releases/latest) [![License](https://img.shields.io/github/license/geoadmin/suite-bdms)](https://github.com/geoadmin/suite-bdms/blob/main/LICENSE)

# Bohrdatenmanagementsystem (BDMS)

Webapplikation zur einfachen strukturierten Erfassung von geologischen Bohrdaten. Mit dem BDMS können Bohrdaten von überall, ohne Lizenzen und Plattform-unabhängig erfasst, harmonisiert und für die eigene Nutzung exportiert werden.

## Einrichten der Entwicklungsumgebung

Folgende Komponenten müssen auf dem Entwicklungsrechner installiert sein:

✔️ Git  
✔️ Docker  
✔️ Visual Studio Code mit der Erweiterung "Remote – Containers"  
✔️ Optional, um die Onlinehilfe zu erstellen: [MkDocs](https://www.mkdocs.org/)

Damit auf dem Entwicklungsrechner keine Frameworks (Python, .NET, Node) installiert werden müssen, kann die vorkonfigurierte containerbasierte Entwicklungsumgebung mit Visual Studio Code verwendet werden. Dazu einfach das Source-Code Repository klonen und im Visual Studio Code laden. Wenn die Erweiterung "Remote – Containers" installiert ist, wird unten rechts in einer Notification dazu aufgefordert das Projekt im Container neu zu laden (Reload in Container). Das erstmalige Starten dauert etwas länger, da die Container erstellt werden müssen und die Umgebung mit den erforderlichen Extensions konfiguriert wird. Anschliessend kann die Webanwendung mit _F5_ gestartet werden.

Falls doch lokal gearbeitet werden soll, kann [nvm](https://github.com/coreybutler/nvm-windows/releases) installiert werden, um die Node Version zu verwalten. Anschliessend kann mit `nvm use` die im Projekt verwendete Node Version aktiviert werden. Aktuell verwenden wir Node 20.

**Folgende Dienste/Anwendungen sind anschliessend wie folgt verfügbar**

| 🔖Dienst/Anwendung                                                                                                                                                                                | 🔗Adresse                                                                                      | 🧞Benutzername  | 🔐Passwort                       |
| :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :--------------------------------------------------------------------------------------------- | :-------------- | :------------------------------- |
| Boreholes of Switzerland                                                                                                                                                                          | [localhost:3000](http://localhost:3000/)                                                       | `admin`         | `swissforages`                   |
| pgAdmin&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | [localhost:3001](http://localhost:3001/)                                                       | n/a             | n/a                              |
| Tornado REST API (`v1`)[^1]                                                                                                                                                                       | [localhost:8888](http://localhost:8888/) [localhost:3000/api/v1](http://localhost:3000/api/v1) | `Authorization` | `Basic YWRtaW46c3dpc3Nmb3JhZ2Vz` |
| .NET REST API (`v2`)                                                                                                                                                                              | [localhost:5000](http://localhost:5000/) [localhost:3000/api/v2](http://localhost:3000/api/v2) | n/a             | n/a                              |

[^1]: Authentifizierung via `Authorization` Header und Basic Authentication, Benutzername und Passwort im Base64 Format

**Features (was funktioniert und was noch nicht)**

🚀Hot Reload bei Änderungen im JavaScript Code der React Web-Applikation  
🚀Hot Reload bei Änderungen im Python Code der Tornado REST API (`v1`)  
🚀Hot Reload bei Änderungen im C# Code der .NET REST API (`v2`)

❌Der Debug Output der Tornado REST API ist aktuell in VSCode nicht sichtbar. Bitte vorerst den Container Log benutzen `docker-compose logs api --follow`

## Cypress Tests

Die Cypress Tests können mit `npm run cy` oder `npm run test` gestartet werden. Sie werden zudem automatisch in der CI/CD Pipeline ausgeführt. Das Projekt ist mit [Cypress Cloud](https://cloud.cypress.io/) konfiguriert, wodurch unter anderem die parallele Ausführung der End-to-End (E2E) Tests ermöglicht wird. Testergebnisse und Aufzeichnungen sind ebenfalls direkt in [Cypress Cloud](https://currents.dev/) einsehbar, was die Identifikation und Behebung möglicher Fehler und Probleme erleichtert. Um die detaillierten Testergebnisse einzusehen und die E2E-Tests des Projekts zu debuggen, kann die [Cypress Dashboard-Seite](https://cloud.cypress.io/projects/gv8yue/runs) besucht werden.
