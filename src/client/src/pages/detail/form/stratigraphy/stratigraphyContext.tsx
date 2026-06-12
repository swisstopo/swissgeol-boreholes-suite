import { createContext, FC, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useRef } from "react";
import { ApiError } from "../../../../api/apiInterfaces.ts";
import { Stratigraphy } from "../../../../api/generated";
import { SaveContext, SaveContextProps } from "../../saveContext.tsx";
import { LithologyTabContents, StratigraphyTabEdit, useUpdateStratigraphyWithContents } from "./stratigraphy.ts";

interface StratigraphyHeaderRegistration {
  getPayload: () => Stratigraphy;
  onSaveError: (error: ApiError) => void;
  reset: () => void;
}

interface LithologyTabRegistration {
  getPayload: () => LithologyTabContents;
  reset: () => void;
}

export interface StratigraphyContextProps {
  registerHeader: (registration: StratigraphyHeaderRegistration) => void;
  registerLithologyTab: (registration: LithologyTabRegistration | null) => void;
}

export const StratigraphyContext = createContext<StratigraphyContextProps>({
  registerHeader: () => {},
  registerLithologyTab: () => {},
});

export const StratigraphyProvider: FC<PropsWithChildren> = ({ children }) => {
  const {
    registerSaveHandler: registerOnSave,
    registerResetHandler: registerOnReset,
    unMount,
  } = useContext<SaveContextProps>(SaveContext);
  const { mutateAsync: updateStratigraphyWithContents } = useUpdateStratigraphyWithContents();
  const headerRef = useRef<StratigraphyHeaderRegistration | null>(null);
  const lithologyTabRef = useRef<LithologyTabRegistration | null>(null);

  const registerHeader = useCallback((registration: StratigraphyHeaderRegistration) => {
    headerRef.current = registration;
  }, []);

  const registerLithologyTab = useCallback((registration: LithologyTabRegistration | null) => {
    lithologyTabRef.current = registration;
  }, []);

  const onReset = useCallback(() => {
    headerRef.current?.reset();
    lithologyTabRef.current?.reset();
  }, []);

  const onSave = useCallback(async () => {
    const header = headerRef.current;
    // The header is always present on the stratigraphy page; without it there is nothing to save.
    if (!header) return false;

    const edit: StratigraphyTabEdit = {
      stratigraphy: header.getPayload(),
      lithologyTab: lithologyTabRef.current?.getPayload(),
    };
    try {
      await updateStratigraphyWithContents(edit);
      return true;
    } catch (error) {
      if (error instanceof ApiError) header.onSaveError(error);
      return false;
    }
  }, [updateStratigraphyWithContents]);

  useEffect(() => {
    registerOnSave(onSave);
    registerOnReset(onReset);
    return () => {
      unMount();
    };
  }, [registerOnSave, registerOnReset, onSave, onReset, unMount]);

  const contextValue = useMemo(
    () => ({ registerHeader, registerLithologyTab }),
    [registerHeader, registerLithologyTab],
  );

  return <StratigraphyContext.Provider value={contextValue}>{children}</StratigraphyContext.Provider>;
};
