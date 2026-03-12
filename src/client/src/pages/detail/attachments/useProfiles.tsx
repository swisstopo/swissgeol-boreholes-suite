import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getFiles } from "../../../api/file/file";
import { BoreholeFile } from "../../../api/file/fileInterfaces";
import { labelingFileFormat, matchesFileFormat, PanelTab } from "../labeling/labelingInterfaces.tsx";

const profileQueryKey = "profiles";

export function useProfiles(boreholeId?: string) {
  return useQuery({
    queryKey: [profileQueryKey, boreholeId],
    queryFn: async () => {
      if (!boreholeId) return [];
      const response = await getFiles<BoreholeFile>(Number(boreholeId));
      return response
        .filter((fileResponse: BoreholeFile) =>
          matchesFileFormat(labelingFileFormat[PanelTab.profile], fileResponse.file.type),
        )
        .map((fileResponse: BoreholeFile) => fileResponse.file);
    },
    enabled: !!boreholeId,
  });
}

// Necessary as long as the profile mutations are not handled via tanstack-query.
export const useReloadProfiles = (boreholeId: number) => {
  const queryClient = useQueryClient();
  return useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [profileQueryKey, boreholeId] });
  }, [boreholeId, queryClient]);
};
