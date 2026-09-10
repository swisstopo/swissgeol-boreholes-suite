# Domänenmodell

Boreholes verwaltet **Bohrungen** und alles, was an einer Bohrung erhoben wird. Die folgenden Begriffe tauchen in Controllern, Entities und UI-Komponenten überall auf. Ohne diesen Hintergrund liest sich der Code wie Fachjargon.

## Bohrung (Borehole)

Zentrale Entität. Eine Bohrung hat unter anderem:

- Lokation in Schweizer Koordinaten LV95 (Pflicht) und optional LV03
- Höhe (Elevation), Gesamttiefe (TotalDepth), Top Bedrock (frisch und verwittert)
- Zuordnung zu einer Workgroup, Public-Flag, optionale Restriktionen mit Ablaufdatum
- Verknüpfungen zu Stratigraphien, Completions, Sections, Observations, Profilen, Photos, Documents und LogRuns

Quelle: [`src/api/Models/Borehole.cs`](../../src/api/Models/Borehole.cs)

## Stratigraphie

Ein vertikales Profil der Bohrung. Eine Stratigraphie besteht aus mehreren Layern, jeder Layer hat eine Tiefe von / bis.

- **Lithologie**: Beschreibt das Material in einem Layer (Sand, Kies, Tonstein, ...).
- **Lithostratigraphie**: Ordnet das Material in eine benannte geologische Formation ein (z. B. Molasse).
- **Chronostratigraphie**: Datiert das Material relativ zur geologischen Zeit-Skala (Jura, Tertiär, ...).

Im Code spiegelt sich das in `StratigraphyController`, `LithostratigraphyController`, `ChronostratigraphyController` und den entsprechenden Models.

## Completion

Was nach dem Bohren in das Loch eingebaut wird:

- **Casing**: Verrohrung. Schützt die Bohrlochwand vor Einsturz und dichtet ab.
- **Backfill**: Verfüllung. Was zwischen Casing und Bohrlochwand verbleibt (Zement, Bentonit, Filterkies, ...).
- **Instrumentation**: Eingebrachte Messeinrichtungen (Piezometer, Sonden).

Diese drei sind Sub-Resourcen einer Completion, die selbst Sub-Resource einer Bohrung ist.

## Hydrogeologie

Wasserbezogene Beobachtungen, alle als `Observation`-Spezialisierung modelliert:

- **Hydrotest**: Pumpversuche, Schluckversuche, Ergiebigkeitsmessungen
- **GroundwaterLevelMeasurement**: Grundwasserstand
- **FieldMeasurement**: Feldparameter wie Leitfähigkeit, Temperatur, pH

## Codelist

Fast alle Klassifikationen (Bohrungstyp, Status, Material, Reference System, ...) referenzieren eine zentrale `Codelist`. Codelists sind mehrsprachig (DE/EN/FR/IT) und kommen initial aus [`db/02-geolcodes.sql`](../../db/02-geolcodes.sql). Ausgeliefert über `CodeListController`.

## Document, Photo, LogRun

Anhänge an die Bohrung. Die Dateien selbst liegen im S3 / MinIO, die Metadaten in der DB. Siehe [Datei-Speicher](08-file-storage.md).

## Workflow

Jede Bohrung hat einen Workflow-Status (Entwurf, Review, Publiziert, ...), gesteuert vom Workflow-Tab in der Detailseite. Das Workflow-Modell ist das, was den Reife-Grad der Bohrung in BDMS markiert.

## Reference Systems und Koordinaten

Schweiz-spezifisch: Bohrungen werden in **LV95** (EPSG:2056) gespeichert, mit Spiegelung in **LV03** (EPSG:21781) für Altlasten. PostGIS hält die `geometry`-Spalte synchron. Migrations-Tasks (`LocationMigrationTask`, `CoordinateMigrationTask`) sorgen für Konsistenz, wenn ältere Datensätze importiert werden.
