import * as React from "react";
import { ReactNode } from "react";

export interface PromptProviderProps {
  children: ReactNode;
}

export interface PromptAction {
  label: string;
  disabled?: boolean;
  action?: () => void;
  variant?: "text" | "contained" | "outlined";
  icon?: React.ReactNode;
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
