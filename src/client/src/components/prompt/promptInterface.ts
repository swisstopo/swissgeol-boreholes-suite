import { ReactElement, ReactNode } from "react";

export interface PromptAction {
  label: string;
  disabled?: boolean;
  action?: () => void;
  variant?: "text" | "contained" | "outlined";
  icon?: ReactNode;
}

/** A translation key, or an element for a message that needs markup the key cannot carry. */
export type PromptMessage = string | ReactElement;

export type ShowPrompt = (message: PromptMessage, actions: PromptAction[], dialogContent?: ReactNode) => void;

export interface PromptContextInterface {
  message?: PromptMessage;
  dialogContent?: ReactNode;
  actions?: PromptAction[];
  promptIsOpen: boolean;
  showPrompt: ShowPrompt;
  closePrompt: () => void;
}

export interface PromptOptions {
  message: PromptMessage;
  actions: PromptAction[];
  dialogContent: ReactNode;
}
