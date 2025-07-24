import { createContext, FC, PropsWithChildren, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useReloadBoreholes } from "../../api/borehole.ts";

export interface SaveContextProps {
  showSaveBar: boolean;
  showSaveFeedback: boolean;
  hasChanges: boolean;
  markAsChanged: (hasChanges: boolean) => void;
  registerSaveHandler: (handler: SaveHandler) => void;
  triggerSave: () => void;
  registerResetHandler: (handler: ResetHandler) => void;
  triggerReset: () => void;
  unMount: () => void;
}

type SaveHandler = () => Promise<boolean>;
type ResetHandler = () => void;

export const SaveContext = createContext<SaveContextProps>({
  showSaveBar: false,
  showSaveFeedback: false,
  hasChanges: false,
  markAsChanged: () => {},
  registerSaveHandler: () => {},
  triggerSave: () => {},
  registerResetHandler: () => {},
  triggerReset: () => {},
  unMount: () => {},
});

export const SaveProvider: FC<PropsWithChildren> = ({ children }) => {
  const location = useLocation();
  const [hasChanges, setHasChanges] = useState(false);
  const [showSaveFeedback, setShowSaveFeedback] = useState(false);
  const saveHandlerRef = useRef<SaveHandler | null>(null);
  const resetHandlerRef = useRef<ResetHandler | null>(null);
  const [hasSaveHandler, setHasSaveHandler] = useState(false);
  const [hasResetHandler, setHasResetHandler] = useState(false);
  const reloadBoreholes = useReloadBoreholes();

  const showSaveBar = useMemo(() => {
    return hasSaveHandler && hasResetHandler;
  }, [hasSaveHandler, hasResetHandler]);

  const markAsChanged = useCallback((hasChanged: boolean) => {
    setHasChanges(hasChanged);
  }, []);

  const registerSaveHandler = useCallback((handler: SaveHandler) => {
    saveHandlerRef.current = handler;
    setHasSaveHandler(true);
  }, []);

  const triggerSave = useCallback(async () => {
    if (saveHandlerRef.current) {
      const success = await saveHandlerRef.current();
      if (success) {
        setShowSaveFeedback(true);
        reloadBoreholes();
        setTimeout(() => setShowSaveFeedback(false), 4000);
        setHasChanges(false);
      }
    }
  }, [reloadBoreholes]);

  const registerResetHandler = useCallback((handler: ResetHandler) => {
    resetHandlerRef.current = handler;
    setHasResetHandler(true);
  }, []);

  const triggerReset = useCallback(async () => {
    if (resetHandlerRef.current) {
      resetHandlerRef.current();
      setHasChanges(false);
    }
  }, []);

  const unMount = useCallback(() => {
    saveHandlerRef.current = null;
    setHasSaveHandler(false);
    resetHandlerRef.current = null;
    setHasResetHandler(false);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === "s") {
        event.preventDefault();
        triggerSave();
      }
    };
    if (showSaveBar && hasChanges) {
      window.addEventListener("keydown", handleKeyDown);
    } else {
      window.removeEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [hasChanges, showSaveBar, triggerSave]);

  useEffect(() => {
    setShowSaveFeedback(false);
  }, [location.pathname]);

  const contextValue = useMemo(() => {
    return {
      showSaveBar,
      showSaveFeedback,
      hasChanges,
      markAsChanged,
      registerSaveHandler,
      triggerSave,
      registerResetHandler,
      triggerReset,
      unMount,
    };
  }, [
    hasChanges,
    markAsChanged,
    registerResetHandler,
    registerSaveHandler,
    showSaveBar,
    showSaveFeedback,
    triggerReset,
    triggerSave,
    unMount,
  ]);

  return <SaveContext.Provider value={contextValue}>{children}</SaveContext.Provider>;
};
