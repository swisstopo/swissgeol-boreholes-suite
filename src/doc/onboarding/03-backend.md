# Backend: `src/api/`

.NET 8 Web API. StyleCop und CodeAnalysis sind aktiv, der Build bricht bei Warnungen ab. Vor dem Commit also unbedingt `dotnet build BDMS.sln -c Release /warnaserror` laufen lassen.

## Top-Level-Ordner

| Ordner | Inhalt |
| :--- | :--- |
| `Controllers/` | Pro Domäne ein Controller (`BoreholeController`, `StratigraphyController`, ...). Sub-Resourcen erben von `BoreholeControllerBase`. |
| `Models/` | EF-Entities sowie Request- und Response-DTOs (`FilterRequest`, `FilterResponse`, ...). |
| `Services/` | Geschäftslogik. Hier landet Code, der nicht trivialer HTTP-Boilerplate ist. |
| `Authentication/` | JWT-Bearer-Konfiguration, Claims Transformation, Anonymous- und Legacy-API-Middleware. |
| `Migrations/` | EF-Core-Migrationen. Werden beim Start automatisch ausgeführt. |
| `Json/` | Custom-Converter (DateOnly, LTree, GeoJSON via NetTopologySuite). |
| `Maintenance/` | Einmalige Datenkorrektur-Tasks. |

## Konventionen

- **Controller bleiben dünn.** HTTP rein, Service raus. Negativ-Beispiel: [`ImportController`](../../src/api/Controllers/ImportController.cs). Neue Features bitte nicht in diesem Stil.
- **Services per Konstruktor injizieren.** Registrierung in [`Program.cs`](../../src/api/Program.cs). `DbContext` und Per-Request-Services sind `Scoped`, das ist Pflicht.
- **`BoreholeControllerBase`** kapselt das Berechtigungs-Lookup und die Standard-Operationen für Sub-Resourcen. Jeder Sub-Resource-Controller (z. B. `CasingController`) erbt davon und liefert `GetBoreholeId`.
- **Berechtigungen** laufen über [`IBoreholePermissionService`](../../src/api/Services/IBoreholePermissionService.cs), nicht im Controller.
- **`[Authorize(Policy = PolicyNames.Viewer)]`** explizit setzen, wenn ein Endpoint auch für Viewer erreichbar sein soll. Default ist `Admin`.

## EF Core Spezialitäten

- **PostGIS**: Geometrien als `NetTopologySuite.Geometries.Point`. Spaltentyp `geometry`.
- **LTree**: Hierarchische Codelist-Pfade.
- **Eager Loading**: `BdmsContextExtensions.BoreholesWithIncludes` lädt rund 60 Navigations auf einmal. Bei Listen-Endpunkten Vorsicht: das ist teuer.
- **Migrationen** laufen in `Program.cs` mit `context.Database.Migrate()` beim Start. In Development wird zusätzlich `EnsureSeeded` aufgerufen.

## Neuen Endpoint hinzufügen

1. Modell oder DTO in `Models/`.
2. Falls es eine Sub-Resource einer Bohrung ist: Controller von `BoreholeControllerBase<T>` ableiten.
3. Logik in einen vorhandenen oder neuen Service in `Services/`.
4. Service in `Program.cs` registrieren (`AddScoped`).
5. Test in `tests/api/Controllers/` schreiben (`BdmsWebApplicationFactory` zieht eine echte DB hoch).
6. Auf dem Client `npm run openapi` ausführen, damit der typisierte Client mitwächst (siehe [07-frontend-workflows.md](07-frontend-workflows.md)).

## Querverweise

- Verwendung des Reverse Proxys: [02-architecture.md](02-architecture.md)
- Datenbank und Migrations-Workflow: [05-database-and-migrations.md](05-database-and-migrations.md)
- File Storage über Services: [08-file-storage.md](08-file-storage.md)
