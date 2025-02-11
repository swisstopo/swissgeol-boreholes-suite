import { createContext, FC, PropsWithChildren, useMemo, useState } from "react";

export interface SettingsHeaderContextProps {
  headerTitle: string;
  setHeaderTitle: (title: string) => void;
}

export const SettingsHeaderContext = createContext<SettingsHeaderContextProps>({
  headerTitle: "settings",
  setHeaderTitle: () => {},
});

export const SettingsHeaderProvider: FC<PropsWithChildren> = ({ children }) => {
  const [headerTitle, setHeaderTitle] = useState<string>("settings");
  return (
    <SettingsHeaderContext.Provider
      value={useMemo(() => ({ headerTitle, setHeaderTitle }), [headerTitle, setHeaderTitle])}>
      {children}
    </SettingsHeaderContext.Provider>
  );
};
