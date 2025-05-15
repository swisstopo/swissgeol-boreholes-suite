import { FC, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import moment from "moment";
import "moment/locale/en-gb";
import "moment/locale/it";
import "moment/locale/fr";
import "moment/locale/de-ch";

interface DateTextProps {
  date?: string | Date | null;
  fromNow?: boolean;
  hours?: boolean;
}

export const DateText: FC<DateTextProps> = ({ date = null, fromNow = false, hours = false }) => {
  const { i18n } = useTranslation();
  const [fromNowText, setFromNowText] = useState<string>("");

  const getFromNow = useCallback((): string => {
    if (i18n.language === "de") {
      moment.locale("de-ch");
    } else if (i18n.language === "en") {
      moment.locale("en-gb");
    } else {
      moment.locale(i18n.language);
    }

    if (date && moment(date).isValid()) {
      return moment(date).fromNow();
    }
    return "";
  }, [date, i18n.language]);

  useEffect(() => {
    if (fromNow) {
      setFromNowText(getFromNow());
    }
  }, [date, i18n.language, fromNow, getFromNow]);

  if (date && moment(date).isValid()) {
    if (fromNow) {
      return <>{fromNowText}</>;
    }

    if (i18n.language === "de") {
      moment.locale("de-ch");
    } else if (i18n.language === "en") {
      moment.locale("en-gb");
    } else {
      moment.locale(i18n.language);
    }

    return <>{moment(date).format("DD.MM.YYYY" + (hours ? " HH:mm" : ""))}</>;
  }

  return null;
};
