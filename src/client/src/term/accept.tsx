import React, { useEffect, useState } from "react";
import { getTerms } from "../api-lib";
import { DisclaimerDialog } from "./disclaimerDialog";
import { de, en, fr, it } from "./disclaimerFallback";
import { useTranslation } from "react-i18next";

interface Terms {
  [key: string]: string;
  en: string;
  de: string;
  fr: string;
  it: string;
}

export const AcceptTerms = ({ children }: { children: React.ReactNode }) => {
  const [hasAccepted, setHasAccepted] = useState(false);
  const [terms, setTerms] = useState<Terms>({ en: en, de: de, fr: fr, it: it });
  const [isFetching, setIsFetching] = useState(true);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    // @ts-expect-error : The getTerms function is not typed
    getTerms().then(r => {
      const termsObject = r.data;
      setIsFetching(false);
      if (termsObject.data) {
        setTerms({
          en: termsObject.data?.en,
          fr: termsObject.data?.fr,
          de: termsObject.data?.de,
          it: termsObject.data?.it,
        });
      }
    });
  }, []);

  const handleDialogClose = () => {
    setHasAccepted(true);
  };

  return hasAccepted
    ? children
    : !isFetching && <DisclaimerDialog markdownContent={terms[i18n.language]} onClose={handleDialogClose} />;
};
