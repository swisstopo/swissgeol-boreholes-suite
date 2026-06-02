import { Backfill, Casing, Completion, Instrumentation } from "../../../../api/generated";
import { FormSelectValue } from "../../../../components/form/formSelect.tsx";

export type { Backfill, Casing, Completion, Instrumentation };

export interface CasingDepth {
  min: number | null;
  max: number | null;
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
  confirmTabSwitch: () => void;
  cancelTabSwitch: () => void;
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
