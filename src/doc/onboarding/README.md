# Onboarding für neue Engineers

Willkommen im Boreholes Repo. Diese Dokumente führen dich strukturiert in den Code ein. Sie ergänzen die [Projekt-README](../../README.md), die das lokale Setup mit `docker-compose up`, die Ports und die OIDC-Konfiguration behandelt.

## Empfohlene Lesereihenfolge

1. [Domänenmodell](01-domain-model.md): Was eine Bohrung in BDMS überhaupt ist
2. [Architektur](02-architecture.md): Wie Client, .NET API und Legacy-APIs zusammenspielen
3. [Backend](03-backend.md): Aufbau von `src/api/`
4. [Frontend](04-frontend.md): Aufbau von `src/client/src/`
5. [Datenbank und Migrationen](05-database-and-migrations.md): Schema, EF Core, PostGIS
6. [Authentifizierung](09-authentication.md): OIDC, Claims Transformation, Rollen
7. [Tests](06-testing.md): Welcher Test-Layer wofür
8. [Frontend-Workflows](07-frontend-workflows.md): OpenAPI-Client, i18n
9. [Datei-Speicher](08-file-storage.md): MinIO, S3, Buckets

## Weitere nützliche Quellen

- [`CLAUDE.md`](../../CLAUDE.md): Konventionen und Regeln (auch für Menschen lesenswert)
- [`docs/architecture/findings.md`](../architecture/findings.md): Architektur-Review vom 2026-05-08, zeigt aktuell sichtbare Schwachpunkte
- `CHANGELOG.md` im Repo-Root: Was sich pro Release ändert
- `docs/superpowers/`: Specs und Pläne zu konkreten Umbauten

## Wann welches Dokument

| Du willst ... | Lies ... |
| :--- | :--- |
| Verstehen, wovon UI-Komponenten und Entities sprechen | [01-domain-model.md](01-domain-model.md) |
| Wissen, wo dein Request hingeht | [02-architecture.md](02-architecture.md) |
| Einen Endpoint hinzufügen | [03-backend.md](03-backend.md) |
| Eine Seite oder Komponente anpassen | [04-frontend.md](04-frontend.md) |
| Eine DB-Änderung machen | [05-database-and-migrations.md](05-database-and-migrations.md) |
| Auth-Verhalten verändern | [09-authentication.md](09-authentication.md) |
| Wissen, wie wir testen | [06-testing.md](06-testing.md) |
| API-Vertrag ändern und Client typisieren | [07-frontend-workflows.md](07-frontend-workflows.md) |
| Datei-Uploads anfassen | [08-file-storage.md](08-file-storage.md) |
