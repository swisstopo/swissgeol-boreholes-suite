import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { capitalizeFirstLetter } from "../utils.ts";

export const useCapitalizedTranslation = () => {
  const { t } = useTranslation();
  return useCallback((key?: string) => (key ? capitalizeFirstLetter(t(key)) : ""), [t]);
};
