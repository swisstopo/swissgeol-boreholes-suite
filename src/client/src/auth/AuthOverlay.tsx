import { FC, PropsWithChildren } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Button, CircularProgress } from "@mui/material";
import { useCurrentUser } from "../api/user.ts";
import { SplashScreen } from "./SplashScreen.tsx";
import { useAuth } from "./useBoreholesAuth.tsx";

export const AuthOverlay: FC<PropsWithChildren> = ({ children }) => {
  const auth = useAuth();

  // Bypass authentication in anonymous mode.
  if (auth.anonymousModeEnabled) {
    auth.isAuthenticated = true;
  }

  const { t } = useTranslation();
  const canLoadUser = auth.isAuthenticated && (auth.anonymousModeEnabled || (auth.user != null && !auth.user.expired));
  const { data: user, isError } = useCurrentUser(canLoadUser);

  const signIn = () => {
    const path = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    auth.signinRedirect({
      url_state: btoa(JSON.stringify({ path })),
    });
  };

  const signOut = () => {
    auth.signoutRedirect();
  };

  if (auth.isAuthenticated && user) {
    return children;
  } else if (!auth.isLoading && !auth.isAuthenticated) {
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
