import { useEffect, useState } from "react";
import { AuthProvider as OidcAuthProvider } from "react-oidc-context";
import { CircularProgress } from "@mui/material";
import { WebStorageStateStore } from "oidc-client-ts";
import { useSettings } from "../api/useSettings";
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
  const [oidcConfig, setOidcConfig] = useState(undefined);
  const settings = useSettings();

  useEffect(() => {
    if (!settings?.authSettings) return;

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
