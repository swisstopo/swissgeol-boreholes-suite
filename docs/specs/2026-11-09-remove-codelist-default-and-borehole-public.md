# Spec: Entfernen von codelist.default und borehole.public

Nov 9, 2026 · @Mira

## Ausgangslage

Die Columns `bdms.codelist.default` und `bdms.borehole.public` sollen mit einer EF Core Migration gedroppt werden, weil kein aktiver Code sie mehr liest.

| Issue | Column | C# Property | Herkunft |
| --- | --- | --- | --- |
| [#2952](https://github.com/swisstopo/swissgeol-boreholes-suite/issues/2952) | `codelist.default` | `Codelist.IsDefault` | Lookup-Flag für eine `layer_kind` Row (Legacy v1 API, alter Lithology Import). Die `layer_kind` Codelist ist seit Migration `20260504085246` gelöscht. |
| [#2953](https://github.com/swisstopo/swissgeol-boreholes-suite/issues/2953) | `borehole.public` | `Borehole.IsPublic` | Legacy aus swissforage. Meist `NULL`, 7185 Rows `false`, neue Boreholes bekommen `NULL`. |

## Usage-Analyse

Keines der beiden Felder steuert Business-Logik. Geprüft mit `git grep` über `src/api`, `src/client`, `src/extern-sync`, `src/view-sync`, `tests` und `charts` (ohne `Migrations`).

**`Codelist.IsDefault`** kam nur noch vor in:

- dem Model `Codelist.cs`
- einem Assert in `CodeListControllerTest`
- `swagger.json` und `types.gen.ts` (generiert, im Client nie gelesen)

**`Borehole.IsPublic`** wurde nur durchgereicht, nie ausgewertet:

- CSV Import: optionales Mapping in `CsvImportBoreholeMap`
- CSV/JSON Export: via `[IncludeInExport]`
- `FilterResponse` / `FilterService`: Projection, im Client als `BoreholeListItem.isPublic` typisiert, aber nirgends gelesen
- Seed-Daten in `BdmsContextExtensions` (Bogus Rule ohne Random-Aufruf)

**Ausgeschlossen:**

- `view-sync` (`04_delete_from_borehole.sql`) filtert nur `public` auf `profile`, `photo`, `document` und `log_file`, nicht auf `borehole`.
- `extern-sync` referenziert die Properties nicht.
- Die einzige DB View auf `borehole` (`completness`) wurde 2023 gedroppt (`20231211124901_RemoveCompletnessView`).
- Die Legacy Python API existiert nicht mehr.
- Alle anderen `public` Treffer im Client sind das Attachment-Flag (Profile, Photo, Document, LogFile). Das bleibt unverändert.

## Geplante Änderungen

Eine neue Migration droppt beide Columns, alles andere entfernt nur die Durchreichung.

| Bereich | Datei(en) | Änderung |
| --- | --- | --- |
| Migration | neue Migration `RemoveCodelistDefaultAndBoreholePublic` + `.Designer.cs`, `BdmsContextModelSnapshot.cs` | `DropColumn` für `bdms.codelist.default` und `bdms.borehole.public`. `Down()` legt beide als nullable `boolean` wieder an. Generieren mit `dotnet ef migrations add`, danach auf file-scoped namespace umstellen wie die übrigen 2026er Migrations. |
| Models | `Codelist.cs`, `Borehole.cs`, `FilterResponse.cs` | Properties `IsDefault` und `IsPublic` entfernen |
| Services / Controller | `FilterService.cs`, `ImportController.cs` | Projection und optionales CSV Mapping entfernen |
| Seed | `BdmsContextExtensions.cs` | Bogus Rule für `IsPublic` entfernen. Sie verbraucht keinen Random-Wert, die übrigen Seed-Daten bleiben identisch. |
| Client | `swagger.json`, `types.gen.ts`, `borehole.ts` | Mit `npm run openapi` neu generieren. `isPublic` aus `BoreholeListItem` entfernen. |
| Tests | `CodeListControllerTest`, `BoreholeControllerTest`, `BoreholeExportControllerTest`, `ImportControllerTest`, `FilterServiceTest` | Asserts und Setup-Zeilen zu den Properties entfernen |
| Changelog | `CHANGELOG.md` | Eintrag in neuer Sektion `### Removed` unter `[Unreleased]` |

## Auswirkungen und Kompatibilität

Sichtbar wird nur, dass der Export kein `IsPublic` mehr enthält. Alte Files lassen sich weiterhin importieren.

- **Export:** CSV und JSON Export haben danach keine `IsPublic` Column bzw. kein `isPublic` Property mehr. Relevant für Integratoren, deshalb der Changelog-Eintrag.
- **JSON Import:** `jsonImportOptions` setzt kein `UnmappedMemberHandling`, unbekannte Properties werden ignoriert. Die Test-Files mit `"isPublic"` (z.B. `json_import_valid.json`) bleiben bewusst unverändert und decken das ab.
- **CSV Import:** CsvHelper ignoriert zusätzliche Header, eine `IsPublic` Column in alten Files stört nicht.
- **API:** `isDefault` fällt aus der Codelist-Response, `isPublic` aus Borehole- und Filter-Response. Kein Client-Code liest sie.
- **Daten:** Die Werte in `borehole.public` (NULL / 7185× `false`) gehen verloren. `Down()` stellt nur die Columns wieder her, nicht die Daten.
- **Init-Scripts:** `db/01-schema.sql` enthält noch `public_bho` und `default_cli`. Das ist das historische Baseline-Schema vor den Migrations und bleibt unverändert.
