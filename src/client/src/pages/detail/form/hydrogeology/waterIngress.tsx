import { FC } from "react";
import { useParams } from "react-router-dom";
import { getWaterIngress } from "../../../../api/fetchApiV2.js";
import DataCards from "../../../../components/dataCard/dataCards.jsx";
import { sortByDepth } from "../sorter.jsx";
import { WaterIngress as WaterIngressType } from "./Observation.ts";
import WaterIngressDisplay from "./waterIngressDisplay.js";
import WaterIngressInput from "./waterIngressInput.tsx";

const WaterIngress: FC = () => {
  const { id: boreholeId } = useParams<{ id: string }>();

  return (
    <DataCards
      parentId={boreholeId}
      getData={getWaterIngress}
      cyLabel="waterIngress"
      addLabel="addWaterIngress"
      emptyLabel="msgWaterIngressesEmpty"
      renderInput={(props: { item: WaterIngressType; parentId: number }) => <WaterIngressInput {...props} />}
      renderDisplay={(props: { item: WaterIngressType }) => <WaterIngressDisplay {...props} />}
      sortDisplayed={(a: object, b: object) => {
        return sortByDepth(a, b, "fromDepthM", "toDepthM");
      }}
    />
  );
};
export default WaterIngress;
