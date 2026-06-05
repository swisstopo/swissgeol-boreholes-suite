import { FC, useCallback, useContext, useEffect } from "react";
import { SaveContext } from "../../../saveContext.tsx";
import { LithologyTable } from "../components/lithologyTable/lithologyTable.tsx";
import { prepareDataForSubmit } from "../components/lithologyTable/lithologyTableUtils.ts";
import { useLithologyTableState } from "../components/lithologyTable/useLithologyTableState.ts";
import { FaciesDescription, LithologicalDescription, Lithology, LithologyTabContents } from "../stratigraphy.ts";
import { StratigraphyContext, StratigraphyContextProps } from "../stratigraphyContext.tsx";

interface LithologyPanelEditProps {
  stratigraphyId: number;
  lithologies: Lithology[];
  lithologicalDescriptions: LithologicalDescription[];
  faciesDescriptions: FaciesDescription[];
}

export const LithologyPanelEdit: FC<LithologyPanelEditProps> = ({
  stratigraphyId,
  lithologies,
  lithologicalDescriptions,
  faciesDescriptions,
}) => {
  const { setHasChanges, setHasErrors } = useContext(SaveContext);
  const { registerLithologyTab } = useContext<StratigraphyContextProps>(StratigraphyContext);

  const lithologyTableState = useLithologyTableState(
    lithologies,
    lithologicalDescriptions,
    faciesDescriptions,
    stratigraphyId,
  );

  useEffect(() => {
    setHasChanges(lithologyTableState.hasUnsavedChanges);
  }, [lithologyTableState.hasUnsavedChanges, setHasChanges]);

  useEffect(() => {
    setHasErrors(lithologyTableState.hasErrors);
  }, [lithologyTableState.hasErrors, setHasErrors]);

  const getPayload = useCallback(
    (): LithologyTabContents => ({
      lithologies: lithologyTableState.tmpLithologies.map(prepareDataForSubmit),
      lithologicalDescriptions: lithologyTableState.tmpLithologicalDescriptions.map(prepareDataForSubmit),
      faciesDescriptions: lithologyTableState.tmpFaciesDescriptions.map(prepareDataForSubmit),
    }),
    [lithologyTableState],
  );

  const onReset = useCallback(() => {
    lithologyTableState.reset();
  }, [lithologyTableState]);

  useEffect(() => {
    registerLithologyTab({ getPayload, reset: onReset });
    return () => registerLithologyTab(null);
  }, [getPayload, onReset, registerLithologyTab]);

  return <LithologyTable state={lithologyTableState} />;
};
