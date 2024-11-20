import { GridRowSelectionModel } from "@mui/x-data-grid";
import { FormValueType } from "../../form/form.ts";

export interface BulkEditFormProps {
  selected: GridRowSelectionModel;
  loadBoreholes: () => void;
}

export type BulkEditFormValue = string | number | boolean | undefined | null;

export interface BulkEditFormField {
  fieldName: string;
  type: FormValueType;
  api?: string;
  domain?: string;
}
