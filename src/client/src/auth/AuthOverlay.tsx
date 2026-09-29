import { FC, PropsWithChildren } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Button, CircularProgress } from "@mui/material";
import { useCurrentUser } from "../api/user.ts";
import { SplashScreen } from "./SplashScreen.tsx";
import { useAuth } from "./useBoreholesAuth.tsx";

export const AuthOverlay: FC<PropsWithChildren> = ({ children }) => {
  const auth = useAuth();

  // Bypass authentication in anonymous mode.
  const isAuthenticated = auth.isAuthenticated || auth.anonymousModeEnabled;

  const { t } = useTranslation();
  const canLoadUser = isAuthenticated && (auth.anonymousModeEnabled || (auth.user != null && !auth.user.expired));
  const { data: user, isError } = useCurrentUser(canLoadUser);

  // Neither redirect is awaited: both hand the browser over to the identity provider, so there is
  // nothing left to do in this document once they resolve.
  const signIn = () => {
    const path = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    void auth.signinRedirect({
      url_state: btoa(JSON.stringify({ path })),
    });
  };

  const signOut = () => {
    void auth.signoutRedirect();
  };

  if (isAuthenticated && user) {
    return children;
  } else if (!auth.isLoading && !isAuthenticated) {
    // Perform automatic login if user is not authenticated.
    signIn();
  } else if (isError) {
    return (
      <SplashScreen>
        <Alert severity="error">{t("userUnauthorized")}</Alert>
        <Button variant="contained" color="error" onClick={signOut}>
          Logout
        </Button>
      </SplashScreen>
    );
  }
  return (
    <SplashScreen>
      <CircularProgress />
    </SplashScreen>
  );
};
