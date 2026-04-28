import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { fetchApiV2WithApiError } from "../api/fetchApiV2.ts";

export interface Codelist {
  order: number;
  id: number;
  geolcode: number;
  schema: string;
  de: string;
  en: string;
  fr: string;
  it: string;
  conf: string;
  path: string;
  code: string;
  [key: string]: string | number;
}

export enum CodelistLabelStyle {
  TextOnly = "textOnly", // Text only in dropdown and chips
  CodeOnly = "codeOnly", // Code only in dropdown and chips
  TextAndCode = "textAndCode", // Text and code in dropdown and chips
  TextAndCodeChipsCodeOnly = "textAndCodeChipsCodeOnly", // Text and code in dropdown, code only in chips (for multi select only)
}

export const useCodelistLabel = (labelStyle: CodelistLabelStyle) => {
  const { i18n } = useTranslation();
  return useCallback(
    (d: Codelist) => {
      if (labelStyle === CodelistLabelStyle.CodeOnly) return String(d.code);

      let label = String(d[i18n.language]);
      if (labelStyle === CodelistLabelStyle.TextAndCode || labelStyle === CodelistLabelStyle.TextAndCodeChipsCodeOnly) {
        label += ` (${String(d.code)})`;
      }
      return label;
    },
    [labelStyle, i18n.language],
  );
};

export const restrictionFreeCode = 20111001;
export const restrictionCode = 20111002;
export const restrictionUntilCode = 20111003;

const fetchCodelists = async (): Promise<Codelist[]> => await fetchApiV2WithApiError("codelist", "GET");

const fetchCodelistsBySchema = async (schema: string): Promise<Codelist[]> =>
  await fetchApiV2WithApiError(`codelist?schema=${schema}`, "GET");

const staleTime10Min = 10 * 60 * 1000;
const garbageCollectionTime15Min = 15 * 60 * 1000;
const codelistQueryKey = "codelists";

export const useCodelists = () =>
  useSuspenseQuery<Codelist[]>({
    queryKey: [codelistQueryKey],
    queryFn: fetchCodelists,
    staleTime: staleTime10Min,
    gcTime: garbageCollectionTime15Min,
  });

export const useCodelistSchema = (schema: string) =>
  useQuery({
    queryKey: [codelistQueryKey, schema],
    queryFn: async () => {
      return await fetchCodelistsBySchema(schema);
    },
    staleTime: staleTime10Min,
    gcTime: garbageCollectionTime15Min,
  });

export const useCodelistDisplayValues = () => {
  const { data: codelists } = useCodelists();
  const { i18n } = useTranslation();

  return useCallback(
    (id: number) => {
      const codelist = codelists?.find(item => item.id === id);
      return codelist ? { text: codelist[i18n.language] as string, code: codelist.code } : { text: "", code: "" };
    },
    [codelists, i18n.language],
  );
};
