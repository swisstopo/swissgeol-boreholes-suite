import { CircularProgress } from "@mui/material";
import { WebStorageStateStore } from "oidc-client-ts";
import { useEffect, useState } from "react";
import { AuthProvider as OidcAuthProvider } from "react-oidc-context";
import { AuthenticationStoreSync } from "./AuthenticationStoreSync.js";
import { AuthOverlay } from "./AuthOverlay";
import { BdmsAuthContext } from "./BdmsAuthContext";
import { CognitoUserManager } from "./CognitoUserManager";
import { SplashScreen } from "./SplashScreen";

export const BdmsAuthProvider = props => {
  const [serverConfig, setServerConfig] = useState(undefined);
  const [oidcConfig, setOidcConfig] = useState(undefined);

  useEffect(() => {
    fetch("/api/v2/settings/auth")
      .then(res => (res.ok ? res.json() : Promise.reject(Error("Failed to get auth settings from API"))))
      .then(setServerConfig)
      .catch(setServerConfig(undefined));
  }, []);

  useEffect(() => {
    if (!serverConfig) return;

    const oidcClientSettings = {
      authority: serverConfig.authority,
      client_id: serverConfig.audience,
      scope: serverConfig.scopes,
      redirect_uri: window.location.origin,
      post_logout_redirect_uri: window.location.origin,
      userStore: new WebStorageStateStore({ store: window.localStorage }),
    };

    var userManager = new CognitoUserManager(oidcClientSettings);

    const onSigninCallback = user => {
      const preLoginState = JSON.parse(atob(user.url_state));
      // restore location after login.
      window.history.replaceState({}, document.title, preLoginState.href);
    };

    setOidcConfig({
      onSigninCallback,
      userManager,
      customSettings: {
        anonymousModeEnabled: serverConfig.anonymousModeEnabled,
      },
    });
  }, [serverConfig]);

  if (!oidcConfig) {
    return (
      <SplashScreen>
        <CircularProgress />
      </SplashScreen>
    );
  }

  return (
    <OidcAuthProvider {...oidcConfig}>
      <BdmsAuthContext.Provider value={oidcConfig.customSettings}>
        <AuthenticationStoreSync />
        <AuthOverlay>{props.children}</AuthOverlay>
      </BdmsAuthContext.Provider>
    </OidcAuthProvider>
  );
};
