import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getFiles } from "../../../api/file/file";
import { BoreholeFile } from "../../../api/file/fileInterfaces";
import { labelingFileFormat, matchesFileFormat, PanelTab } from "../labeling/labelingInterfaces.tsx";

const boreholeFileQueryKey = "boreholeFiles";
export function useBoreholeFiles(boreholeId?: string) {
  return useQuery({
    queryKey: [boreholeFileQueryKey, boreholeId],
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

// This hook can be used to explicitly invalidate the query where boreholeFiles change without being managed by react-query mutations
export const useInvalidateBoreholeFiles = () => {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: [boreholeFileQueryKey] });
  };
};
