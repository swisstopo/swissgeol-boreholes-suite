import { useEffect, useState } from "react";
import { AuthProvider } from "react-oidc-context";
import { UserManager, WebStorageStateStore } from "oidc-client-ts";
import { CognitoLogoutHandler } from "./CognitoLogoutHandler";
import { AuthenticationStoreSync } from "./AuthenticationStoreSync";

export const BdmsAuthProvider = props => {
  const [serverConfig, setServerConfig] = useState(undefined);
  const [oidcConfig, setOidcConfig] = useState(undefined);

  useEffect(() => {
    fetch("/api/v2/settings/auth")
      .then(res =>
        res.ok
          ? res.json()
          : Promise.reject(Error("Failed to get auth settings from API")),
      )
      .then(setServerConfig)
      .catch(setServerConfig(undefined));
  }, []);

  useEffect(() => {
    if (!serverConfig) return;

    const onSigninCallback = user => {
      const preLoginState = JSON.parse(atob(user.url_state));
      // restore location after login.
      window.history.replaceState({}, document.title, preLoginState.href);
    };

    setOidcConfig({
      authority: serverConfig.authority,
      client_id: serverConfig.audience,
      scope: serverConfig.scopes,
      redirect_uri: window.location.origin,
      post_logout_redirect_uri: window.location.origin,
      userStore: new WebStorageStateStore({ store: window.localStorage }),
      onSigninCallback,
    });
  }, [serverConfig]);

  return oidcConfig ? (
    <AuthProvider {...oidcConfig}>
      <AuthenticationStoreSync />
      {props.children}
    </AuthProvider>
  ) : null;
};
