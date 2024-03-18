import { createContext, useState } from "react";

export const PromptContext = createContext({
  title: "",
  message: "",
  actions: [],
  promptIsOpen: false,
  showPrompt: () => {},
  closePrompt: () => {},
});

export const PromptProvider = props => {
  const [prompt, setPrompt] = useState(null);

  const showPrompt = (title, message, actions) => {
    setPrompt({
      title: title,
      message: message,
      actions: actions,
    });
  };

  const closePrompt = () => {
    setPrompt(null);
  };

  return (
    <PromptContext.Provider
      value={{
        promptIsOpen: prompt?.title != null,
        title: prompt?.title,
        message: prompt?.message,
        actions: prompt?.actions,
        showPrompt,
        closePrompt,
      }}>
      {props.children}
    </PromptContext.Provider>
  );
};
