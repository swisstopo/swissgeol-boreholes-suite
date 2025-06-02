import { FC, PropsWithChildren, useEffect, useState } from "react";
import { AuthProviderProps, AuthProvider as OidcAuthProvider } from "react-oidc-context";
import { CircularProgress } from "@mui/material";
import { User, WebStorageStateStore } from "oidc-client-ts";
import { useSettings } from "../api/useSettings";
import { AuthenticationStoreSync } from "./AuthenticationStoreSync.js";
import { AuthOverlay } from "./AuthOverlay";
import { BdmsAuthContext, BdmsAuthContextProps } from "./BdmsAuthContext";
import { CognitoUserManager } from "./CognitoUserManager";
import { SplashScreen } from "./SplashScreen";

type OidcConfig = AuthProviderProps & {
  customSettings: BdmsAuthContextProps;
};

export const BdmsAuthProvider: FC<PropsWithChildren> = props => {
  const [oidcConfig, setOidcConfig] = useState<OidcConfig | undefined>(undefined);
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

    const userManager = new CognitoUserManager(oidcClientSettings);

    const onSigninCallback = (user: User | void) => {
      const preLoginState = JSON.parse(atob((user as User)?.url_state ?? ""));
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
