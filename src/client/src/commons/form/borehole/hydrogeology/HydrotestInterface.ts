import { Codelist } from "../../domain/domainInterface";

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
