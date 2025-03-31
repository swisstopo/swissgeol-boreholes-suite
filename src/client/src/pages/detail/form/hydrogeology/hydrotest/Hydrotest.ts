import { useQuery } from "@tanstack/react-query";
import { fetchApiV2 } from "../../../../../api/fetchApiV2.ts";
import { Codelist } from "../../../../../components/Codelist.ts";
import { Observation, ObservationType } from "../Observation.ts";

export interface Hydrotest extends Observation {
  id?: number;
  boreholeId: number;
  hydrotestResults: HydrotestResult[];
  evaluationMethodId?: number[];
  flowDirectionId?: number[];
  testKindId?: number[];
  kindCodelistIds: number[];
  type: ObservationType;
  evaluationMethodCodelistIds: number[];
  flowDirectionCodelistIds: number[];
  kindCodelists?: Codelist[];
  evaluationMethodCodelists?: Codelist[];
  flowDirectionCodelists?: Codelist[];
}

export interface HydrotestResult {
  id?: number;
  parameterId: number | null;
  value: number | null;
  minValue: number | null;
  maxValue: number | null;
}

export interface HydrotestInputProps {
  item: Hydrotest;
  parentId: number;
}

export const getHydrotests = async (boreholeId: number): Promise<Hydrotest[]> => {
  return await fetchApiV2(`hydrotest?boreholeId=${boreholeId}`, "GET");
};

export const addHydrotest = async (hydrotest: Hydrotest): Promise<void> => {
  return await fetchApiV2("hydrotest", "POST", hydrotest);
};

export const updateHydrotest = async (hydrotest: Hydrotest): Promise<void> => {
  return await fetchApiV2("hydrotest", "PUT", hydrotest);
};

export const deleteHydrotest = async (id: number): Promise<void> => {
  return await fetchApiV2(`hydrotest?id=${id}`, "DELETE");
};

export const useHydrotestDomains = (testKindIds: number[]) => {
  let queryString = "";
  testKindIds.forEach(id => {
    queryString += `testKindIds=${id}&`;
  });

  return useQuery({
    queryKey: ["domains", queryString],
    queryFn: async () => {
      return await fetchApiV2(`codelist?${queryString}`, "GET");
    },
    staleTime: 10 * (60 * 1000), // 10 mins
    gcTime: 15 * (60 * 1000), // 15 mins
  });
};
