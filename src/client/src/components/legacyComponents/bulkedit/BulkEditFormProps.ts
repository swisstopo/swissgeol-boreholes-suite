import { FormValueType } from "../../form/form.ts";

export interface BulkEditFormProps {
  selected: number[];
  loadBoreholes: () => void;
}

export type BulkEditFormValue = string | number | boolean | (string | number | boolean)[] | undefined | null;

export interface BulkEditFormField {
  fieldName: string;
  type?: FormValueType;
  api: string;
  domain?: string;
}
