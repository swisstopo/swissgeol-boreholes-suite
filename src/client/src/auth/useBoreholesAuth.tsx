import { useContext } from "react";
import { useAuth as useOidcAuth } from "react-oidc-context";
import { BoreholesAuthContext } from "./BoreholesAuthContext.tsx";

export const useAuth = () => {
  const oidcContext = useOidcAuth();
  const customContext = useContext(BoreholesAuthContext);

  if (!customContext) {
    throw new Error("useAuth must be used within a BoreholesAuthContextProvider");
  }

  return {
    ...oidcContext,
    ...customContext,
  };
};
