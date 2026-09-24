import { ReactNode } from "react";

export interface PromptAction {
  label: string;
  disabled?: boolean;
  action?: () => void;
  variant?: "text" | "contained" | "outlined";
  icon?: ReactNode;
}

export type ShowPrompt = (message: string, actions: PromptAction[], dialogContent?: ReactNode) => void;

export interface PromptContextInterface {
  message?: string;
  dialogContent?: ReactNode;
  actions?: PromptAction[];
  promptIsOpen: boolean;
  showPrompt: ShowPrompt;
  closePrompt: () => void;
}

export interface PromptOptions {
  message: string;
  actions: PromptAction[];
  dialogContent: ReactNode;
}
