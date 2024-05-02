import { ReactNode } from "react";

export interface AlertContextInterface {
  success: (text: string) => void;
  error: (text: string) => void;
  clear: () => void;
  text: string | null;
  severity: "success" | "error" | null;
}

export interface AlertProviderProps {
  children: ReactNode;
}
