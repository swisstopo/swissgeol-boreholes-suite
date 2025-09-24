import { createContext, FC, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useRef } from "react";
import { SaveContext, SaveContextProps } from "../../saveContext.tsx";

export interface StratigraphyContextProps {
  registerSaveHandler: (handler: SaveHandler) => void;
  registerResetHandler: (handler: ResetHandler) => void;
}

type SaveHandler = () => Promise<boolean>;
type ResetHandler = () => void;

export const StratigraphyContext = createContext<StratigraphyContextProps>({
  registerSaveHandler: () => {},
  registerResetHandler: () => {},
});

export const StratigraphyProvider: FC<PropsWithChildren> = ({ children }) => {
  const {
    registerSaveHandler: registerOnSave,
    registerResetHandler: registerOnReset,
    unMount,
  } = useContext<SaveContextProps>(SaveContext);
  const saveHandlersRef = useRef<SaveHandler[]>([]);
  const resetHandlersRef = useRef<ResetHandler[]>([]);

  const registerSaveHandler = useCallback((handler: SaveHandler) => {
    // only register one saveHandler of the same type
    const idx = saveHandlersRef.current.findIndex(h => h === handler);
    if (idx === -1) {
      saveHandlersRef.current.push(handler);
    }
  }, []);

  const registerResetHandler = useCallback((handler: ResetHandler) => {
    // only register one resetHandler of the same type
    const idx = resetHandlersRef.current.findIndex(h => h === handler);
    if (idx === -1) {
      resetHandlersRef.current.push(handler);
    }
  }, []);

  const onReset = useCallback(() => {
    for (const handler of resetHandlersRef.current) {
      handler();
    }
  }, []);

  const onSave = useCallback(async () => {
    for (const handler of saveHandlersRef.current) {
      const result = await handler();
      if (!result) return false;
    }
    return true;
  }, []);

  useEffect(() => {
    registerOnSave(onSave);
    registerOnReset(onReset);
    return () => {
      unMount();
    };
  }, [registerOnSave, registerOnReset, onSave, onReset, unMount]);

  const contextValue = useMemo(() => {
    return {
      registerSaveHandler,
      registerResetHandler,
    };
  }, [registerSaveHandler, registerResetHandler]);

  return <StratigraphyContext.Provider value={contextValue}>{children}</StratigraphyContext.Provider>;
};
