import { createContext, FC, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useRef } from "react";
import { SaveContext, SaveContextProps } from "../../saveContext.tsx";

export interface StratigraphyContextProps {
  registerSaveHandler: (handler: SaveHandler, registeringComponent: RegisteringComponentType) => void;
  registerResetHandler: (handler: ResetHandler, registeringComponent: RegisteringComponentType) => void;
}

type SaveHandler = () => Promise<boolean>;
type ResetHandler = () => void;
type RegisteringComponentType = "stratigraphy" | "lithology";

interface HandlerItem<T> {
  handler: T;
  registeringComponent: RegisteringComponentType;
}

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
  const saveHandlersRef = useRef<HandlerItem<SaveHandler>[]>([]);
  const resetHandlersRef = useRef<HandlerItem<ResetHandler>[]>([]);

  const registerSaveHandler = useCallback((handler: SaveHandler, registeringComponent: RegisteringComponentType) => {
    const exists = saveHandlersRef.current.some(h => h.registeringComponent === registeringComponent);
    if (!exists) {
      saveHandlersRef.current.push({ handler, registeringComponent });
    } else {
      saveHandlersRef.current = saveHandlersRef.current.map(h =>
        h.registeringComponent === registeringComponent ? { handler, registeringComponent } : h,
      );
    }
  }, []);

  const registerResetHandler = useCallback((handler: ResetHandler, registeringComponent: RegisteringComponentType) => {
    const exists = resetHandlersRef.current.some(h => h.registeringComponent === registeringComponent);
    if (!exists) {
      resetHandlersRef.current.push({ handler, registeringComponent });
    } else {
      resetHandlersRef.current = resetHandlersRef.current.map(h =>
        h.registeringComponent === registeringComponent ? { handler, registeringComponent } : h,
      );
    }
  }, []);

  const onReset = useCallback(() => {
    for (const handlerItem of resetHandlersRef.current) {
      handlerItem.handler();
    }
  }, []);

  const onSave = useCallback(async () => {
    for (const handlerItem of saveHandlersRef.current) {
      const result = await handlerItem.handler();
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
