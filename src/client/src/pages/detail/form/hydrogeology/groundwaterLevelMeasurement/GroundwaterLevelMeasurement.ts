import { fetchApiV2Legacy } from "../../../../../api/fetchApiV2.ts";
import { GroundwaterLevelMeasurement } from "../../../../../api/generated";

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
