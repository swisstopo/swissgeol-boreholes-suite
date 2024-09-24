import { useContext } from "react";
import { useAuth as useOidcAuth } from "react-oidc-context";

import { BdmsAuthContext } from "./BdmsAuthContext";

export const useAuth = () => {
  const oidcContext = useOidcAuth();
  const customContext = useContext(BdmsAuthContext);

  if (!customContext) {
    throw new Error("useAuth must be used within a BdmsAuthContextProvider");
  }

  return {
    ...oidcContext,
    ...customContext,
  };
};
