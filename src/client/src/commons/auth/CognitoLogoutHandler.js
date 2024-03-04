import { useEffect } from "react";

// AWS Cognito currently does not support Client initiated logout according to OIDC standard:
// https://openid.net/specs/openid-connect-rpinitiated-1_0.html
// This component replaces the logout logic of userManager to implement call cognito logout endpoint non-standard
// client_id and logout_uri parameters. See: https://docs.aws.amazon.com/cognito/latest/developerguide/logout-endpoint.html
export const CognitoLogoutHandler = ({ userManager }) => {
  useEffect(() => {
    userManager.metadataService.getMetadata().then(metadata => {
      if (
        new URL(metadata.end_session_endpoint).hostname.endsWith(
          "amazoncognito.com",
        )
      ) {
        const cognitoLogoutUrl = new URL(metadata.end_session_endpoint);
        cognitoLogoutUrl.searchParams.append(
          "client_id",
          userManager.settings.client_id,
        );
        cognitoLogoutUrl.searchParams.append(
          "logout_uri",
          window.location.origin,
        );

        const signoutRedirectOverride = _args => {
          userManager.removeUser();
          window.location.assign(cognitoLogoutUrl.href);
        };

        userManager.signoutRedirect = signoutRedirectOverride;
      }
    });
  }, [userManager]);
};
