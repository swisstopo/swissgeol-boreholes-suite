import { createContext, FC, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useRef } from "react";
import { ApiError } from "../../../../api/apiInterfaces.ts";
import { SaveContext, SaveContextProps } from "../../saveContext.tsx";
import {
  LithologyTabContents,
  Stratigraphy,
  StratigraphyTabEdit,
  useUpdateStratigraphyWithContents,
} from "./stratigraphy.ts";

export interface StratigraphyContextProps {
  registerSaveHandler: (
    handler: SaveContributor,
    registeringComponent: RegisteringComponentType,
    onError?: SaveErrorHandler,
  ) => void;
  registerResetHandler: (handler: ResetHandler, registeringComponent: RegisteringComponentType) => void;
}

// Each editable part of the stratigraphy page contributes its slice of the combined save payload
// instead of saving itself, so the provider can persist the header and the active tab in one request.
type SavePayload = { stratigraphy?: Stratigraphy; lithology?: LithologyTabContents };
type SaveContributor = () => SavePayload;
type SaveErrorHandler = (error: ApiError) => void;
type ResetHandler = () => void;
type RegisteringComponentType = "stratigraphy" | "lithology";

interface SaveHandlerItem {
  handler: SaveContributor;
  registeringComponent: RegisteringComponentType;
  onError?: SaveErrorHandler;
}

interface ResetHandlerItem {
  handler: ResetHandler;
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
  const { mutateAsync: updateStratigraphyWithContents } = useUpdateStratigraphyWithContents();
  const saveHandlersRef = useRef<SaveHandlerItem[]>([]);
  const resetHandlersRef = useRef<ResetHandlerItem[]>([]);

  const registerSaveHandler = useCallback(
    (handler: SaveContributor, registeringComponent: RegisteringComponentType, onError?: SaveErrorHandler) => {
      const item: SaveHandlerItem = { handler, registeringComponent, onError };
      const exists = saveHandlersRef.current.some(h => h.registeringComponent === registeringComponent);
      if (exists) {
        saveHandlersRef.current = saveHandlersRef.current.map(h =>
          h.registeringComponent === registeringComponent ? item : h,
        );
      } else {
        saveHandlersRef.current.push(item);
      }
    },
    [],
  );

  const registerResetHandler = useCallback((handler: ResetHandler, registeringComponent: RegisteringComponentType) => {
    const exists = resetHandlersRef.current.some(h => h.registeringComponent === registeringComponent);
    if (exists) {
      resetHandlersRef.current = resetHandlersRef.current.map(h =>
        h.registeringComponent === registeringComponent ? { handler, registeringComponent } : h,
      );
    } else {
      resetHandlersRef.current.push({ handler, registeringComponent });
    }
  }, []);

  const onReset = useCallback(() => {
    for (const handlerItem of resetHandlersRef.current) {
      handlerItem.handler();
    }
  }, []);

  const onSave = useCallback(async () => {
    let stratigraphy: Stratigraphy | undefined;
    let lithology: LithologyTabContents | undefined;
    let stratigraphyOnError: SaveErrorHandler | undefined;

    for (const handlerItem of saveHandlersRef.current) {
      const payload = handlerItem.handler();
      if (payload.stratigraphy) {
        stratigraphy = payload.stratigraphy;
        stratigraphyOnError = handlerItem.onError;
      }
      if (payload.lithology) lithology = payload.lithology;
    }

    // The header is always present on the stratigraphy page; without it there is nothing to save.
    if (!stratigraphy) return false;

    const edit: StratigraphyTabEdit = { stratigraphy, lithologyTab: lithology };
    try {
      await updateStratigraphyWithContents(edit);
      return true;
    } catch (error) {
      if (error instanceof ApiError) stratigraphyOnError?.(error);
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

  const contextValue = useMemo(() => {
    return {
      registerSaveHandler,
      registerResetHandler,
    };
  }, [registerSaveHandler, registerResetHandler]);

  return <StratigraphyContext.Provider value={contextValue}>{children}</StratigraphyContext.Provider>;
};
