import { Codelist } from "../../../../components/legacyComponents/domain/domainInterface.ts";

export interface Hydrotest {
  hydrotestResults: HydrotestResult[];
  codelists: Codelist[];
}

export interface HydrotestResult {
  parameterId: number;
  value: number;
  minValue: number;
  maxValue: number;
}
