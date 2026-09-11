import { useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/useBoreholesAuth.tsx";
import { AnalyticsContext, AnalyticsContextProps } from "./analyticsContext.tsx";
import { readConsent, writeConsent } from "./consentCookie.ts";
import { DisclaimerDialog } from "./disclaimerDialog";
import { de, en, fr, it } from "./disclaimerFallback.ts";

interface Terms {
  [key: string]: string;
  en: string;
  de: string;
  fr: string;
  it: string;
}

export const AcceptTerms = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { setAnalyticsEnabled } = useContext<AnalyticsContextProps>(AnalyticsContext);
  const { i18n } = useTranslation();

  const subject = user?.profile.sub;
  const storedConsent = useMemo(() => readConsent(subject), [subject]);
  // Wrapped so that "nobody accepted yet" stays distinguishable from an anonymous user accepting.
  const [sessionConsent, setSessionConsent] = useState<{ subject: string | undefined } | null>(null);
  const hasAccepted = storedConsent !== null || (sessionConsent !== null && sessionConsent.subject === subject);

  const terms: Terms = { en, de, fr, it };

  // Re-runs when setAnalyticsEnabled re-identifies after settings load,
  // so the stored choice only enables analytics when googleAnalyticsTrackingId is also configured.
  useEffect(() => {
    if (storedConsent) setAnalyticsEnabled(storedConsent.analytics);
  }, [storedConsent, setAnalyticsEnabled]);

  const handleDialogClose = (analyticsEnabled: boolean) => {
    writeConsent(subject, analyticsEnabled);
    setAnalyticsEnabled(analyticsEnabled);
    setSessionConsent({ subject });
  };

  return hasAccepted ? (
    children
  ) : (
    <DisclaimerDialog markdownContent={terms[i18n.language]} onClose={handleDialogClose} />
  );
};
