import { Borehole } from "../../../../api-lib/ReduxStateInterfaces.ts";

export interface SegmentProps {
  borehole: Borehole;
  editingEnabled: boolean;
  updateChange: (
    fieldName: keyof Borehole["data"] | "location",
    value: string | number | boolean | null | (number | string | null)[],
    to?: boolean,
  ) => void;
}
