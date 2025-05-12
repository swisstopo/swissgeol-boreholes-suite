import { FC, useCallback } from "react";
import DataCards from "../../../../../components/dataCard/dataCards.js";
import { useRequiredParams } from "../../../../../hooks/useRequiredParams.ts";
import { sortByDepth } from "../../sorter.jsx";
import { getWaterIngress, WaterIngress as WaterIngressType } from "./WaterIngress.ts";
import WaterIngressDisplay from "./waterIngressDisplay.js";
import WaterIngressInput from "./waterIngressInput.tsx";

const WaterIngress: FC = () => {
  const { id: boreholeId } = useRequiredParams<{ id: string }>();
  const renderInput = useCallback(
    (props: { item: WaterIngressType; parentId: number }) => <WaterIngressInput {...props} />,
    [],
  );
  const renderDisplay = useCallback(
    (props: { item: WaterIngressType; editingEnabled: boolean }) => <WaterIngressDisplay {...props} />,
    [],
  );
  const sortDisplayed = useCallback(
    (a: WaterIngressType, b: WaterIngressType) => sortByDepth(a, b, "fromDepthM", "toDepthM"),
    [],
  );

  return (
    <DataCards<WaterIngressType>
      parentId={parseInt(boreholeId)}
      getData={getWaterIngress}
      cyLabel="waterIngress"
      addLabel="addWaterIngress"
      emptyLabel="msgWateringressEmpty"
      renderInput={renderInput}
      renderDisplay={renderDisplay}
      sortDisplayed={sortDisplayed}
    />
  );
};
export default WaterIngress;
