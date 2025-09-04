import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { fetchApiV2 } from "../../../../api/fetchApiV2.ts";
import { Stratigraphy } from "../../../../api/stratigraphy.ts";
import { Codelist } from "../../../../components/codelist.ts";

export interface LithologyDescription {
  id: number;
  lithologyId: number;
  lithology: Lithology;
  isFirst: boolean;
  colorPrimaryId: number | null;
  colorPrimary: Codelist | null;
  colorSecondaryId: number | null;
  colorSecondary: Codelist | null;
  lithologyUnconMainId: number | null;
  lithologyUnconMain: Codelist | null;
  lithologyUncon2Id: number | null;
  lithologyUncon2: Codelist | null;
  lithologyUncon3Id: number | null;
  lithologyUncon3: Codelist | null;
  lithologyUncon4Id: number | null;
  lithologyUncon4: Codelist | null;
  lithologyUncon5Id: number | null;
  lithologyUncon5: Codelist | null;
  lithologyUncon6Id: number | null;
  lithologyUncon6: Codelist | null;
  componentUnconOrganicCodelistIds: number[];
  componentUnconOrganicCodelists: Codelist[];
  componentUnconDebrisCodelistIds: number[];
  componentUnconDebrisCodelists: Codelist[];
  grainShapeCodelistIds: Codelist[];
  grainShapeCodelists: Codelist[];
  grainAngularityCodelistIds: number[];
  grainAngularityCodelists: Codelist[];
  hasStriae: boolean;
  lithologyUnconDebrisCodelistIds: number[];
  lithologyUnconDebrisCodelists: Codelist[];
  lithologyConId: number | null;
  lithologyCon: Codelist | null;
  componentConParticleCodelistIds: number[];
  componentConParticleCodelists: Codelist[];
  componentConMineralCodelistIds: number[];
  componentConMineralCodelists: Codelist[];
  grainSizeId: number | null;
  grainSize: Codelist | null;
  grainAngularityId: number | null;
  grainAngularity: Codelist | null;
  gradationId: number | null;
  gradation: Codelist | null;
  cementationId: number | null;
  cementation: Codelist | null;
  structureSynGenCodelistIds: number[];
  structureSynGenCodelists: Codelist[];
  structurePostGenCodelistIds: number[];
  structurePostGenCodelists: Codelist[];
}

export interface Lithology {
  id: number;
  stratigraphyId: number;
  stratigraphy: Stratigraphy;
  toDepth: number;
  fromDepth: number;
  isUnconsolidated: boolean;
  hasBedding: boolean;
  share: number | null;
  lithologyDescriptions: LithologyDescription[];
  alterationDegreeId: number | null;
  alterationDegree: Codelist | null;
  notes: string | null;
  compactnessId: number | null;
  compactness: Codelist | null;
  cohesionId: number | null;
  cohesion: Codelist | null;
  humidityId: number | null;
  humidity: Codelist | null;
  consistencyId: number | null;
  consistency: Codelist | null;
  plasticityId: number | null;
  plasticity: Codelist | null;
  uscsTypeCodelistIds: number[];
  uscsTypeCodelists: Codelist[];
  uscsDeterminationId: number | null;
  uscsDetermination: Codelist | null;
  rockConditionCodelistIds: number[];
  rockConditionCodelists: Codelist[];
  textureMataCodelistIds: number[];
  textureMataCodelists: Codelist[];
  isGap?: boolean;
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
