import { FC, useCallback, useContext, useEffect } from "react";
import { SaveContext } from "../../../saveContext.tsx";
import { LithologyTable } from "../components/lithologyTable/lithologyTable.tsx";
import { prepareDataForSubmit } from "../components/lithologyTable/lithologyTableUtils.ts";
import { useLithologyTableState } from "../components/lithologyTable/useLithologyTableState.ts";
import { FaciesDescription, LithologicalDescription, Lithology } from "../stratigraphy.ts";
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
  const { registerSaveHandler, registerResetHandler } = useContext<StratigraphyContextProps>(StratigraphyContext);

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
    () => ({
      lithology: {
        lithologies: lithologyTableState.tmpLithologies.map(prepareDataForSubmit),
        lithologicalDescriptions: lithologyTableState.tmpLithologicalDescriptions.map(prepareDataForSubmit),
        faciesDescriptions: lithologyTableState.tmpFaciesDescriptions.map(prepareDataForSubmit),
      },
    }),
    [lithologyTableState],
  );

  const onReset = useCallback(() => {
    lithologyTableState.reset();
  }, [lithologyTableState]);

  useEffect(() => {
    registerSaveHandler(getPayload, "lithology");
    registerResetHandler(onReset, "lithology");
  }, [getPayload, onReset, registerSaveHandler, registerResetHandler]);

  return <LithologyTable state={lithologyTableState} />;
};
