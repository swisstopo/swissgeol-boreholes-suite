import { createContext, FC, PropsWithChildren, useMemo, useState } from "react";

export interface SettingsHeaderContextProps {
  headerTitle: string;
  setHeaderTitle: (title: string) => void;
  chipContent: string;
  setChipContent: (content: string) => void;
}

export const SettingsHeaderContext = createContext<SettingsHeaderContextProps>({
  headerTitle: "settings",
  setHeaderTitle: () => {},
  chipContent: "",
  setChipContent: () => {},
});

export const SettingsHeaderProvider: FC<PropsWithChildren> = ({ children }) => {
  const [headerTitle, setHeaderTitle] = useState<string>("settings");
  const [chipContent, setChipContent] = useState<string>("");
  return (
    <SettingsHeaderContext.Provider
      value={useMemo(
        () => ({ headerTitle, setHeaderTitle, chipContent, setChipContent }),
        [headerTitle, setHeaderTitle, chipContent, setChipContent],
      )}>
      {children}
    </SettingsHeaderContext.Provider>
  );
};
