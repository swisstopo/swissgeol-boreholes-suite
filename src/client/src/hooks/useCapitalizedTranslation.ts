import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { TOptions } from "i18next";
import { capitalizeFirstLetter } from "../utils.ts";

export const useCapitalizedTranslation = () => {
  const { t } = useTranslation();
  return useCallback((key?: string, options?: TOptions) => (key ? capitalizeFirstLetter(t(key, options)) : ""), [t]);
};
