import { createContext } from "react";

export interface BoreholesAuthContextProps {
  anonymousModeEnabled: boolean;
}

/**
 * Provides additional properties that are not included in the default OIDC context.
 */
export const BoreholesAuthContext = createContext<BoreholesAuthContextProps | undefined>(undefined);
