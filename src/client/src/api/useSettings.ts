import { useContext } from "react";
import { SettingsContext } from "./SettingsContext.tsx";

/**
 * Hook to access the application settings throughout the app.
 * @returns The application settings.
 */
export function useSettings() {
  return useContext(SettingsContext);
}
