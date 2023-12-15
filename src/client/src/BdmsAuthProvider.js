import { useEffect } from "react";
import { AuthProvider, useAuth } from "react-oidc-context";
import { useDispatch } from "react-redux";
import { setAuthentication, unsetAuthentication } from "./api-lib";
import { WebStorageStateStore } from "oidc-client-ts";

const AuthenticationStoreSync = () => {
  const auth = useAuth();
  const dispatch = useDispatch();

  useEffect(() => {
    if (auth.user) {
      dispatch(setAuthentication(auth.user));
    }
  }, [auth.user, dispatch]);
};

export const BdmsAuthProvider = props => {
  const dispatch = useDispatch();

  const onSigninCallback = user => {
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  const onRemoveUser = () => {
    dispatch(unsetAuthentication());
  };

  const oidcConfig = {
    authority: window.env.AUTHORITY,
    client_id: window.env.CLIENT_ID,
    scope: "openid profile email",
    redirect_uri: window.location.origin,
    userStore: new WebStorageStateStore({ store: window.localStorage }),
    onSigninCallback,
    onRemoveUser,
  };

  return (
    <AuthProvider {...oidcConfig}>
      <AuthenticationStoreSync />
      {props.children}
    </AuthProvider>
  );
};
