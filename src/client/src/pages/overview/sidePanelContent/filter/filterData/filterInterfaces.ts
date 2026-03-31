import { UseFormReturn } from "react-hook-form";
import { FormSelectValue } from "../../../../../components/form/formSelect.tsx";

export interface SearchData {
  value: string;
  id?: number;
  type?: string;
  label?: string;
  labels?: string[];
  isNumber?: boolean;
  inputType?: string;
  hasTwoFields?: boolean;
  schema?: string;
  placeholder?: string;
  hideShowAllFields?: boolean;
  additionalValues?: FormSelectValue[];
}

export interface FilterComponentProps {
  toggleDrawer: (open: boolean) => void;
  formMethods: UseFormReturn;
}

export type FilterSectionName = "borehole" | "location" | "workgroup" | "workflowStatus" | "attachments" | "log";

export interface FilterInputConfig {
  id: number;
  name: FilterSectionName;
  translationId: string;
  isSelected: boolean;
  searchData: SearchData[];
  /* eslint-disable  @typescript-eslint/no-explicit-any */ // legacy data structure
  [key: string]: any;
}

export interface FilterChipsProps {
  formMethods: UseFormReturn;
}
