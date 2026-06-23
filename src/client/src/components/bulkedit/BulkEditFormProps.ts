import { GridRowSelectionModel } from "@mui/x-data-grid";
import { BoreholeBulkUpdate } from "../../api/generated";
import { FormValueType } from "../form/form.ts";

export interface BulkEditFormProps {
  selected: GridRowSelectionModel;
  loadBoreholes: () => void;
  isOpen: boolean;
}

export type BulkEditFormValue = string | number | boolean | undefined | null;

export interface BulkEditFormField {
  // camelCase key, reused as the i18n key and the react-hook-form field name.
  fieldName: string;
  type: FormValueType;
  // The BoreholeBulkUpdate property this field writes to.
  payloadKey: keyof BoreholeBulkUpdate;
  // v2 codelist schema name, only for Domain fields.
  schemaName?: string;
}
