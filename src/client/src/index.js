import React from "react";
import { AuthProvider } from "react-oidc-context";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";

import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import "./index.css";
import "ol/ol.css";
import App from "./App";

import "semantic-ui-css/semantic.css";

import store from "./reducers";

const onSigninCallback = user => {
  window.history.replaceState({}, document.title, window.location.pathname);
  store.dispatch({ type: "SET_", user });
};

const oidcConfig = {
  // TODO: Use environment variables
  authority: "http://localhost:4011",
  client_id: "bdms-client",
  scope: "openid profile email",
  redirect_uri: window.location.origin,
  onSigninCallback: onSigninCallback,
};

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <I18nextProvider i18n={i18n}>
    <Provider store={store}>
      <AuthProvider {...oidcConfig}>
        <App />
      </AuthProvider>
    </Provider>
  </I18nextProvider>,
);
