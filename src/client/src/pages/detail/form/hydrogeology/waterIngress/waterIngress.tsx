import { FC, useCallback } from "react";
import { WaterIngress as WaterIngressType } from "../../../../../api/generated";
import { DataCards } from "../../../../../components/dataCard/dataCards.js";
import { useRequiredId } from "../../../../../hooks/useRequiredId.ts";
import { sortByDepth } from "../../sorter.jsx";
import { getWaterIngress } from "./WaterIngress.ts";
import WaterIngressDisplay from "./waterIngressDisplay.js";
import WaterIngressInput from "./waterIngressInput.tsx";

const WaterIngress: FC = () => {
  const boreholeId = useRequiredId();
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
      parentId={boreholeId}
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
