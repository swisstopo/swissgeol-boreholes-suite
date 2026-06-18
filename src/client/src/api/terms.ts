import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchApiV2WithApiError } from "./fetchApiV2.ts";
import { Term } from "./generated";

/**
 * The localized texts of a {@link Term} that can be written when saving a draft.
 */
export type TermUpdate = Pick<Term, "textEn" | "textDe" | "textFr" | "textIt" | "textRo">;

const fetchPublishedTerms = async (): Promise<Term | null> => await fetchApiV2WithApiError<Term | null>("terms", "GET");

const fetchDraftTerms = async (): Promise<Term | null> =>
  await fetchApiV2WithApiError<Term | null>("terms/draft", "GET");

const saveDraftTerms = async (term: TermUpdate): Promise<Term> =>
  await fetchApiV2WithApiError<Term>("terms/draft", "PUT", term);

const publishTerms = async (): Promise<Term> => await fetchApiV2WithApiError<Term>("terms/publish", "POST");

const termsQueryKey = "terms";
const draftTermsQueryKey = "draftTerms";

export const usePublishedTerms = (enabled = true) =>
  useQuery({
    queryKey: [termsQueryKey],
    queryFn: fetchPublishedTerms,
    enabled,
  });

export const useDraftTerms = () =>
  useQuery({
    queryKey: [draftTermsQueryKey],
    queryFn: fetchDraftTerms,
  });

export const useTermsMutations = () => {
  const queryClient = useQueryClient();

  const saveDraft = useMutation({
    mutationFn: (term: TermUpdate) => saveDraftTerms(term),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [draftTermsQueryKey] });
    },
  });

  const publish = useMutation({
    mutationFn: publishTerms,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [draftTermsQueryKey] });
      queryClient.invalidateQueries({ queryKey: [termsQueryKey] });
    },
  });

  return {
    saveDraft,
    publish,
  };
};
