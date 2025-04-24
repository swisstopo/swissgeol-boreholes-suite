import { createContext, FC, PropsWithChildren, useCallback, useState } from "react";
import ReactGA from "react-ga4";
import { useSettings } from "../api/useSettings.ts";

export interface AnalyticsContextProps {
  setAnalyticsEnabled: (analyticsEnabled: boolean) => void;
  sendAnalyticsEvent: () => void;
}

export const AnalyticsContext = createContext<AnalyticsContextProps>({
  setAnalyticsEnabled: () => false,
  sendAnalyticsEvent: () => {},
});

export const AnalyticsProvider: FC<PropsWithChildren> = ({ children }) => {
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const settings = useSettings();

  const handleSetAnalyticsEnabled = useCallback(
    (enabled: boolean) => {
      if (enabled && settings?.googleAnalyticsTrackingId) {
        setAnalyticsEnabled(true);
        if (!ReactGA.isInitialized) {
          ReactGA.initialize(settings?.googleAnalyticsTrackingId);
        }
      } else {
        setAnalyticsEnabled(false);
      }
    },
    [settings?.googleAnalyticsTrackingId],
  );

  const sendAnalyticsEvent = useCallback(() => {
    if (analyticsEnabled) {
      ReactGA.send("pageview");
    }
  }, [analyticsEnabled]);

  return (
    <AnalyticsContext.Provider
      value={{
        setAnalyticsEnabled: handleSetAnalyticsEnabled,
        sendAnalyticsEvent,
      }}>
      {children}
    </AnalyticsContext.Provider>
  );
};
