import { FC } from "react";
import { LithologyTable } from "../components/lithologyTable/lithologyTable.tsx";
import { useLithologyTableState } from "../components/lithologyTable/useLithologyTableState.ts";
import { FaciesDescription, LithologicalDescription, Lithology } from "../stratigraphy.ts";

interface LithologyPanelReadOnlyProps {
  stratigraphyId: number;
  lithologies: Lithology[];
  lithologicalDescriptions: LithologicalDescription[];
  faciesDescriptions: FaciesDescription[];
}

export const LithologyPanelReadOnly: FC<LithologyPanelReadOnlyProps> = ({
  stratigraphyId,
  lithologies,
  lithologicalDescriptions,
  faciesDescriptions,
}) => {
  const lithologyTableState = useLithologyTableState(
    lithologies,
    lithologicalDescriptions,
    faciesDescriptions,
    stratigraphyId,
  );

  return <LithologyTable state={lithologyTableState} readOnly />;
};
