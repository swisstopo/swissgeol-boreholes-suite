import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApiV2WithApiError } from "../../../../../api/fetchApiV2.ts";
import { stratigraphiesQueryKey, Stratigraphy } from "../../../../../api/stratigraphy.ts";
import { useResetTabStatus } from "../../../../../hooks/useResetTabStatus.ts";
import { LithologicalDescription } from "../lithologicalDescription.ts";
import { Lithology } from "../lithology.ts";

export interface StratigraphyInput {
  name: string;
  lithologicalDescriptions: Omit<LithologicalDescription, "id" | "stratigraphyId">[];
}

export interface BulkAddResult {
  stratigraphy: Stratigraphy;
  lithologies: Lithology[];
  lithologicalDescriptions: LithologicalDescription[];
}

export const useBulkAddMutation = () => {
  const queryClient = useQueryClient();
  const resetTabStatus = useResetTabStatus(["lithology"]);

  return useMutation({
    mutationFn: async ({
      boreholeId,
      stratigraphies,
    }: {
      boreholeId: number;
      stratigraphies: StratigraphyInput[];
    }): Promise<BulkAddResult[]> => {
      const results: BulkAddResult[] = [];

      for (const { name, lithologicalDescriptions } of stratigraphies) {
        const newStratigraphy: Stratigraphy = await fetchApiV2WithApiError("stratigraphy", "POST", {
          id: 0,
          name,
          isPrimary: false,
          boreholeId,
        });

        const lithologiesPromise = fetchApiV2WithApiError<Lithology[]>(
          "lithology/bulk",
          "POST",
          lithologicalDescriptions.map(
            ld =>
              ({
                id: 0,
                toDepth: ld.toDepth,
                fromDepth: ld.fromDepth,
                isUnconsolidated: true,
                hasBedding: false,
                stratigraphyId: newStratigraphy.id,
                lithologyDescriptions: [
                  {
                    id: 0,
                    lithologyId: 0,
                    isFirst: true,
                  },
                ],
              }) as Lithology,
          ),
        );

        const lithologicalDescriptionsPromise = fetchApiV2WithApiError<LithologicalDescription[]>(
          "lithologicaldescription/bulk",
          "POST",
          lithologicalDescriptions.map(l => ({ ...l, stratigraphyId: newStratigraphy.id })),
        );

        const [addedLithologies, addedLithologicalDescriptions] = await Promise.all([
          lithologiesPromise,
          lithologicalDescriptionsPromise,
        ]);

        results.push({
          stratigraphy: newStratigraphy,
          lithologies: addedLithologies,
          lithologicalDescriptions: addedLithologicalDescriptions,
        });
      }

      return results;
    },
    onSuccess: values => {
      resetTabStatus();
      if (values.length > 0) {
        queryClient.invalidateQueries({ queryKey: [stratigraphiesQueryKey, values[0].stratigraphy.boreholeId] });
      }
    },
  });
};
