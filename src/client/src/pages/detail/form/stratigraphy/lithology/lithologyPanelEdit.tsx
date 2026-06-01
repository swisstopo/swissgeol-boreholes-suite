import { FC, useCallback, useContext, useEffect } from "react";
import { SaveContext } from "../../../saveContext.tsx";
import { LithologyTable } from "../components/lithologyTable/lithologyTable.tsx";
import { prepareDataForSubmit } from "../components/lithologyTable/lithologyTableUtils.ts";
import { useLithologyTableState } from "../components/lithologyTable/useLithologyTableState.ts";
import { FaciesDescription, LithologicalDescription, Lithology, useUpdateLithologyContents } from "../stratigraphy.ts";
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
  const { markAsChanged, markHasErrors } = useContext(SaveContext);
  const { registerSaveHandler, registerResetHandler } = useContext<StratigraphyContextProps>(StratigraphyContext);

  const { mutateAsync: updateContents } = useUpdateLithologyContents();

  const lithologyTableState = useLithologyTableState(
    lithologies,
    lithologicalDescriptions,
    faciesDescriptions,
    stratigraphyId,
  );

  useEffect(() => {
    markAsChanged(lithologyTableState.hasUnsavedChanges);
  }, [lithologyTableState.hasUnsavedChanges, markAsChanged]);

  useEffect(() => {
    markHasErrors(lithologyTableState.hasErrors);
  }, [lithologyTableState.hasErrors, markHasErrors]);

  const onSave = useCallback(async () => {
    await updateContents({
      stratigraphyId,
      contents: {
        lithologies: lithologyTableState.tmpLithologies.map(prepareDataForSubmit),
        lithologicalDescriptions: lithologyTableState.tmpLithologicalDescriptions.map(prepareDataForSubmit),
        faciesDescriptions: lithologyTableState.tmpFaciesDescriptions.map(prepareDataForSubmit),
      },
    });
    return true;
  }, [lithologyTableState, updateContents, stratigraphyId]);

  const onReset = useCallback(() => {
    lithologyTableState.reset();
  }, [lithologyTableState]);

  useEffect(() => {
    registerSaveHandler(onSave, "lithology");
    registerResetHandler(onReset, "lithology");
  }, [onSave, onReset, registerSaveHandler, registerResetHandler]);

  return <LithologyTable state={lithologyTableState} />;
};
