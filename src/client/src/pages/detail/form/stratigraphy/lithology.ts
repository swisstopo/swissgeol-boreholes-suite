import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { BoreholeV2 } from "../../../../api/borehole.ts";
import { fetchApiV2 } from "../../../../api/fetchApiV2.ts";
import { Codelist } from "../../../../components/codelist.ts";

export interface LithologyDescription {
  isFirst: boolean;
  lithologyCon: Codelist;
}

export interface Lithology {
  toDepth: number;
  fromDepth: number;
  lithologyDescriptions: LithologyDescription[];
  id: number;
  boreholeId: number;
  borehole: BoreholeV2 | null;
}

export const fetchLithologiesByStratigraphyId = async (stratigraphyId: number): Promise<Lithology[]> =>
  await fetchApiV2(`lithology?stratigraphyId=${stratigraphyId}`, "GET");

export const lithologyQueryKey = "lithologies";

export const useLithologies = (stratigraphyId?: number): UseQueryResult<Lithology[]> =>
  useQuery({
    queryKey: [lithologyQueryKey, stratigraphyId],
    queryFn: () => fetchLithologiesByStratigraphyId(stratigraphyId!),
    enabled: !!stratigraphyId,
  });
