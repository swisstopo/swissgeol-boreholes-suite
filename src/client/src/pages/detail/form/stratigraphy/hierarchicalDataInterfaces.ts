import { FormSelectMenuItem } from "../../../../components/form/formSelect.tsx";

export interface Level {
  level: number;
  label: string;
  options: FormSelectMenuItem[];
}

export interface HierarchicalDataSearchProps {
  schema: string;
  labels?: string[];
  selected: number | null;
  onSelected?: (selection: { id: number | null }) => void;
}
