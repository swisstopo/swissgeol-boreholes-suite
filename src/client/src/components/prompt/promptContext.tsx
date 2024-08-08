import { createContext, FC, PropsWithChildren, useState } from "react";
import { PromptAction, PromptContextInterface, PromptOptions } from "./promptInterface";

export const PromptContext = createContext<PromptContextInterface>({
  message: "",
  actions: [],
  promptIsOpen: false,
  showPrompt: () => {},
  closePrompt: () => {},
});

export const PromptProvider: FC<PropsWithChildren> = ({ children }) => {
  const [prompt, setPrompt] = useState<PromptOptions>();

  const showPrompt = (message: string, actions: PromptAction[]) => {
    setPrompt({
      message: message,
      actions: actions,
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
        showPrompt,
        closePrompt,
      }}>
      {children}
    </PromptContext.Provider>
  );
};
