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
  actions?: PromptAction[];
  promptIsOpen: boolean;
  showPrompt: (message: string, actions: PromptAction[]) => void;
  closePrompt: () => void;
}

export interface PromptOptions {
  message: string;
  actions: PromptAction[];
}
