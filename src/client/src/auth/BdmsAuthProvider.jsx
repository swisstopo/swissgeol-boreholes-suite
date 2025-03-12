import { useEffect, useState } from "react";
import ReactGA from "react-ga4";
import { AuthProvider as OidcAuthProvider } from "react-oidc-context";
import { CircularProgress } from "@mui/material";
import { WebStorageStateStore } from "oidc-client-ts";
import { AuthenticationStoreSync } from "./AuthenticationStoreSync.js";
import { AuthOverlay } from "./AuthOverlay";
import { BdmsAuthContext } from "./BdmsAuthContext";
import { CognitoUserManager } from "./CognitoUserManager";
import { SplashScreen } from "./SplashScreen";

/**
 * Fetches app settings, configures authentication, and initializes Google Analytics if needed.
 * @param {Object} props
 * @param {React.ReactNode} props.children - The child components that require authentication.
 */
export const BdmsAuthProvider = props => {
  const [settings, setSettings] = useState(undefined);
  const [oidcConfig, setOidcConfig] = useState(undefined);

  useEffect(() => {
    fetch("/api/v2/settings")
      .then(res => (res.ok ? res.json() : Promise.reject(Error("Failed to get settings from API"))))
      .then(setSettings)
      .catch(() => setSettings(undefined));
  }, []);

  useEffect(() => {
    if (!settings) return;

    if (settings?.googleAnalyticsTrackingId) {
      ReactGA.initialize(settings.googleAnalyticsTrackingId);
      ReactGA.send({ hitType: "pageview" });
    }

    const serverConfig = settings.authSettings;

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
  }, [settings]);

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
