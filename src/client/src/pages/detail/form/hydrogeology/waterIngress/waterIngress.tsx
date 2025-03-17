import { FC } from "react";
import { useParams } from "react-router-dom";
import DataCards from "../../../../../components/dataCard/dataCards.js";
import { sortByDepth } from "../../sorter.jsx";
import { getWaterIngress, WaterIngress as WaterIngressType } from "./WaterIngress.ts";
import WaterIngressDisplay from "./waterIngressDisplay.js";
import WaterIngressInput from "./waterIngressInput.tsx";

const WaterIngress: FC = () => {
  const { id: boreholeId } = useParams<{ id: string }>();

  return (
    <DataCards
      parentId={parseInt(boreholeId)}
      getData={getWaterIngress}
      cyLabel="waterIngress"
      addLabel="addWaterIngress"
      emptyLabel="msgWateringressEmpty"
      renderInput={(props: { item: WaterIngressType; parentId: number }) => <WaterIngressInput {...props} />}
      renderDisplay={(props: { item: WaterIngressType }) => <WaterIngressDisplay {...props} />}
      sortDisplayed={(a, b) => {
        return sortByDepth(a, b, "fromDepthM", "toDepthM");
      }}
    />
  );
};
export default WaterIngress;
