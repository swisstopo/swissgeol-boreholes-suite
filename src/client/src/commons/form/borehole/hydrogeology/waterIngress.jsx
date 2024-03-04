import { getWaterIngress, addWaterIngress, updateWaterIngress, deleteWaterIngress } from "../../../../api/fetchApiV2";
import WaterIngressInput from "./waterIngressInput";
import WaterIngressDisplay from "./waterIngressDisplay";
import { DataCards } from "../../../../components/dataCard/dataCards";
import { sortByDepth } from "../../../sorter.jsx";

const WaterIngress = ({ isEditable, boreholeId }) => {
  return (
    <DataCards
      isEditable={isEditable}
      parentId={boreholeId}
      getData={getWaterIngress}
      addData={addWaterIngress}
      updateData={updateWaterIngress}
      deleteData={deleteWaterIngress}
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
