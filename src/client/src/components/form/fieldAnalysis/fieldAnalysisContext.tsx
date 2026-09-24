import { createContext, FC, PropsWithChildren, useContext, useMemo } from "react";
import { FieldChange } from "./fieldAnalysis.ts";

interface FieldAnalysisContextProps {
  changeByPath: Map<string, FieldChange>;
  onResetField: (path: string) => void;
}

/**
 * Undefined by default on purpose: a form component outside a provider must behave exactly as it
 * did before this feature existed.
 */
const FieldAnalysisContext = createContext<FieldAnalysisContextProps | undefined>(undefined);

interface FieldAnalysis {
  change: FieldChange;
  reset: () => void;
}

export const FieldAnalysisProvider: FC<PropsWithChildren<FieldAnalysisContextProps>> = ({
  changeByPath,
  onResetField,
  children,
}) => {
  const value = useMemo(() => ({ changeByPath, onResetField }), [changeByPath, onResetField]);
  return <FieldAnalysisContext.Provider value={value}>{children}</FieldAnalysisContext.Provider>;
};

/**
 * The pending analysis change for one form field, or undefined when the field was not written by an
 * analysis or no analysis is running.
 * @param fieldName The field's react-hook-form path, which is what the form components already hold.
 */
export const useFieldAnalysis = (fieldName: string): FieldAnalysis | undefined => {
  const context = useContext(FieldAnalysisContext);
  const change = context?.changeByPath.get(fieldName);
  const onResetField = context?.onResetField;

  return useMemo(
    () => (change && onResetField ? { change, reset: () => onResetField(change.path) } : undefined),
    [change, onResetField],
  );
};
