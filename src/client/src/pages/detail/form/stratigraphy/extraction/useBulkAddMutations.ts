import { useMutation } from "@tanstack/react-query";
import { fetchApiV2WithApiError } from "../../../../../api/fetchApiV2.ts";
import { LithologicalDescription } from "../../../../../api/stratigraphy.ts";
import { Lithology } from "../lithology.ts";

interface BulkAddPayload {
  lithologies: Lithology[];
  lithologicalDescriptions: LithologicalDescription[];
}

interface BulkAddResponse {
  lithologies: Lithology[];
  lithologicalDescriptions: LithologicalDescription[];
}
export const useBulkAddMutation = () => {
  return useMutation({
    mutationFn: async ({ lithologies, lithologicalDescriptions }: BulkAddPayload): Promise<BulkAddResponse> => {
      // Create promise for bulk adding lithologies
      const lithologiesPromise = fetchApiV2WithApiError("lithology/bulk", "POST", lithologies);

      // Create promise for bulk adding lithological descriptions
      const lithologicalDescriptionsPromise = fetchApiV2WithApiError(
        "lithologicaldescription/bulk",
        "POST",
        lithologicalDescriptions,
      );

      // Execute both requests in parallel and wait for both to complete
      const [lithologiesResponse, lithologicalDescriptionsResponse] = await Promise.all([
        lithologiesPromise,
        lithologicalDescriptionsPromise,
      ]);

      // Return combined results
      return {
        lithologies: lithologiesResponse,
        lithologicalDescriptions: lithologicalDescriptionsResponse,
      };
    },
  });
};
