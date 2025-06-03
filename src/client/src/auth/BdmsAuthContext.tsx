import { createContext } from "react";

export interface BdmsAuthContextProps {
  anonymousModeEnabled: boolean;
}

/**
 * Provides additional properties that are not included in the default OIDC context.
 */
export const BdmsAuthContext = createContext<BdmsAuthContextProps | undefined>(undefined);

export const BdmsAuthContextProvider = BdmsAuthContext.Provider;
