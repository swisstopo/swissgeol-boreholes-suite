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
  actions?: PromptAction[];
  promptIsOpen: boolean;
  showPrompt: (message: string, actions: PromptAction[], dialogContent?: ReactNode) => void;
  closePrompt: () => void;
}

export interface PromptOptions {
  message: string;
  actions: PromptAction[];
  dialogContent: ReactNode;
}
