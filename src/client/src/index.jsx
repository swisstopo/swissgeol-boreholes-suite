import { createRoot } from "react-dom/client";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import "@swissgeol/ui-core/styles.css";
import "./index.css";
import "ol/ol.css";
import { SettingsProvider } from "./api/SettingsContext.tsx";
import App from "./App";

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <I18nextProvider i18n={i18n}>
    <SettingsProvider>
      <App />
    </SettingsProvider>
  </I18nextProvider>,
);
