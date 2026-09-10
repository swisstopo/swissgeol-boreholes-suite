# Datenbank und Migrationen

PostgreSQL 17 mit PostGIS. Zugriff über EF Core (Npgsql-Provider, NetTopologySuite für Geometrie).

## Setup

`docker-compose up` startet eine lokale Instanz. pgAdmin ist auf [localhost:3001](http://localhost:3001) erreichbar. Init-Skripte werden bei der ersten Erstellung des Volumes einmalig ausgeführt:

| Datei | Zweck |
| :--- | :--- |
| [`db/01-schema.sql`](../../db/01-schema.sql) | Schema-Grundgerüst, Extensions, Rollen. |
| [`db/02-geolcodes.sql`](../../db/02-geolcodes.sql) | Codelisten (Material, Bohrungstyp, ...). |
| [`db/03-data.sql`](../../db/03-data.sql) | Beispieldaten für Development. |

## Migrationen

EF Core, Migrationen liegen in [`src/api/Migrations/`](../../src/api/Migrations/).

- Beim API-Start läuft `context.Database.Migrate()`. Migrationen werden automatisch eingespielt.
- In Development zusätzlich `BdmsContextExtensions.EnsureSeeded` für Testdaten.

### Neue Migration erstellen

> Schema-Änderungen vorher im Team abstimmen, bevor du eine Migration committest. Produktions-DBs sind gross, Migrationen müssen idempotent und schnell sein.

```bash
dotnet ef migrations add MeineMigration --project src/api --startup-project src/api
dotnet ef database update --project src/api --startup-project src/api
```

Prüfe insbesondere die `Down`-Migration. Wer Daten umzieht (`UPDATE ... FROM`), prüft den Plan zusätzlich gegen einen Dump der Produktion.

## Tests gegen die DB

Die Integrationstests in [`tests/api/`](../../tests/api/) starten eine eigene Test-Datenbank via [`BdmsWebApplicationFactory`](../../tests/api/BdmsWebApplicationFactory.cs).

- Jeder Test-Run bekommt eine frische DB mit deterministischen Daten.
- `dotnet test --filter TestCategory!=LongRunning` blendet die langsamen Tests aus.

## PostGIS-Details

- Bohrungsgeometrie steht in `borehole.geometry` als `geometry(Point, 2056)` (LV95).
- Zusätzlich werden `location_x` und `location_y` als `double` gehalten, jeweils mit einem `precision_*`-Feld. Die Maintenance-Tasks `LocationMigrationTask` und `CoordinateMigrationTask` halten die Felder konsistent.
- LV03 wird parallel gepflegt (`location_x_lv03`, `location_y_lv03`).

## Bulk-Loads

CSV-/JSON-Imports laufen über [`ImportController`](../../src/api/Controllers/ImportController.cs). Wer einen neuen Import bauen will, sollte die Logik nicht weiter im Controller anlagern, sondern in einen Service ziehen (siehe [`findings.md`](../architecture/findings.md), Punkt 2).
