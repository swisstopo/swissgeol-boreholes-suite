import { ReactElement, ReactNode } from "react";
import { TOptions } from "i18next";

export interface PromptAction {
  // A translation key. The prompt translates it, so an already translated text must not be passed.
  label: string;
  labelValues?: TOptions;
  disabled?: boolean;
  action?: () => void;
  variant?: "text" | "contained" | "outlined";
  icon?: ReactNode;
}

/** A translation key together with the values its text interpolates. */
interface TranslationWithValues {
  key: string;
  values: TOptions;
}

/**
 * A translation key, a key with the values it interpolates, or an element for a message a key cannot carry, such as
 * one with markup. The prompt translates keys itself, so an already translated text must not be passed as a string:
 * it would be looked up as a key a second time.
 */
export type PromptMessage = string | TranslationWithValues | ReactElement;

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
