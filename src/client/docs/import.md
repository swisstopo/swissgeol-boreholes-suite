# Bohrdaten importieren

Mit der Import-Funktion können geologische Bohrdaten via CSV oder JSON Dateien importiert werden.

## Anleitung CSV-Import

### Schritt 1: CSV-Datei vorbereiten

Zunächst sollte die CSV-Datei den Anforderungen und dem Format entsprechen, wie im Abschnitt [Format und Anforderungen an die CSV-Datei](#format-und-anforderungen-an-die-csv-datei) beschrieben.

### Schritt 2: Navigieren zum Import-Bereich

1. In der Webapplikation anmelden.
2. Unten links auf die Schaltfläche _Importieren_ klicken.

### Schritt 3: Bohrloch CSV-Datei selektieren

1. Schaltfläche _Datei auswählen_ anklicken und die vorbereitete CSV-Datei auswählen.
2. Unter _Arbeitsgruppe_ die Arbeitsgruppe auswählen, in welche die Bohrdaten importiert werden sollen (neue Arbeitsgruppen können nur als "Admin-User" erstellt werden).

### Schritt 4: Dateien hochladen

1. Import-Prozess mit einem Klick auf _Importieren_ starten.
2. Warten, bis der Upload abgeschlossen ist und die Daten in der Anwendung verfügbar sind.

## Format und Anforderungen an die CSV-Datei

Die CSV-Datei muss den folgenden Anforderungen und dem Format entsprechen, damit sie erfolgreich in die Webapplikation importiert werden kann:

- Die Datei muss im CSV-Format vorliegen und als Trennzeichen wird der Strichpunkt (;) verwendet.
- Die Datei muss im UTF-8-Format gespeichert sein.
- Die erste Zeile der CSV-Datei muss die Spaltenüberschriften enthalten.
- Die Spaltenüberschriften müssen den vorgegebenen Feldnamen aus dem Import-Dialog entsprechen.
- Die Werte in den Spalten müssen den erwarteten Datentypen entsprechen (z.B. numerisch für Tiefe, Text für Namen, etc.).


## Bohrloch Datei CSV Format

Die zu importierenden Daten müssen gemäss obigen Anforderungen im CSV-Format vorliegen. Die erste Zeile wird als Spaltentitel/Spaltenname interpretiert, die restlichen Zeilen als Daten.

| Feldname                      | Datentyp       | Pflichtfeld | Beschreibung                                                                          |
| ---------------------------   | -------------- | ----------- | ------------------------------------------------------------------------------------- |
| OriginalName                  | Text           | Ja          | Originalname                                                                          |
| ProjectName                   | Text           | Nein        | Projektname                                                                           |
| Name                          | Text           | Nein        | Name (ohne Personendaten)                                                             |
| RestrictionId                 | ID (Codeliste) | Nein        | Beschränkung                                                                          |
| RestrictionUntil              | Datum          | Nein        | Ablaufdatum der Beschränkung                                                          |
| NationalInterest              | True/False     | Nein        | Nationales Interesse                                                                  |
| LocationX                     | Dezimalzahl    | Ja          | Koordinate Ost in LV95 oder LV03                                                      |
| LocationY                     | Dezimalzahl    | Ja          | Koordinate Nord in LV95 oder LV03                                                     |
| LocationPrecisionId           | ID (Codeliste) | Nein        | +/- Koordinaten [m]                                                                   |
| ElevationZ                    | Dezimalzahl    | Nein        | Terrainhöhe [m ü.M.]                                                                  |
| ElevationPrecisionId          | ID (Codeliste) | Nein        | +/- Terrainhöhe [m]                                                                   |
| ReferenceElevation            | Dezimalzahl    | Nein        | Referenz Ansatzhöhe [m ü.M.]                                                          |
| ReferenceElevationTypeId      | ID (Codeliste) | Nein        | Typ der Referenz Ansatzhöhe                                                           |
| ReferenceElevationPrecisionId | ID (Codeliste) | Nein        | +/- Referenz Ansatzhöhe [m]                                                           |
| HrsId                         | ID (Codeliste) | Nein        | Höhenreferenzsystem                                                                   |
| TypeId                        | ID (Codeliste) | Nein        | Bohrtyp                                                                               |
| PurposeId                     | ID (Codeliste) | Nein        | Bohrzweck                                                                             |
| StatusId                      | ID (Codeliste) | Nein        | Bohrungsstatus                                                                        |
| Remarks                       | Text           | Nein        | Bemerkungen                                                                           |
| TotalDepth                    | Dezimalzahl    | Nein        | Bohrlochlänge [m MD]                                                                  |
| DepthPrecisionId              | ID (Codeliste) | Nein        | +/- Bohrlochlänge [m MD]                                                              |
| TopBedrockFreshMd             | Dezimalzahl    | Nein        | Top Fels (frisch) [m MD]                                                              |
| TopBedrockWeatheredMd         | Dezimalzahl    | Nein        | Top Fels (verwittert) [m MD]                                                          |
| TopBedrockIntersected         | True/False     | Nein        | Top Fels ereicht                                                                      |
| HasGroundwater                | True/False     | Nein        | Grundwasser vorhanden                                                                 |
| LithologyTopBedrockId         | ID (Codeliste) | Nein        | Lithologie Top Fels                                                                   |
| ChronostratigraphyTopBedrockId| ID (Codeliste) | Nein        | Chronostratigraphie Top Fels                                                          |
| LithostratigraphyTopBedrockId | ID (Codeliste) | Nein        | Lithostratigraphie Top Fels                                                           |

### Ids
Es können zusätzliche IDs importiert werden. Die dafür zu verwendenden Spaltenüberschriften sind dynamisch und können von Umgebung zu Umgebung variieren. 
Um die korrekten Spaltenüberschriften zu erhalten, kann eine Bohrung mit einer entsprechenden ID als CSV-Datei exportiert werden.

### Koordinaten

Koordinaten können in LV95 oder LV03 importiert werden, das räumliche Bezugssystem wird aus den Koordinaten erkannt und abgespeichert.

## Validierung

### CSV-Import: Fehlende Werte

Für jeden bereitgestellten Header CSV-Datei muss für jede Zeile ein entsprechender Wert angegeben werden, oder leer gelassen werden.

### Duplikate

Beim Importprozess der Bohrdaten wird eine Duplikatsvalidierung durchgeführt, um sicherzustellen, dass kein Bohrloch mehrmals in der Datei vorhanden ist oder bereits in der Datenbank existiert.
Duplikate werden nur innerhalb einer Arbeitsgruppe erkannt. Die Duplikaterkennung erfolgt anhand der Koordinaten mit einer Toleranz von +/- 2 Metern und der Gesamttiefe des Bohrlochs.


## Anmerkungen

Es ist wichtig zu beachten, dass der Import beim ersten Fehler abgebrochen wird und keine teilweisen Importe stattfinden. Entweder werden alle Daten importiert, oder es findet kein Import statt. Der Import unterstützt keine Updates von bestehenden Daten.


## Anleitung JSON-Import

### Schritt 1: JSON-Datei vorbereiten

Zunächst sollte die JSON-Datei den Anforderungen und dem Format entsprechen, wie im Abschnitt [Format und Anforderungen an die JSON-Datei](#format-und-anforderungen-an-die-json-datei) beschrieben.

### Schritt 2: Navigieren zum Import-Bereich

1. In der Webapplikation anmelden.
2. Unten links auf die Schaltfläche _Importieren_ klicken.

### Schritt 3: Bohrloch JSON-Datei selektieren

1. Schaltfläche _Datei auswählen_ anklicken und die vorbereitete JSON-Datei auswählen.
2. Unter _Arbeitsgruppe_ die Arbeitsgruppe auswählen, in welche die Bohrdaten importiert werden sollen (neue Arbeitsgruppen können nur als "Admin-User" erstellt werden).

### Schritt 4: Dateien hochladen

1. Import-Prozess mit einem Klick auf _Importieren_ starten.
2. Warten, bis der Upload abgeschlossen ist und die Daten in der Anwendung verfügbar sind.

## Format und Anforderungen an die JSON-Datei

Die JSON-Datei muss den folgenden Anforderungen entsprechen, damit sie erfolgreich in die Webapplikation importiert werden kann:

- Die Datei muss im JSON-Format vorliegen.
- Die Datei muss im UTF-8-Format gespeichert sein.
- Die JSON-Datei muss ein Array von Objekten enthalten. Jedes Objekt entspricht einem Bohrloch. Auch ein einzelnes Bohrloch muss als Array von einem Objekt definiert werden.
- Die JSON-Datei eines Bohrlochexports kann als valide Vorlage für den Import betrachtet werden.
- Codelistenschlüssel: [https://boreholes.swissgeol.ch/api/v2/codelist/csv](https://boreholes.swissgeol.ch/api/v2/codelist/csv)

## Anleitung JSON + PDF-Import

Der JSON + PDF-Import ermöglicht es neben den Bohrlochdaten auch zugehörige Anhänge (z.B. Bilder, PDFs) zu importieren. Die Bohrlochdaten müssen in einer im ZIP-Archiv enthaltenen JSON-Datei vorliegen (siehe auch [Format und Anforderungen an die JSON-Datei](#format-und-anforderungen-an-die-json-datei)).
Alle Anhänge im ZIP-Archiv müssen in der JSON-Datei referenziert werden. Mit dem Export-Feature können die Bohrlochdaten und Anhänge in einem ZIP-Archiv exportiert werden, welches die Anforderungen für den Import erfüllt.

## Validierung

### Duplikate

Beim Importprozess der Bohrdaten wird eine Duplikatsvalidierung durchgeführt, um sicherzustellen, dass kein Bohrloch mehrmals in der Datei vorhanden ist oder bereits in der Datenbank existiert.
Duplikate werden nur innerhalb einer Arbeitsgruppe erkannt. Die Duplikaterkennung erfolgt anhand der Koordinaten mit einer Toleranz von +/- 2 Metern und der Gesamttiefe des Bohrlochs.

## Anmerkungen

Es ist wichtig zu beachten, dass der Import beim ersten Fehler abgebrochen wird und keine teilweisen Importe stattfinden. Entweder werden alle Daten importiert, oder es findet kein Import statt. Der Import unterstützt keine Updates von bestehenden Daten.
