import { SignoutRedirectArgs, UserManager } from "oidc-client-ts";

export class CognitoUserManager extends UserManager {
  public async signoutRedirect(args: SignoutRedirectArgs = {}): Promise<void> {
    {
      const metadata = await this.metadataService.getMetadata();

      // AWS Cognito currently does not support Client initiated logout according to OIDC standard:
      // https://openid.net/specs/openid-connect-rpinitiated-1_0.html
      // This component replaces the logout logic of userManager to implement call cognito logout endpoint non-standard
      // client_id and logout_uri parameters. See: https://docs.aws.amazon.com/cognito/latest/developerguide/logout-endpoint.html
      if (
        metadata.end_session_endpoint &&
        new URL(metadata.end_session_endpoint).hostname.endsWith("amazoncognito.com")
      ) {
        const cognitoLogoutArgs: SignoutRedirectArgs = {
          extraQueryParams: {
            client_id: this.settings.client_id,
            logout_uri: this.settings.post_logout_redirect_uri ?? window.location.origin,
          },
          ...args,
        };

        await super.signoutRedirect(cognitoLogoutArgs);
      } else {
        await super.signoutRedirect(args);
      }
    }
  }
}
