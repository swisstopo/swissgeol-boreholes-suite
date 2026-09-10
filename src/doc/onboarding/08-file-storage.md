# Datei-Speicher

Bohrungs-Anhänge (PDFs, Bilder, Log-Files) liegen ausserhalb der Datenbank. Die DB hält nur die Metadaten.

## Backend-Setup

- Lokal: **MinIO** (S3-kompatibel), startet via `docker-compose up`.
- Produktion: **AWS S3**. Credentials werden entweder aus den Settings (`S3:ACCESS_KEY` / `SECRET_KEY`) oder über `InstanceProfileAWSCredentials` (IAM Role) bezogen.
- Konfiguration in [`Program.cs`](../../src/api/Program.cs) unter dem `S3:`-Block. Wenn keine Endpoint-URL gesetzt ist (z. B. im anonymen Modus), wird gar kein S3-Client erzeugt.

## Buckets

| Bucket | Inhalt |
| :--- | :--- |
| `cannonflea` | Bohrungs-Dokumente (PDFs, ...). |
| `cannonflea-photos` | Fotos pro Bohrung. |
| `cannonflea-logfiles` | Bohrloch-Log-Files. |

## Services

| Service | Datei |
| :--- | :--- |
| `ProfileCloudService` | [`Services/ProfileCloudService.cs`](../../src/api/Services/ProfileCloudService.cs) |
| `PhotoCloudService` | [`Services/PhotoCloudService.cs`](../../src/api/Services/PhotoCloudService.cs) |
| `LogFileCloudService` | [`Services/LogFileCloudService.cs`](../../src/api/Services/LogFileCloudService.cs) |
| Gemeinsame Basis | [`Services/CloudServiceBase.cs`](../../src/api/Services/CloudServiceBase.cs) |

Controller delegieren Upload und Download an diese Services, nicht direkt an `IAmazonS3`. Wer einen neuen Datei-Typ einführt, schreibt einen neuen Service in der gleichen Art.

## Health-Check

Die S3-Verbindung wird unter `/health` mitgeprüft (`S3HealthCheck`). Wenn `/health` rot wird, ist meistens entweder die DB oder S3 weg.

## OCR-Pipeline

Hochgeladene PDFs werden vom `FileOcrBackgroundService` an eine externe OCR-API geschickt (Konfiguration unter `ReverseProxy:Clusters:ocrApi`). Der Status pro Datei wird in der DB gepflegt, damit der Client den Fortschritt anzeigen kann.

## Streaming-Verhalten

Downloads gehen direkt aus S3 / MinIO ans HTTP-Response-Stream, ohne dass das API die Datei lokal puffert. Bei grossen Files daher keine `MemoryStream`-Konstrukte einführen.
