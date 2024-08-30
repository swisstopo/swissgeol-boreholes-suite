import { useEffect, useState } from "react";
import { useAuth } from "./useBdmsAuth";
import { useDispatch } from "react-redux";
import { setAuthentication, unsetAuthentication } from "../api-lib";

export const AuthenticationStoreSync = () => {
  const auth = useAuth();
  const dispatch = useDispatch();

  const [userValueExpired, setUserValueExpired] = useState(false);

  useEffect(() => {
    if (auth.isLoading) return;

    if (auth.user && !auth.user.expired) {
      // Trigger delayed rerender to reevaluate user.expired value.
      setTimeout(() => setUserValueExpired(current => !current), auth.user.expires_in * 1000);
      dispatch(setAuthentication(auth.user));
    } else {
      dispatch(unsetAuthentication());
    }
  }, [auth.user, userValueExpired, dispatch, auth.isLoading]);
};
