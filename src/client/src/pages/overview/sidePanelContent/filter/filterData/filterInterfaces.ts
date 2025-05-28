import { Dispatch, SetStateAction } from "react";
import { UseFormReturn } from "react-hook-form";

export interface SearchData {
  value: string;
  id?: number;
  type?: string;
  label?: string;
  labels?: string[];
  isNumber?: boolean;
  inputType?: string;
  hasTwoFields?: boolean;
  isVisibleValue?: string;
  isVisible?: boolean;
  schema?: string;
  placeholder?: string;
  hideShowAllFields?: boolean;
  additionalValues?: AdditionalValue[];
}

export interface AdditionalValue {
  id: number;
  translationId: string;
}

export interface FilterComponentProps {
  toggleDrawer: (open: boolean) => void;
  formMethods: UseFormReturn;
}

export type FilterSectionName =
  | "borehole"
  | "location"
  | "workgroup"
  | "status"
  | "lithology"
  | "lithostratigraphy"
  | "chronostratigraphy"
  | "registration";

export interface FilterInputConfig {
  id: number;
  name: FilterSectionName;
  translationId: string;
  isSelected: boolean;
  searchData: SearchData[];
  /* eslint-disable  @typescript-eslint/no-explicit-any */ // legacy data structure
  [key: string]: any;
}

export type ShowAllActiveFields = Record<FilterSectionName, boolean>;

export interface FilterChipsProps {
  activeFilters?: Filter[];
  setActiveFilters: Dispatch<SetStateAction<Filter[] | undefined>>;
  setFilter: (key: string, value: string | boolean | number | null) => void;
  formMethods: UseFormReturn;
}

export interface Filter {
  key: string;
  value: string | boolean | number | null;
}
