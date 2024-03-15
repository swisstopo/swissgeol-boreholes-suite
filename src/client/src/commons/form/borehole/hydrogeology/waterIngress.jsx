import { getWaterIngress } from "../../../../api/fetchApiV2";
import WaterIngressInput from "./waterIngressInput";
import WaterIngressDisplay from "./waterIngressDisplay";
import DataCards from "../../../../components/dataCard/dataCards";
import { sortByDepth } from "../../../sorter.jsx";

const WaterIngress = ({ isEditable, boreholeId }) => {
  return (
    <DataCards
      isEditable={isEditable}
      parentId={boreholeId}
      getData={getWaterIngress}
      cyLabel="waterIngress"
      addLabel="addWaterIngress"
      emptyLabel="msgWateringressesEmpty"
      renderInput={props => <WaterIngressInput {...props} />}
      renderDisplay={props => <WaterIngressDisplay {...props} />}
      sortDisplayed={(a, b) => {
        return sortByDepth(a, b, "fromDepthM", "toDepthM");
      }}
    />
  );
};
export default WaterIngress;
