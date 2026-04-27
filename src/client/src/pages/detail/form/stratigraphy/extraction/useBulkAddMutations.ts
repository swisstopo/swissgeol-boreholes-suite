import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "../../../../../api/apiInterfaces.ts";
import { fetchApiV2WithApiError } from "../../../../../api/fetchApiV2.ts";
import { stratigraphiesQueryKey, Stratigraphy } from "../../../../../api/stratigraphy.ts";
import { useResetTabStatus } from "../../../../../hooks/useResetTabStatus.ts";
import { LithologicalDescription } from "../lithologicalDescription.ts";
import { Lithology } from "../lithology.ts";

interface StratigraphyInput {
  name: string;
  lithologicalDescriptions: Omit<LithologicalDescription, "id" | "stratigraphyId">[];
}

interface BulkAddResult {
  stratigraphy: Stratigraphy;
  lithologies: Lithology[];
  lithologicalDescriptions: LithologicalDescription[];
}

const maxUniqueNameRetries = 10;

async function createStratigraphyWithUniqueName(
  name: string,
  boreholeId: number,
  attempt: number = 0,
): Promise<Stratigraphy> {
  const effectiveName = attempt === 0 ? name : `${name} (${attempt})`;
  try {
    return await fetchApiV2WithApiError<Stratigraphy>("stratigraphy", "POST", {
      id: 0,
      name: effectiveName,
      isPrimary: false,
      boreholeId,
    });
  } catch (e) {
    if (e instanceof ApiError && e.message.includes("Name must be unique") && attempt < maxUniqueNameRetries) {
      return createStratigraphyWithUniqueName(name, boreholeId, attempt + 1);
    }
    throw e;
  }
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
        const newStratigraphy = await createStratigraphyWithUniqueName(name, boreholeId);

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
