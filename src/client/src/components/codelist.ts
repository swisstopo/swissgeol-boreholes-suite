import { useQuery } from "@tanstack/react-query";
import { fetchApiV2 } from "../api/fetchApiV2.ts";

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
  [key: string]: string | number;
}

const staleTime10Min = 10 * 60 * 1000;
const garbageCollectionTime15Min = 15 * 60 * 1000;

export const useCodelists = () =>
  useQuery({
    queryKey: ["codelists"],
    queryFn: () => {
      return fetchApiV2("codelist", "GET");
    },
    staleTime: staleTime10Min,
    gcTime: garbageCollectionTime15Min,
  });
export const useCodelistSchema = (schema: string) =>
  useQuery({
    queryKey: ["codelists", schema],
    queryFn: async () => {
      return await fetchApiV2(`codelist?schema=${schema}`, "GET");
    },
    staleTime: staleTime10Min,
    gcTime: garbageCollectionTime15Min,
  });
