import { getHydrotests } from "../../../../api/fetchApiV2";
import HydrotestInput from "./hydrotestInput";
import HydrotestDisplay from "./hydrotestDisplay";
import DataCards from "../../../../components/dataCard/dataCards";
import { sortByDepth } from "../../../sorter.jsx";

const Hydrotest = ({ isEditable, boreholeId }) => {
  return (
    <DataCards
      isEditable={isEditable}
      parentId={boreholeId}
      getData={getHydrotests}
      cyLabel="hydrotest"
      addLabel="addHydrotest"
      emptyLabel="msgHydrotestEmpty"
      renderInput={props => <HydrotestInput {...props} />}
      renderDisplay={props => <HydrotestDisplay {...props} />}
      sortDisplayed={(a, b) => {
        return sortByDepth(a, b, "fromDepthM", "toDepthM");
      }}
    />
  );
};
export default Hydrotest;
