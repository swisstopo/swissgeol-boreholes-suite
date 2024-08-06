export interface FieldMeasurement {
  fieldMeasurementResults: FieldMeasurementResult[];
}

export interface FieldMeasurementResult {
  sampleTypeId: number;
  parameterId: number;
  value: number;
}
