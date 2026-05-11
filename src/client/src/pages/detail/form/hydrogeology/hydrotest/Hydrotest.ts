import { useQuery } from "@tanstack/react-query";
import { fetchApiV2Legacy } from "../../../../../api/fetchApiV2.ts";
import { Hydrotest } from "../../../../../api/generated";

export interface HydrotestInputProps {
  item: Hydrotest;
  parentId: number;
}

export const getHydrotests = async (boreholeId: number): Promise<Hydrotest[]> => {
  return await fetchApiV2Legacy(`hydrotest?boreholeId=${boreholeId}`, "GET");
};

export const addHydrotest = async (hydrotest: Hydrotest): Promise<void> => {
  return await fetchApiV2Legacy("hydrotest", "POST", hydrotest);
};

export const updateHydrotest = async (hydrotest: Hydrotest): Promise<void> => {
  return await fetchApiV2Legacy("hydrotest", "PUT", hydrotest);
};

export const deleteHydrotest = async (id: number): Promise<void> => {
  return await fetchApiV2Legacy(`hydrotest?id=${id}`, "DELETE");
};

export const useHydrotestDomains = (testKindIds: number[]) => {
  let queryString = "";
  testKindIds.forEach(id => {
    queryString += `testKindIds=${id}&`;
  });

  return useQuery({
    queryKey: ["codelists", queryString],
    queryFn: async () => {
      return await fetchApiV2Legacy(`codelist?${queryString}`, "GET");
    },
    staleTime: 10 * (60 * 1000), // 10 mins
    gcTime: 15 * (60 * 1000), // 15 mins
  });
};
