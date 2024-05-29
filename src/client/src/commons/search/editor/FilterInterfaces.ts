export interface FilterChipsProps {
  activeFilters: Filter[];
  setFilter: (key: string, value: string) => void;
}

export interface Filter {
  key: string;
  value: string;
}
