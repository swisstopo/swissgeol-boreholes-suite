import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";

import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import "./index.css";
import "ol/ol.css";
import App from "./App";
import { BdmsAuthProvider } from "./commons/auth/BdmsAuthProvider";

import "semantic-ui-css/semantic.css";

import store from "./reducers";

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <I18nextProvider i18n={i18n}>
    <Provider store={store}>
      <BdmsAuthProvider>
        <App />
      </BdmsAuthProvider>
    </Provider>
  </I18nextProvider>,
);
