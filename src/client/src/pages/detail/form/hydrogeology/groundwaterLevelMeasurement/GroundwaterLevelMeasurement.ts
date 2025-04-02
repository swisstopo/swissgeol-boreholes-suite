import { fetchApiV2 } from "../../../../../api/fetchApiV2.ts";
import { Observation } from "../Observation.ts";

export interface GroundwaterLevelMeasurement extends Observation {
  levelM: number | null;
  levelMasl: number | null;
  kindId: number;
  kind: string; // domain name
}

export const getGroundwaterLevelMeasurements = async (boreholeId: number) => {
  return await fetchApiV2(`groundwaterlevelmeasurement?boreholeId=${boreholeId}`, "GET");
};

export const addGroundwaterLevelMeasurement = async (groundwaterLevelMeasurement: GroundwaterLevelMeasurement) => {
  return await fetchApiV2("groundwaterlevelmeasurement", "POST", groundwaterLevelMeasurement);
};

export const updateGroundwaterLevelMeasurement = async (groundwaterLevelMeasurement: GroundwaterLevelMeasurement) => {
  return await fetchApiV2("groundwaterlevelmeasurement", "PUT", groundwaterLevelMeasurement);
};

export const deleteGroundwaterLevelMeasurement = async (id: number) => {
  return await fetchApiV2(`groundwaterlevelmeasurement?id=${id}`, "DELETE");
};
