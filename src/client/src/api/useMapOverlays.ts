import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { LayerConfig } from "../components/map/map";
import { fetchApiV2WithApiError } from "./fetchApiV2";
import {
  addOverlay,
  MapOverlays,
  removeOverlay,
  setOverlayPosition,
  setOverlayTransparency,
  setOverlayVisibility,
} from "./mapOverlayUtils.ts";

const mapOverlaysQueryKey = "mapOverlays";
const mapOverlaysUrl = "user/self/maplayers";

/**
 * Hook to read and mutate the current user's custom map overlays via the v2 API.
 * Mutations optimistically update the cache and persist the full overlay collection.
 */
export const useMapOverlays = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [mapOverlaysQueryKey],
    queryFn: async () => await fetchApiV2WithApiError<MapOverlays>(mapOverlaysUrl, "GET"),
  });

  const overlays = query.data ?? {};

  const mutation = useMutation({
    mutationFn: async (next: MapOverlays) => await fetchApiV2WithApiError<MapOverlays>(mapOverlaysUrl, "PUT", next),
    onMutate: async (next: MapOverlays) => {
      await queryClient.cancelQueries({ queryKey: [mapOverlaysQueryKey] });
      const previous = queryClient.getQueryData<MapOverlays>([mapOverlaysQueryKey]);
      queryClient.setQueryData([mapOverlaysQueryKey], next);
      return { previous };
    },
    onError: (_error, _next, context) => {
      queryClient.setQueryData([mapOverlaysQueryKey], context?.previous ?? {});
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [mapOverlaysQueryKey] });
    },
  });

  // Read the latest overlays from the cache (not the render snapshot) so successive
  // edits dispatched before a re-render compose instead of overwriting each other.
  const currentOverlays = () => queryClient.getQueryData<MapOverlays>([mapOverlaysQueryKey]) ?? {};

  return {
    overlays,
    isLoading: query.isLoading,
    addOverlay: (identifier: string, layer: LayerConfig) =>
      mutation.mutate(addOverlay(currentOverlays(), identifier, layer)),
    removeOverlay: (identifier: string) => mutation.mutate(removeOverlay(currentOverlays(), identifier)),
    setVisibility: (identifier: string, visibility: boolean) =>
      mutation.mutate(setOverlayVisibility(currentOverlays(), identifier, visibility)),
    setTransparency: (identifier: string, transparency: number) =>
      mutation.mutate(setOverlayTransparency(currentOverlays(), identifier, transparency)),
    setPosition: (identifier: string, position: number) =>
      mutation.mutate(setOverlayPosition(currentOverlays(), identifier, position)),
  };
};
