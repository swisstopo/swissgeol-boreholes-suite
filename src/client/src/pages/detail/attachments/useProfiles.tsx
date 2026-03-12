import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getFiles } from "../../../api/file/file";
import { Profile } from "../../../api/file/fileInterfaces";
import { labelingFileFormat, matchesFileFormat, PanelTab } from "../labeling/labelingInterfaces.tsx";

const profileQueryKey = "profiles";

export function useProfiles(boreholeId?: number, forLabeling: boolean = false) {
  return useQuery({
    enabled: !!boreholeId,
    queryKey: [profileQueryKey, boreholeId, forLabeling],
    queryFn: async () => {
      if (!boreholeId) return [];
      const response = await getFiles<Profile>(Number(boreholeId));

      const profiles = response.map(profile => ({
        id: profile.fileId,
        ...profile,
      }));

      if (forLabeling) {
        return profiles.filter((fileResponse: Profile) =>
          matchesFileFormat(labelingFileFormat[PanelTab.profile], fileResponse.file.type),
        );
      }
      return profiles;
    },
  });
}

// Necessary as long as the profile mutations are not handled via tanstack-query.
export const useReloadProfiles = (boreholeId: number) => {
  const queryClient = useQueryClient();
  return useCallback(() => {
    console.log("reload profiles", profileQueryKey, boreholeId);
    queryClient.invalidateQueries({ queryKey: [profileQueryKey, boreholeId] });
  }, [boreholeId, queryClient]);
};
