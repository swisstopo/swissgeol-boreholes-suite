# Bohrdaten importieren

Mit der Import-Funktion können geologische Bohrdaten aus einer CSV-Datei importiert werden.

## Anleitung

### Schritt 1: CSV-Datei vorbereiten

Zunächst sollte die CSV-Datei den Anforderungen und dem Format entsprechen, wie im Abschnitt [Format und Anforderungen an die CSV-Datei](#format-und-anforderungen-an-die-csv-datei) beschrieben.

### Schritt 2: Navigieren zum Import-Bereich

1. In der Webapplikation anmelden.
2. Unten links auf die Schaltfläche _Importieren_ klicken.

### Schritt 3: Bohrloch CSV-Datei selektieren

1. Schaltfläche _Datei auswählen_ anklicken und die vorbereitete CSV-Datei auswählen.
2. Unter _Arbeitsgruppe_ die Arbeitsgruppe auswählen, in welche die Bohrdaten importiert werden sollen (neue Arbeitsgruppen können nur als "Admin-User" erstellt werden).

### Schritt 4: Bohrlochanhänge selektieren (optional)

1. Schaltfläche _Dateien hier ablegen oder klicken, um sie hochzuladen_ anklicken und die vorbereitete Datei(en) auswählen.

### Schritt 5: Lithologie CSV-Datei selektieren (optional)

1. Schaltfläche _Dateien hier ablegen oder klicken, um sie hochzuladen_ anklicken und die vorbereitete Lithologie CSV-Datei auswählen.

### Schritt 6: Dateien hochladen

1. Import-Prozess mit einem Klick auf _Importieren_ starten.
2. Warten, bis der Upload abgeschlossen ist und die Daten in der Anwendung verfügbar sind.

## Format und Anforderungen an die CSV-Dateien

Die CSV-Datei muss den folgenden Anforderungen und dem Format entsprechen, damit sie erfolgreich in die Webapplikation importiert werden kann:

- Die Datei muss im CSV-Format vorliegen und als Trennzeichen wird der Strichpunkt (;) verwendet.
- Die Datei muss im UTF-8-Format gespeichert sein.
- Die erste Zeile der CSV-Datei muss die Spaltenüberschriften enthalten.
- Die Spaltenüberschriften müssen den vorgegebenen Feldnamen aus dem Import-Dialog entsprechen.
- Die Werte in den Spalten müssen den erwarteten Datentypen entsprechen (z.B. numerisch für Tiefe, Text für Namen, etc.).

## Format und Anforderungen an die Dateien der Bohrlochanhänge

Die Anhangsdatei muss den folgenden Anforderungen entsprechen, damit sie erfolgreich in die Webapplikation importiert werden kann:

- Die Datei darf maximal 200 MB gross sein.
- Der Dateiname darf keine Leerzeichen enthalten.

## Bohrloch Datei Format

Die zu importierenden Daten müssen gemäss obigen Anforderungen im CSV-Format vorliegen. Die erste Zeile wird als Spaltentitel/Spaltenname interpretiert, die restlichen Zeilen als Daten.

| Feldname                    | Datentyp       | Pflichtfeld | Beschreibung                                                                          |
| --------------------------- | -------------- | ----------- | ------------------------------------------------------------------------------------- |
| import_id                   | Zahl           | Ja          | Zufällig gewählte Zahl. Wird nicht gepeichert. Muss in der Datei einzigartig sein     |
| id_geodin_shortname         | Zahl           | Nein        | ID GeODin-Shortname                                                                   |
| id_info_geol                | Zahl           | Nein        | ID InfoGeol                                                                           |
| id_original                 | Zahl           | Nein        | ID Original                                                                           |
| id_canton                   | Zahl           | Nein        | ID Kanton                                                                             |
| id_geo_quat                 | Zahl           | Nein        | ID GeoQuat                                                                            |
| id_geo_mol                  | Zahl           | Nein        | ID GeoMol                                                                             |
| id_geo_therm                | Zahl           | Nein        | ID GeoTherm                                                                           |
| id_top_fels                 | Zahl           | Nein        | ID TopFels                                                                            |
| id_geodin                   | Zahl           | Nein        | ID GeODin                                                                             |
| id_kernlager                | Zahl           | Nein        | ID Kernlager                                                                          |
| original_name               | Text           | Ja          | Originalname                                                                          |
| project_name                | Text           | Nein        | Projektname                                                                           |
| name                        | Text           | Nein        | Name                                                                                  |
| restriction_id              | ID (Codeliste) | Nein        | Beschränkung                                                                          |
| restriction_until           | Datum          | Nein        | Ablaufdatum der Beschränkung                                                          |
| national_interest           | True/False     | Nein        | Nationales Interesse                                                                  |
| location_x                  | Dezimalzahl    | Ja          | Koordinate Ost LV95                                                                   |
| location_y                  | Dezimalzahl    | Ja          | Koordinate Nord LV95                                                                  |
| location_precision_id       | ID (Codeliste) | Nein        | +/- Koordinaten [m]                                                                   |
| elevation_z                 | Dezimalzahl    | Nein        | Terrainhöhe [m ü.M.]                                                                  |
| elevation_precision_id      | ID (Codeliste) | Nein        | +/- Terrainhöhe [m]                                                                   |
| reference_elevation         | Dezimalzahl    | Nein        | Referenz Ansatzhöhe [m ü.M.]                                                          |
| reference_elevation_type_id | ID (Codeliste) | Nein        | Typ der Referenz Ansatzhöhe                                                           |
| qt_reference_elevation_id   | ID (Codeliste) | Nein        | +/- Referenz Ansatzhöhe [m]                                                           |
| hrs_id                      | ID (Codeliste) | Nein        | Höhenreferenzsystem                                                                   |
| type_id                     | ID (Codeliste) | Nein        | Bohrtyp                                                                               |
| purpose_id                  | ID (Codeliste) | Nein        | Bohrzweck                                                                             |
| status_id                   | ID (Codeliste) | Nein        | Bohrungsstatus                                                                        |
| remarks                     | Text           | Nein        | Bemerkungen                                                                           |
| total_depth                 | Dezimalzahl    | Nein        | Bohrlochlänge [m MD]                                                                  |
| qt_depth_id                 | ID (Codeliste) | Nein        | +/- Bohrlochlänge [m MD]                                                              |
| top_bedrock_fresh_md        | Dezimalzahl    | Nein        | Top Fels (frisch) [m MD]                                                              |
| top_bedrock_weathered_md    | Dezimalzahl    | Nein        | Top Fels (verwittert) [m MD]                                                          |
| has_groundwater             | True/False     | Nein        | Grundwasser                                                                           |
| lithology_top_bedrock_id    | ID (Codeliste) | Nein        | Lithologie Top Fels                                                                   |
| chronostratigraphy_id       | ID (Codeliste) | Nein        | Chronostratigraphie Top Fels                                                          |
| lithostratigraphy_id        | ID (Codeliste) | Nein        | Lithostratigraphie Top Fels                                                           |
| attachments                 | Text           | Nein        | Kommaseparierte Dateinamen der Anhänge mit Dateiendung z.B. anhang_1.pdf,anhang_2.zip |

## Lithologie Datei Format

Die zu importierenden Daten müssen gemäss obigen Anforderungen im CSV-Format vorliegen. Die erste Zeile wird als Spaltentitel/Spaltenname interpretiert, die restlichen Zeilen als Daten.

| Feldname                 | Datentyp       | Pflichtfeld | Beschreibung                                                                                                  |
| ------------------------ | -------------- | ----------- | ------------------------------------------------------------------------------------------------------------- |
| import_id                | Zahl           | Ja          | Zufällig gewählte Zahl. Wird nicht gepeichert. Muss mit einer import_id aus der Bohrloch Datei übereinstimmen |
| strati_import_id         | Zahl           | Ja          | Zufällig gewählte Zahl. Wird nicht gepeichert. Muss pro Stratigraphie identisch sein                          |
| strati_date              | Datum          | Nein        | Datum der Stratigraphie. Muss pro Stratigraphie identisch sein                                                |
| strati_name              | Text           | Nein        | Name der Stratigraphie. Muss pro Stratigraphie identisch sein                                                 |
| from_depth               | Zahl           | Ja          | Von Tiefe der Schicht                                                                                         |
| to_depth                 | Zahl           | Ja          | Bis Tiefe der Schicht                                                                                         |
| is_last                  | True/False     | Nein        | Ist die Schicht die letzte in der Stratigraphie?                                                              |
| description_quality_id   | ID (Codeliste) | Nein        | Qualität der Beschreibung                                                                                     |
| lithology_id             | ID (Codeliste) | Nein        | Lithologie                                                                                                    |
| original_uscs            | Text           | Nein        | USCS Originalklassifikation                                                                                   |
| uscs_determination_id    | ID (Codeliste) | Nein        | USCS Bestimmungsmethode                                                                                       |
| uscs_1_id                | ID (Codeliste) | Nein        | USCS 1                                                                                                        |
| grain_size_1_id          | ID (Codeliste) | Nein        | Korngrösse 1                                                                                                  |
| uscs_2_id                | ID (Codeliste) | Nein        | USCS 2                                                                                                        |
| grain_size_2_id          | ID (Codeliste) | Nein        | Korngrösse 2                                                                                                  |
| is_striae                | True/False     | Nein        | Striemung                                                                                                     |
| consistance_id           | ID (Codeliste) | Nein        | Konsistenz                                                                                                    |
| plasticity_id            | ID (Codeliste) | Nein        | Plastizität                                                                                                   |
| compactness_id           | ID (Codeliste) | Nein        | Lagerungsdichte                                                                                               |
| cohesion_id              | ID (Codeliste) | Nein        | Kohäsion                                                                                                      |
| humidity_id              | ID (Codeliste) | Nein        | Feuchtigkeit                                                                                                  |
| alteration_id            | ID (Codeliste) | Nein        | Verwitterung                                                                                                  |
| notes                    | Text           | Nein        | Notizen                                                                                                       |
| original_lithology       | Text           | Nein        | Ursprüngliche Lithologie                                                                                      |
| uscs_3_ids               | ID (Codeliste) | Nein        | Kommaseparierte Codeliste IDs der USCS 3                                                                      |
| grain_shape_ids          | ID (Codeliste) | Nein        | Kommaseparierte Codeliste IDs der Korn Formen                                                                 |
| grain_granularity_ids    | ID (Codeliste) | Nein        | Kommaseparierte Codeliste IDs der Kornrundungen                                                               |
| organic_component_ids    | ID (Codeliste) | Nein        | Kommaseparierte Codeliste IDs der Organischen Komponenten                                                     |
| debris_ids               | ID (Codeliste) | Nein        | Kommaseparierte Codeliste IDs der Grobbestandteile                                                            |
| color_ids                | ID (Codeliste) | Nein        | Kommaseparierte Codeliste IDs der Farben                                                                      |
| gradation_id             | ID (Codeliste) | Nein        | Abstufung                                                                                                     |
| lithology_top_bedrock_id | ID (Codeliste) | Nein        | Lithologie Grobbestandteile                                                                                   |

## Validierung

### Fehlende Werte

Für jeden bereitgestellten Header CSV-Datei muss für jede Zeile ein entsprechender Wert angegeben werden, oder leer gelassen werden.

### Duplikate

Beim Importprozess der Bohrdaten wird eine Duplikatsvalidierung durchgeführt, um sicherzustellen, dass kein Bohrloch mehrmals in der Datei vorhanden ist oder bereits in der Datenbank existiert.
Duplikate werden nur innerhalb einer Arbeitsgruppe erkannt. Die Duplikaterkennung erfolgt anhand der Koordinaten mit einer Toleranz von +/- 2 Metern und der Gesamttiefe des Bohrlochs.

### Bohrlochanhänge

Überprüft wird, ob jeder Dateiname in der kommaseparierten Liste in dem _attachments_-Feld in der Liste der Anhänge vorhanden ist.

## Generelles

Es ist wichtig zu beachten, dass der Import beim ersten Fehler abgebrochen wird und keine teilweisen Importe stattfinden. Entweder werden alle Daten importiert, oder es findet kein Import statt. Der Import unterstützt keine Updates von bestehenden Daten.
