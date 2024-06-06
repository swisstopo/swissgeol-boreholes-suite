export interface FilterChipsProps {
  activeFilters: Filter[];
  setFilter: (key: string, value: string | boolean | number | null) => void;
}

export interface Filter {
  key: string;
  value: string | boolean | number | null;
}
