import { createContext, FC, PropsWithChildren, ReactNode, useState } from "react";

import { PromptAction, PromptContextInterface, PromptOptions } from "./promptInterface";

export const PromptContext = createContext<PromptContextInterface>({
  message: "",
  actions: [],
  promptIsOpen: false,
  dialogContent: null,
  showPrompt: () => {},
  closePrompt: () => {},
});

export const PromptProvider: FC<PropsWithChildren> = ({ children }) => {
  const [prompt, setPrompt] = useState<PromptOptions>();

  const showPrompt = (message: string, actions: PromptAction[], dialogContent: ReactNode = null) => {
    setPrompt({
      message: message,
      actions: actions,
      dialogContent: dialogContent,
    });
  };

  const closePrompt = () => {
    setPrompt(undefined);
  };

  return (
    <PromptContext.Provider
      value={{
        promptIsOpen: prompt?.message != null,
        message: prompt?.message,
        actions: prompt?.actions,
        dialogContent: prompt?.dialogContent,
        showPrompt,
        closePrompt,
      }}>
      {children}
    </PromptContext.Provider>
  );
};
