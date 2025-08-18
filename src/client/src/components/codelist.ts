import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { fetchApiV2WithApiError } from "../api/fetchApiV2.ts";
import { useShowAlertOnError } from "../hooks/useShowAlertOnError.tsx";

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
  [key: string]: string | number;
}

export const fetchCodelists = async (): Promise<Codelist[]> => await fetchApiV2WithApiError("codelist", "GET");

export const fetchCodelistsBySchema = async (schema: string): Promise<Codelist[]> =>
  await fetchApiV2WithApiError(`codelist?schema=${schema}`, "GET");

export const updateCodelist = async (codelist: Codelist) => {
  return await fetchApiV2WithApiError("codelist", "PUT", codelist);
};

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

export const useCodelistMutations = () => {
  const queryClient = useQueryClient();
  const useUpdateCodelist = useMutation({
    mutationFn: async (codelist: Codelist) => {
      return await updateCodelist(codelist);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [codelistQueryKey] });
    },
  });
  useShowAlertOnError(useUpdateCodelist.isError, useUpdateCodelist.error);

  return {
    update: useUpdateCodelist,
  };
};
