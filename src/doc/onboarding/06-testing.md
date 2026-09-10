# Tests

Drei Test-Layer. Wähle den, der die Aussage mit dem geringsten Aufwand liefert.

## Entscheidungsbaum

```
Reicht ein Unit-Test?               → Vitest
Brauchst du HTTP, DI und DB?        → dotnet test (Integration)
Brauchst du echten End-to-End?      → Cypress
```

## Vitest (Default für Client-Logik)

- Speicherort: `src/client/src/**/*.test.ts(x)`
- Lauf: `npm run test:unit` (einmalig) oder `npm run test:unit:watch`
- Einzelner Test: `npx vitest run <pfad/zur/datei>`
- Schnell und isoliert. Gut für pure Funktionen, Hooks, Mapping, Validierung.

## .NET Integrationstests

- Speicherort: `tests/api/` (Controller-Tests in `tests/api/Controllers/`)
- Lauf: `dotnet test BDMS.sln -c Release --verbosity normal`
- Schneller Pfad: `dotnet test BDMS.sln -c Release --filter TestCategory!=LongRunning`
- Einzelner Test: `dotnet test tests/api/BDMS.Test.csproj --filter "FullyQualifiedName~ClassName"`
- Verwenden [`BdmsWebApplicationFactory`](../../tests/api/BdmsWebApplicationFactory.cs). Das zieht eine echte DB und das ganze DI-Setup hoch.

## Cypress (End-to-End)

- Speicherort: `cypress/e2e/`
- Lauf: `npm run test` (headless) oder `npm run cy` (interaktiv)
- Voraussetzung: Voll-Stack läuft (Client, API, OIDC-Mock, DB).
- Nur ergänzen, wenn der Test etwas verifiziert, das Vitest nicht abdecken kann.

### Cypress-Konventionen

- Keine `.then(cb => expect(...))`-Konstrukte. Stattdessen die eingebauten Chainable-Assertions: `cy.get(...).should("have.text", "...")`.
- Einzelnen Test laufen lassen: `npm run test --expose grep="Titel des Tests"`.

## Vor jedem Lauf prüfen

Wenn Cypress oder die Integrationstests reihenweise fallen, **zuerst die Infrastruktur prüfen**: Läuft der Client, das API, der OIDC-Mock, die DB? Häufig sieht das nach Test-Bugs aus, ist aber das Setup.

## Pre-Commit-Checks für Backend-Änderungen

Vor einem Commit, der Backend-Code anfasst:

- `dotnet build BDMS.sln -c Release /warnaserror` (SA-/CA-Warnungen sind Errors)
- `dotnet test BDMS.sln -c Release --filter TestCategory!=LongRunning`

Für Client-Änderungen:

- `cd src/client && npm run lint && npm run ts && npm run test:unit`
