[![.github/workflows/ci.yml](https://github.com/geoadmin/suite-bdms/actions/workflows/ci.yml/badge.svg)](https://github.com/geoadmin/suite-bdms/actions/workflows/ci.yml)

# Bohrdatenmanagementsystem (BDMS)

Webapplikation zur einfachen strukturierten Erfassung von geologischen Bohrdaten. Mit dem BDMS können Bohrdaten von überall, ohne Lizenzen und Plattform-unabhängig erfasst, harmonisiert und für die eigene Nutzung exportiert werden.

## Einrichten der Entwicklungsumgebung

Folgende Komponenten müssen auf dem Entwicklungsrechner installiert sein:

✔️ Git  
✔️ Docker  
✔️ Visual Studio Code mit der Erweiterung "Remote – Containers"  

Damit auf dem Entwicklungsrechner keine Frameworks (Python, .NET, Node) installiert werden müssen, kann die vorkonfigurierte containerbasierte Entwicklungsumgebung mit Visual Studio Code verwendet werden. Dazu einfach das Source-Code Repository klonen und im Visual Studio Code laden. Wenn die Erweiterung "Remote – Containers" installiert ist, wird unten rechts in einer Notification dazu aufgefordert das Projekt im Container neu zu laden (Reoload in Container). Das erstmalige Starten dauert etwas länger, da die Container erstellt werden müssen und die Umgebung mit den erforderlichen Extensions konfiguriert wird. Anschliessend kann die Webanwendung mit _F5_ gestartet werden.

**Folgende Dienste/Anwendungen sind anschliessend wie folgt verfügbar**

🔖 http://localhost:3000/ (Boreholes of Switzerland) 🧞 `admin` 🔐 `swissforages`  
🔖 http://localhost:3001/ (pgAdmin) 🧞 `pgadmin@example.com` 🔐 `PEEVEDWATER`  
🔖 http://localhost:3000/api/v1/ (Tornado REST API), Authentifizierung via `Authorization` Header und Basic Authentication, Benutzername und Passwort im Base64 Format `Basic YWRtaW46c3dpc3Nmb3JhZ2Vz`  

**Features (was funktioniert und was noch nicht)**

🚀 Hot Reload bei Änderungen im JavaScript Code der React Web-Applikation  
🚀 Hot Reload bei Änderungen im Python Code der Tornado REST API  
❌ Breakpoints im JavaScript in VSCode funktionieren (noch) nicht. Bitte vorerst die Dev Tools im Chrome benutzen  
❌ Der Debug Output der Tornado REST API ist aktuell in VSCode nicht sichtbar. Bitte vorerst den Container Log benutzen `docker-compose logs api --follow`
