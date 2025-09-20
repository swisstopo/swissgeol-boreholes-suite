import { fetchApiV2Legacy } from "../../../../../api/fetchApiV2.ts";
import { Observation } from "../Observation.ts";

export interface GroundwaterLevelMeasurement extends Observation {
  levelM: number | null;
  levelMasl: number | null;
  kindId: number;
  kind: string; // domain name
}

export const getGroundwaterLevelMeasurements = async (boreholeId: number) => {
  return await fetchApiV2Legacy(`groundwaterlevelmeasurement?boreholeId=${boreholeId}`, "GET");
};

export const addGroundwaterLevelMeasurement = async (groundwaterLevelMeasurement: GroundwaterLevelMeasurement) => {
  return await fetchApiV2Legacy("groundwaterlevelmeasurement", "POST", groundwaterLevelMeasurement);
};

export const updateGroundwaterLevelMeasurement = async (groundwaterLevelMeasurement: GroundwaterLevelMeasurement) => {
  return await fetchApiV2Legacy("groundwaterlevelmeasurement", "PUT", groundwaterLevelMeasurement);
};

export const deleteGroundwaterLevelMeasurement = async (id: number) => {
  return await fetchApiV2Legacy(`groundwaterlevelmeasurement?id=${id}`, "DELETE");
};
