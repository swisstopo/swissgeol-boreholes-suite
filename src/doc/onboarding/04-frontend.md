# Frontend: `src/client/src/`

React 19 + TypeScript + Vite. UI baut auf `@swissgeol/ui-core`, MUI 5 und Emotion auf.

## Layout

| Ordner | Zweck |
| :--- | :--- |
| `pages/` | Top-Level-Routen: `overview`, `detail`, `settings`. Routing in [`App.tsx`](../../src/client/src/App.tsx). |
| `components/` | Wiederverwendbare UI-Bausteine (header, map, table, form, prompt, ...). |
| `api/` | **Neue** API-Schicht. Typisierter Fetcher (`fetchApiV2WithApiError`), TanStack-Query-Hooks, generierter Client unter `generated/`. |
| `api-lib/` | **Legacy** API-Schicht. Nur lesen, nicht erweitern. |
| `reducers/` | **Legacy** Redux Store. Wird durch TanStack Query und Context-Provider ersetzt. Nichts mehr hinzufügen. |
| `auth/` | OIDC-Provider (`BoreholesAuthProvider`), Auth-Hooks. |
| `hooks/` | Wiederverwendbare React-Hooks. |
| `error/` | ErrorBoundary-Komponenten pro Route. |
| `term/` | Akzeptanz der Nutzungsbedingungen, Analytics-Provider. |

## State-Management-Regel

Neue API-Calls **immer** über TanStack Query. Keine neuen Redux-Reducer.

- Der QueryClient wird in [`App.tsx`](../../src/client/src/App.tsx) konfiguriert. Errors lösen entweder einen Alert-Banner aus (gecachte Daten vorhanden) oder eine ErrorBoundary (keine Daten).
- `nuqs` synchronisiert URL-Parameter mit React-State (z. B. Filter in der Übersicht).
- Detail-Forms verwenden `SaveContext` und `EditStateContext` zusammen mit der Save-Bar (siehe [`pages/detail/saveBar.tsx`](../../src/client/src/pages/detail/saveBar.tsx)).

## Komponenten- und Styling-Regeln

- Erst nach SwissGeol UI Library suchen, dann MUI. Eigene CSS-Klassen sind die letzte Option.
- MUI `sx`-Prop oder Emotion `styled`-Komponenten. Kein globales CSS.
- Alle sichtbaren Strings über `t("schlüssel")` aus `react-i18next`. Keine String-Literale in JSX.
- Komponenten sind `FC<Props>`-typisierte `const`-Exports, eine Komponente pro Datei.
- Kein `any`. Nullable-Felder bewusst behandeln, keine erzwungenen Casts.

## Routing

`createBrowserRouter` in [`App.tsx`](../../src/client/src/App.tsx):

- `/` Übersicht (Tabelle, Karte, Filter)
- `/:id/*` Detailseite einer Bohrung
- `/setting/*` Einstellungen
- `*` Fallback auf `/`

Jede Route hat eine eigene ErrorBoundary.

## Wichtige Patterns

- **Forms**: `baseForm.tsx` in `pages/detail/form/`. Validation, Save-Handling und Dirty-Tracking sind hier zentralisiert.
- **Karte**: `components/map/` plus `basemapSelector/`. Basiert auf OpenLayers und swisstopo-Basemaps.
- **Bulk-Edit**: `components/bulkedit/`. Massenmutationen auf Selektionen aus der Übersicht.
- **Prompt-System**: `components/prompt/` rendert globale Bestätigungs-Dialoge. Steuerung über `PromptProvider`.

## Querverweise

- Wie der Client das API anspricht: [02-architecture.md](02-architecture.md)
- OpenAPI-Client regenerieren: [07-frontend-workflows.md](07-frontend-workflows.md)
- Test-Strategie: [06-testing.md](06-testing.md)
