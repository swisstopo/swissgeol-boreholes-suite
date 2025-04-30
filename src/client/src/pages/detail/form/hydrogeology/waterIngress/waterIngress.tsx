import { FC } from "react";
import DataCards from "../../../../../components/dataCard/dataCards.js";
import { useRequiredParams } from "../../../../../hooks/useRequiredParams.ts";
import { sortByDepth } from "../../sorter.jsx";
import { getWaterIngress, WaterIngress as WaterIngressType } from "./WaterIngress.ts";
import WaterIngressDisplay from "./waterIngressDisplay.js";
import WaterIngressInput from "./waterIngressInput.tsx";

const WaterIngress: FC = () => {
  const { id: boreholeId } = useRequiredParams<{ id: string }>();

  return (
    <DataCards<WaterIngressType>
      parentId={parseInt(boreholeId)}
      getData={getWaterIngress}
      cyLabel="waterIngress"
      addLabel="addWaterIngress"
      emptyLabel="msgWateringressEmpty"
      renderInput={props => <WaterIngressInput {...props} />}
      renderDisplay={props => <WaterIngressDisplay {...props} />}
      sortDisplayed={(a, b) => {
        return sortByDepth(a, b, "fromDepthM", "toDepthM");
      }}
    />
  );
};
export default WaterIngress;
