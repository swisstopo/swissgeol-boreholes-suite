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

export const AcceptTerms = ({ children }: { children: React.ReactNode }) => {
  const [hasAccepted, setHasAccepted] = useState(false);
  const { setAnalyticsEnabled, sendAnalyticsEvent } = useContext<AnalyticsContextProps>(AnalyticsContext);
  const [terms, setTerms] = useState<Terms>({ en: en, de: de, fr: fr, it: it });
  const [isFetching, setIsFetching] = useState(true);
  const { i18n } = useTranslation();

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    if (hasAccepted) {
      sendAnalyticsEvent();
    }
  }, [hasAccepted, sendAnalyticsEvent]);

  const handleDialogClose = (analyticsEnabled: boolean) => {
    setAnalyticsEnabled(analyticsEnabled);
    setHasAccepted(true);
  };

  return hasAccepted
    ? children
    : !isFetching && <DisclaimerDialog markdownContent={terms[i18n.language]} onClose={handleDialogClose} />;
};
