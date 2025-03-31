import { fetchApiV2 } from "../../../../../api/fetchApiV2.ts";
import { Observation } from "../Observation.ts";

export interface FieldMeasurement extends Observation {
  fieldMeasurementResults: FieldMeasurementResult[];
}

export interface FieldMeasurementResult {
  id?: number;
  sampleTypeId: number | null;
  parameterId: number | null;
  value: number | null;
}

export interface FieldMeasurementInputProps {
  item: FieldMeasurement;
  parentId: number;
}

export const getFieldMeasurements = async (boreholeId: number) => {
  return await fetchApiV2(`fieldmeasurement?boreholeId=${boreholeId}`, "GET");
};

export const addFieldMeasurement = async (fieldmeasurement: FieldMeasurement) => {
  return await fetchApiV2("fieldmeasurement", "POST", fieldmeasurement);
};

export const updateFieldMeasurement = async (fieldmeasurement: FieldMeasurement) => {
  return await fetchApiV2("fieldmeasurement", "PUT", fieldmeasurement);
};

export const deleteFieldMeasurement = async (id: number) => {
  return await fetchApiV2(`fieldmeasurement?id=${id}`, "DELETE");
};
