import { useEffect, useState } from "react";
import { clearAuthToken, setAuthToken } from "./authTokenStore.ts";
import { useAuth } from "./useBoreholesAuth.tsx";

export const AuthenticationStoreSync = () => {
  const auth = useAuth();

  const [userValueExpired, setUserValueExpired] = useState(false);

  useEffect(() => {
    if (auth.isLoading) return;

    if (auth.user && !auth.user.expired) {
      // Trigger delayed rerender to reevaluate user.expired value.
      setTimeout(() => setUserValueExpired(current => !current), (auth.user.expires_in ?? 0) * 1000);
      setAuthToken({ token_type: auth.user.token_type, access_token: auth.user.access_token });
    } else {
      clearAuthToken();
    }
  }, [auth.user, userValueExpired, auth.isLoading]);

  return null;
};
