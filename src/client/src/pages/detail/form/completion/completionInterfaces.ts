import { Codelist } from "../../../../components/codelist.ts";
import { FormSelectValue } from "../../../../components/form/formSelect.tsx";

export interface Completion {
  id: number;
  boreholeId: number | string;
  name: string | null;
  kindId: number | null;
  isPrimary: boolean;
  abandonDate: string | null;
  notes: string | null;
  kind?: Codelist;
  created?: string;
  casings?: Casing[];
  backfills?: Backfill[];
  instrumentations?: Instrumentation[];
}

export interface CasingElement {
  fromDepth: number | null;
  toDepth: number | null;
  kindId: number | string;
  materialId: number | string | null;
  innerDiameter: number | null;
  outerDiameter: number | null;
}

export interface Casing {
  id: number;
  completionId?: number;
  boreholeId?: number;
  name?: string;
  dateStart?: string | null;
  dateFinish?: string | null;
  notes?: string;
  fromDepth?: number | null;
  toDepth?: number | null;
  casingElements: CasingElement[];
  completion?: { name: string };
}

export interface CasingDepth {
  min: number | null;
  max: number | null;
}

interface CasingReference {
  name?: string;
  completion?: { name: string };
}

export interface Backfill {
  id: number;
  completionId?: number;
  fromDepth: number | null;
  toDepth: number | null;
  kindId: number | null;
  materialId: number | null;
  casingId?: number | null;
  isOpenBorehole?: boolean;
  notes?: string;
  casing?: CasingReference;
  kind?: Codelist;
  material?: Codelist;
}

export interface Instrumentation {
  id: number;
  completionId?: number;
  fromDepth: number | null;
  toDepth: number | null;
  name: string;
  kindId: number | null;
  statusId: number | null;
  casingId?: number | null;
  isOpenBorehole?: boolean;
  notes?: string;
  casing?: CasingReference;
  kind?: Codelist;
  status?: Codelist;
}

export interface CasingOption extends FormSelectValue {
  key: number;
  name: string;
}

export interface CompletionContentProps {
  completion: Completion;
  editingEnabled: boolean;
}

export interface CompletionHeaderDisplayProps {
  completion: Completion;
  setEditing: (shouldEdit: boolean) => void;
  copyCompletion: () => void;
  deleteCompletion: () => void;
}

export interface CompletionHeaderInputProps {
  completion: Completion;
  editing: boolean;
  cancelChanges: () => void;
  saveCompletion: (completion: Completion) => void;
  trySwitchTab: boolean;
  switchTabs: (continueSwitching: boolean) => void;
}

export interface CompletionPanelState {
  index: number;
  selected: Completion | null;
  switchTabTo: number | null;
  displayed: Completion[];
  editing: boolean;
  trySwitchTab?: boolean;
}

export interface CompletionTabProps {
  completionId: number;
  editingEnabled?: boolean;
}

export interface DataCardItemInputProps<T> {
  item: T;
  parentId: number;
}

export interface DataCardItemDisplayProps<T> {
  item: T;
}
