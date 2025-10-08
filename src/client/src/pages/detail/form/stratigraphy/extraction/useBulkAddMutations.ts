import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApiV2WithApiError } from "../../../../../api/fetchApiV2.ts";
import { LithologicalDescription, stratigraphiesQueryKey, Stratigraphy } from "../../../../../api/stratigraphy.ts";
import { useResetTabStatus } from "../../../../../hooks/useResetTabStatus.ts";
import { Lithology } from "../lithology.ts";

export const useBulkAddMutation = () => {
  const queryClient = useQueryClient();
  const resetTabStatus = useResetTabStatus(["lithology"]);

  return useMutation({
    mutationFn: async ({
      boreholeId,
      lithologies,
      lithologicalDescriptions,
    }: {
      boreholeId: number;
      lithologies: Omit<Lithology, "id" | "stratigraphyId">[];
      lithologicalDescriptions: Omit<LithologicalDescription, "id" | "stratigraphyId">[];
    }) => {
      const newStratigraphy: Stratigraphy = await fetchApiV2WithApiError("stratigraphyv", "POST", {
        id: 0,
        name: `Extracted ${new Date().toLocaleString()}`,
        isPrimary: false,
        boreholeId: boreholeId,
      });

      const lithologiesPromise = fetchApiV2WithApiError(
        "lithology/bulk",
        "POST",
        lithologies.map(l => ({ ...l, stratigraphyId: newStratigraphy.id })),
      );

      const lithologicalDescriptionsPromise = fetchApiV2WithApiError(
        "lithologicaldescription/bulk",
        "POST",
        lithologicalDescriptions.map(l => ({ ...l, stratigraphyId: newStratigraphy.id })),
      );

      const [addedLithologies, addedLithologicalDescriptions] = await Promise.all([
        lithologiesPromise,
        lithologicalDescriptionsPromise,
      ]);

      return {
        stratigraphy: newStratigraphy,
        lithologies: addedLithologies,
        lithologicalDescriptions: addedLithologicalDescriptions,
      };
    },
    onSuccess: values => {
      resetTabStatus();
      queryClient.invalidateQueries({ queryKey: [stratigraphiesQueryKey, values.stratigraphy.boreholeId] });
    },
  });
};
