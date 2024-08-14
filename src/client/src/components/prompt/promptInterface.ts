import { ReactNode } from "react";

export interface PromptAction {
  label: string;
  disabled?: boolean;
  action?: () => void;
  variant?: "text" | "contained" | "outlined";
  icon?: ReactNode;
}

export interface PromptContextInterface {
  message?: string;
  dialogContent?: ReactNode;
  dialogWidth?: string | null;
  actions?: PromptAction[];
  promptIsOpen: boolean;
  showPrompt: (message: string, actions: PromptAction[], dialogContent?: ReactNode, dialogWidth?: string) => void;
  closePrompt: () => void;
}

export interface PromptOptions {
  message: string;
  actions: PromptAction[];
  dialogContent: ReactNode;
  dialogWidth: string | null;
}
