import {
  createContext,
  Dispatch,
  FC,
  PropsWithChildren,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation } from "react-router";

/**
 * What a long running save is currently doing. `message` stays put while `hint` carries the
 * detail that keeps changing, so the line the user reads first does not move.
 */
interface SaveProgress {
  message: string;
  hint?: string;

  /** Gives up on the running save. Only set by a save that can actually be stopped. */
  onCancel?: () => void;
}

export interface SaveContextProps {
  showSaveBar: boolean;
  showSaveFeedback: boolean;
  hasChanges: boolean;
  hasErrors: boolean;
  isSaving: boolean;
  saveProgress: SaveProgress | null;
  setSaveProgress: Dispatch<SetStateAction<SaveProgress | null>>;
  setHasChanges: Dispatch<SetStateAction<boolean>>;
  setHasErrors: Dispatch<SetStateAction<boolean>>;
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
  hasErrors: false,
  isSaving: false,
  saveProgress: null,
  setSaveProgress: () => {},
  setHasChanges: () => {},
  setHasErrors: () => {},
  registerSaveHandler: () => {},
  triggerSave: () => {},
  registerResetHandler: () => {},
  triggerReset: () => {},
  unMount: () => {},
});

export const SaveProvider: FC<PropsWithChildren> = ({ children }) => {
  const location = useLocation();
  const [hasChanges, setHasChanges] = useState(false);
  const [hasErrors, setHasErrors] = useState(false);
  const [showSaveFeedback, setShowSaveFeedback] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveProgress, setSaveProgress] = useState<SaveProgress | null>(null);
  const saveHandlerRef = useRef<SaveHandler | null>(null);
  const resetHandlerRef = useRef<ResetHandler | null>(null);
  const [hasSaveHandler, setHasSaveHandler] = useState(false);
  const [hasResetHandler, setHasResetHandler] = useState(false);

  const showSaveBar = useMemo(() => {
    return hasSaveHandler && hasResetHandler;
  }, [hasSaveHandler, hasResetHandler]);

  const registerSaveHandler = useCallback((handler: SaveHandler) => {
    saveHandlerRef.current = handler;
    setHasSaveHandler(true);
  }, []);

  const triggerSave = useCallback(async () => {
    if (hasErrors) return;

    // A save can also be asked for by the keyboard shortcut, which the overlay shown while one
    // runs does not cover: it takes pointer events, and the shortcut listens on the window. A
    // second save would send the changes of the first a second time and leave it running with
    // nothing able to stop it, because it takes over what the cancel button reaches.
    if (isSaving) return;

    if (saveHandlerRef.current) {
      setIsSaving(true);
      try {
        const success = await saveHandlerRef.current();
        if (success) {
          setShowSaveFeedback(true);
          setTimeout(() => setShowSaveFeedback(false), 4000);
          setHasChanges(false);
        }
      } finally {
        setIsSaving(false);
        setSaveProgress(null);
      }
    }
  }, [hasErrors, isSaving]);

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
    setHasErrors(false);
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
      hasErrors,
      isSaving,
      saveProgress,
      setSaveProgress,
      setHasChanges,
      setHasErrors,
      registerSaveHandler,
      triggerSave,
      registerResetHandler,
      triggerReset,
      unMount,
    };
  }, [
    hasChanges,
    hasErrors,
    isSaving,
    saveProgress,
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
