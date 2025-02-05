import { createContext, FC, PropsWithChildren, useMemo, useState } from "react";

export interface SettingsHeaderContextProps {
  title: string;
  setTitle: (editingEnabled: string) => void;
  chipContent: string;
  setChipContent: (chipContent: string) => void;
}

export const SettingsHeaderContext = createContext<SettingsHeaderContextProps>({
  title: "",
  setTitle: () => {},
  chipContent: "",
  setChipContent: () => {},
});

export const SettingsHeaderProvider: FC<PropsWithChildren> = ({ children }) => {
  const [title, setTitle] = useState<string>("");
  const [chipContent, setChipContent] = useState<string>("");
  return (
    <SettingsHeaderContext.Provider
      value={useMemo(
        () => ({ title, setTitle, chipContent, setChipContent }),
        [title, setTitle, chipContent, setChipContent],
      )}>
      {children}
    </SettingsHeaderContext.Provider>
  );
};
