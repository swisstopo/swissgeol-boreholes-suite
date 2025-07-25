import { FC, PropsWithChildren, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { Alert, Button, CircularProgress } from "@mui/material";
import { loadUser } from "../api-lib";
import { SplashScreen } from "./SplashScreen.tsx";
import { useAuth } from "./useBdmsAuth";

interface User {
  data: object;
  error?: string;
}

interface ReduxState {
  core_user: User;
}

export const AuthOverlay: FC<PropsWithChildren> = ({ children }) => {
  const auth = useAuth();

  // Bypass authentication in anonymous mode.
  if (auth.anonymousModeEnabled) {
    auth.isAuthenticated = true;
  }

  const dispatch = useDispatch();
  const user = useSelector<ReduxState, User>(state => state.core_user);
  const { t } = useTranslation();

  const signIn = () => {
    const path = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    auth.signinRedirect({
      url_state: btoa(JSON.stringify({ path })),
    });
  };

  const signOut = () => {
    auth.signoutRedirect();
  };

  useEffect(() => {
    if (auth.isAuthenticated) {
      // @ts-expect-error legacy API methods will not be typed, as they are going to be removed
      dispatch(loadUser());
    }
  }, [auth.isAuthenticated, dispatch]);

  if (auth.isAuthenticated && user.data) {
    return children;
  } else if (!auth.isLoading && !auth.isAuthenticated) {
    // Perform automatic login if user is not authenticated.
    signIn();
  } else if (user?.error) {
    return (
      <SplashScreen>
        <Alert severity="error">{t("userUnauthorized")}</Alert>
        <Button variant="contained" color="error" onClick={signOut}>
          Logout
        </Button>
      </SplashScreen>
    );
  } else {
    return (
      <SplashScreen>
        <CircularProgress />
      </SplashScreen>
    );
  }
};
