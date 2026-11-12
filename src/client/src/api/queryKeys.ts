import type { QueryClient } from "@tanstack/react-query";

// Query keys that modules outside the borehole API need, kept apart from borehole.ts so that the query client and
// the detail pages can reach them without loading the borehole API with its components and codelists.

export const boreholeQueryKey = "boreholes";

// Prefix of every overview query (the filtered boreholes and the filter statistics), so all of them can be
// marked stale at once, see markOverviewStale.
export const overviewQueryKey = [boreholeQueryKey, "overview"] as const;

/**
 * Marks every overview query stale without downloading it; the overview fetches again when it is shown next.
 * Every mutation does this on its own (see createQueryClient). Changes that do not run as a mutation and can
 * alter what the overview lists or filters by, such as uploading a photo or profile, call it themselves.
 * @param queryClient The app wide query client.
 */
export const markOverviewStale = (queryClient: QueryClient) =>
  queryClient.invalidateQueries({ queryKey: overviewQueryKey, refetchType: "none" });
