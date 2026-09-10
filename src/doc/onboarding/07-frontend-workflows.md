# Frontend-Workflows

Zwei Routinen, die im ersten Monat immer wieder vorkommen.

## OpenAPI-Client regenerieren

Quelle der Wahrheit für den API-Vertrag ist Swagger / OpenAPI. Der Client benutzt einen generierten, typisierten Wrapper:

- Generator: `@hey-api/openapi-ts`
- Output: [`src/client/src/api/generated/`](../../src/client/src/api/generated/)

Nach **jeder** Backend-Änderung am API-Vertrag:

```bash
# Das API muss lokal laufen (docker-compose up)
cd src/client
npm run openapi
```

Das ist eine Verkettung von zwei npm-Skripten:

1. `openapi:fetch`: Holt das aktuelle `swagger.json` von `http://localhost:5000/swagger/v2/swagger.json`.
2. `openapi:gen`: Regeneriert Types und Service-Klassen.

Wenn du das vergisst, fällt `npm run ts` mit Typ-Konflikten.

## i18n: Texte anpassen oder hinzufügen

- Locale-Dateien: [`src/client/public/locale/{de,en,fr,it}/`](../../src/client/public/locale/)
- Library: `react-i18next`
- Nutzung im Code: `const { t } = useTranslation(); ... t("meinSchluessel")`
- Beim Hinzufügen eines neuen Schlüssels alle vier Sprachen pflegen. Fehlende Übersetzungen rendern einen leeren String.
- Die SwissGeol-Core-Library wird parallel über `i18n.on("languageChanged", ...)` synchronisiert (siehe `handleLanguageChange` in [`App.tsx`](../../src/client/src/App.tsx)).

## Häufige Build-Schritte

| Skript | Zweck |
| :--- | :--- |
| `npm run dev` | Vite-Dev-Server inkl. Proxy auf das API. |
| `npm run build` | Production-Build (typescript + Vite). |
| `npm run lint` | ESLint, bricht bei jeder Warnung ab. |
| `npm run ts` | TypeScript-Check ohne Emit (mit Inkrement-Cache). |
| `npm run test:unit` | Vitest einmalig. |
| `npm run test` | Cypress (headless). |
| `npm run cy` | Cypress (interaktiv). |
| `npm run openapi` | Client-Stubs regenerieren. |

Nach Edits an `.ts` / `.tsx`-Dateien sollte immer `npm run ts` vor dem Commit laufen, sonst können stille Typ-Fehler bis in den Build durchrutschen.
