import { createContext, FC, PropsWithChildren, useCallback, useState } from "react";
import { useSettings } from "../api/useSettings.ts";

export interface AnalyticsContextProps {
  setAnalyticsEnabled: (analyticsEnabled: boolean) => void;
  analyticsId?: string;
}

export const AnalyticsContext = createContext<AnalyticsContextProps>({
  setAnalyticsEnabled: () => false,
  analyticsId: undefined,
});

export const AnalyticsProvider: FC<PropsWithChildren> = ({ children }) => {
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const settings = useSettings();

  const handleSetAnalyticsEnabled = useCallback(
    (enabled: boolean) => {
      setAnalyticsEnabled(Boolean(enabled && settings?.googleAnalyticsTrackingId));
    },
    [settings?.googleAnalyticsTrackingId],
  );

  return (
    <AnalyticsContext.Provider
      value={{
        setAnalyticsEnabled: handleSetAnalyticsEnabled,
        analyticsId: analyticsEnabled ? settings?.googleAnalyticsTrackingId : undefined,
      }}>
      {children}
    </AnalyticsContext.Provider>
  );
};
