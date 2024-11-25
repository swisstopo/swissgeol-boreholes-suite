import { Workgroup } from "../../../../api/apiInterfaces.ts";

export interface FilterChipsProps {
  activeFilters: Filter[];
  setFilter: (key: string, value: string | boolean | number | null) => void;
}

export interface Filter {
  key: string;
  value: string | boolean | number | null;
  workgroup?: Workgroup;
  role?: string;
}
