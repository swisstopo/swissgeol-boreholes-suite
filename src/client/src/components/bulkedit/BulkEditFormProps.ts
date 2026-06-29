import { GridRowSelectionModel } from "@mui/x-data-grid";
import { BoreholeBulkUpdate } from "../../api/generated";
import { FormValueType } from "../form/form.ts";

export interface BulkEditFormProps {
  selected: GridRowSelectionModel;
  isOpen: boolean;
  onClose: () => void;
}

export type BulkEditFormValue = string | number | boolean | undefined | null;

export interface BulkEditFormField {
  fieldName: string; // camelCase key, reused as the i18n key and the react-hook-form field name.
  type: FormValueType;
  payloadKey: keyof BoreholeBulkUpdate; // The BoreholeBulkUpdate property this field writes to.
  schemaName?: string; // v2 codelist schema name, only for Domain fields.
}
