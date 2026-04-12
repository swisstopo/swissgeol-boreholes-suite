import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getTerms } from "../api-lib";
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

// Bump to force all users to re-accept (e.g. if terms change materially).
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
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${CONSENT_COOKIE_NAME}=${payload}; Max-Age=${CONSENT_MAX_AGE_SECONDS}; Path=/; SameSite=Lax${secure}`;
};

export const AcceptTerms = ({ children }: { children: React.ReactNode }) => {
  const [storedConsent] = useState(() => readConsent());
  const [hasAccepted, setHasAccepted] = useState(storedConsent !== null);
  const { setAnalyticsEnabled } = useContext<AnalyticsContextProps>(AnalyticsContext);
  const [terms, setTerms] = useState<Terms>({ en: en, de: de, fr: fr, it: it });
  const [isFetching, setIsFetching] = useState(true);
  const { i18n } = useTranslation();

  // Re-runs when setAnalyticsEnabled re-identifies after settings load,
  // so the stored choice is correctly ANDed with googleAnalyticsTrackingId.
  useEffect(() => {
    if (storedConsent) setAnalyticsEnabled(storedConsent.analytics);
  }, [storedConsent, setAnalyticsEnabled]);

  useEffect(() => {
    if (storedConsent) return;
    // @ts-expect-error : The getTerms function is not typed
    getTerms().then(r => {
      const termsObject = r.data;
      setIsFetching(false);
      if (termsObject.data) {
        setTerms({
          en: termsObject.data?.en || en,
          fr: termsObject.data?.fr || fr,
          de: termsObject.data?.de || de,
          it: termsObject.data?.it || it,
        });
      }
    });
  }, [storedConsent]);

  const handleDialogClose = (analyticsEnabled: boolean) => {
    writeConsent(analyticsEnabled);
    setAnalyticsEnabled(analyticsEnabled);
    setHasAccepted(true);
  };

  return hasAccepted
    ? children
    : !isFetching && <DisclaimerDialog markdownContent={terms[i18n.language]} onClose={handleDialogClose} />;
};
