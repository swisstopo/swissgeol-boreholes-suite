import { FC, PropsWithChildren, useEffect, useState } from "react";
import { AuthProviderProps, AuthProvider as OidcAuthProvider } from "react-oidc-context";
import { DataRouter } from "react-router";
import { CircularProgress } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { User, WebStorageStateStore } from "oidc-client-ts";
import {
  boreholeQueryKey,
  filterBoreholes,
  getDefaultFilterRequestFromSession,
  toFilterRequestSubmission,
} from "../api/borehole.ts";
import { useSettings } from "../api/useSettings";
import { AuthenticationStoreSync } from "./AuthenticationStoreSync.js";
import { AuthOverlay } from "./AuthOverlay";
import { BoreholesAuthContext, BoreholesAuthContextProps } from "./BoreholesAuthContext.tsx";
import { CognitoUserManager } from "./CognitoUserManager";
import { SplashScreen } from "./SplashScreen";
import { useAuth } from "./useBoreholesAuth.tsx";

interface BoreholeAuthProviderProps {
  router: DataRouter;
}

type OidcConfig = AuthProviderProps & {
  customSettings: BoreholesAuthContextProps;
};

export const BoreholesAuthProvider: FC<PropsWithChildren<BoreholeAuthProviderProps>> = ({ router, children }) => {
  const [oidcConfig, setOidcConfig] = useState<OidcConfig | undefined>(undefined);
  const settings = useSettings();

  useEffect(() => {
    if (!settings?.authSettings) return;

    const serverConfig = settings.authSettings;

    const oidcClientSettings = {
      authority: serverConfig.authority,
      client_id: serverConfig.audience,
      scope: serverConfig.scopes,
      redirect_uri: globalThis.location.origin,
      post_logout_redirect_uri: globalThis.location.origin,
      userStore: new WebStorageStateStore({ store: globalThis.localStorage }),
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
  const PrefetchBoreholes: FC = () => {
    const queryClient = useQueryClient();
    const auth = useAuth();

    useEffect(() => {
      if (auth.isAuthenticated) {
        const filterRequestSubmission = toFilterRequestSubmission(getDefaultFilterRequestFromSession());
        queryClient.prefetchQuery({
          queryKey: [boreholeQueryKey, filterRequestSubmission],
          queryFn: () => filterBoreholes(filterRequestSubmission),
        });
      }
    }, [auth.isAuthenticated, queryClient]);

    return null;
  };

  return (
    <OidcAuthProvider {...oidcConfig}>
      <BoreholesAuthContext.Provider value={oidcConfig.customSettings}>
        <AuthenticationStoreSync />
        <PrefetchBoreholes />
        <AuthOverlay>{children}</AuthOverlay>
      </BoreholesAuthContext.Provider>
    </OidcAuthProvider>
  );
};
