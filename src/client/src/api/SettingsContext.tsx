import React, { createContext, useEffect, useState } from "react";

interface Settings {
  authSettings?: {
    authority: string;
    audience: string;
    scopes: string;
    anonymousModeEnabled: boolean;
  };
  googleAnalyticsTrackingId?: string;
}

export const SettingsContext = createContext<Settings | null>(null);

/**
 * Provider component that fetches application settings from the API
 * and makes them available to child components through React Context.
 */
export function SettingsProvider({ children }: { children: Readonly<React.ReactNode> }) {
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    fetch("/api/v2/settings")
      .then(res => (res.ok ? res.json() : Promise.reject(Error("Failed to get settings from API"))))
      .then(setSettings)
      .catch(() => setSettings(null));
  }, []);

  return <SettingsContext.Provider value={settings}>{children}</SettingsContext.Provider>;
}
