import { FC, PropsWithChildren, useEffect, useState } from "react";
import { AuthProviderProps, AuthProvider as OidcAuthProvider } from "react-oidc-context";
import { DataRouter } from "react-router";
import { CircularProgress } from "@mui/material";
import { User, WebStorageStateStore } from "oidc-client-ts";
import { useSettings } from "../api/useSettings";
import { AuthenticationStoreSync } from "./AuthenticationStoreSync.js";
import { AuthOverlay } from "./AuthOverlay";
import { BdmsAuthContext, BdmsAuthContextProps } from "./BdmsAuthContext";
import { CognitoUserManager } from "./CognitoUserManager";
import { SplashScreen } from "./SplashScreen";

interface BdmsAuthProviderProps {
  router: DataRouter;
}

type OidcConfig = AuthProviderProps & {
  customSettings: BdmsAuthContextProps;
};

export const BdmsAuthProvider: FC<PropsWithChildren<BdmsAuthProviderProps>> = ({ router, children }) => {
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

    const onSigninCallback = (user: User | undefined) => {
      const preLoginState = JSON.parse(atob(user?.url_state ?? ""));
      // restore location after login.
      router.navigate(preLoginState.path, { replace: true });
    };

    setOidcConfig({
      onSigninCallback,
      userManager,
      customSettings: {
        anonymousModeEnabled: serverConfig.anonymousModeEnabled,
      },
    });
  }, [router, settings]);

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
        <AuthOverlay>{children}</AuthOverlay>
      </BdmsAuthContext.Provider>
    </OidcAuthProvider>
  );
};
