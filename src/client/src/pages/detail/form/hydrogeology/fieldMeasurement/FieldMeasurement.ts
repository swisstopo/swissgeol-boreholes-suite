import { fetchApiV2Legacy } from "../../../../../api/fetchApiV2.ts";
import { FieldMeasurement } from "../../../../../api/generated";

export interface FieldMeasurementInputProps {
  item: FieldMeasurement;
  parentId: number;
}

export const getFieldMeasurements = async (boreholeId: number) => {
  return await fetchApiV2Legacy(`fieldmeasurement?boreholeId=${boreholeId}`, "GET");
};

export const addFieldMeasurement = async (fieldmeasurement: FieldMeasurement) => {
  return await fetchApiV2Legacy("fieldmeasurement", "POST", fieldmeasurement);
};

export const updateFieldMeasurement = async (fieldmeasurement: FieldMeasurement) => {
  return await fetchApiV2Legacy("fieldmeasurement", "PUT", fieldmeasurement);
};

export const deleteFieldMeasurement = async (id: number) => {
  return await fetchApiV2Legacy(`fieldmeasurement?id=${id}`, "DELETE");
};
