import { useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { usePublishedTerms } from "../api/terms.ts";
import { AnalyticsContext, AnalyticsContextProps } from "./analyticsContext.tsx";
import { DisclaimerDialog } from "./disclaimerDialog";
import { de, en, fr, it } from "./disclaimerFallback";

interface Terms {
  [key: string]: string;
  en: string;
  de: string;
  fr: string;
  it: string;
}

const CONSENT_COOKIE_NAME = "boreholes_consent";
const CONSENT_SCHEMA_VERSION = 1;
const CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

const readConsent = (): { analytics: boolean } | null => {
  const match = document.cookie.split("; ").find(row => row.startsWith(`${CONSENT_COOKIE_NAME}=`));
  if (!match) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(match.slice(CONSENT_COOKIE_NAME.length + 1)));
    if (parsed?.v !== CONSENT_SCHEMA_VERSION) return null;
    return { analytics: Boolean(parsed.analytics) };
  } catch {
    return null;
  }
};

const writeConsent = (analytics: boolean): void => {
  const payload = encodeURIComponent(JSON.stringify({ v: CONSENT_SCHEMA_VERSION, analytics }));
  const secure = globalThis.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${CONSENT_COOKIE_NAME}=${payload}; Max-Age=${CONSENT_MAX_AGE_SECONDS}; Path=/; SameSite=Lax${secure}`;
};

export const AcceptTerms = ({ children }: { children: ReactNode }) => {
  const [storedConsent] = useState(() => readConsent());
  const [hasAccepted, setHasAccepted] = useState(storedConsent !== null);
  const { setAnalyticsEnabled } = useContext<AnalyticsContextProps>(AnalyticsContext);
  const { i18n } = useTranslation();
  const { data: publishedTerm, isLoading } = usePublishedTerms(!storedConsent);

  const terms = useMemo<Terms>(
    () => ({
      en: publishedTerm?.textEn || en,
      de: publishedTerm?.textDe || de,
      fr: publishedTerm?.textFr || fr,
      it: publishedTerm?.textIt || it,
    }),
    [publishedTerm],
  );

  // Re-runs when setAnalyticsEnabled re-identifies after settings load,
  // so the stored choice only enables analytics when googleAnalyticsTrackingId is also configured.
  useEffect(() => {
    if (storedConsent) setAnalyticsEnabled(storedConsent.analytics);
  }, [storedConsent, setAnalyticsEnabled]);

  const handleDialogClose = (analyticsEnabled: boolean) => {
    writeConsent(analyticsEnabled);
    setAnalyticsEnabled(analyticsEnabled);
    setHasAccepted(true);
  };

  return hasAccepted
    ? children
    : !isLoading && <DisclaimerDialog markdownContent={terms[i18n.language]} onClose={handleDialogClose} />;
};
