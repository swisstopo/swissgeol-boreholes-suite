import { useParams } from "react-router-dom";
import { getHydrotests } from "../../../../api/fetchApiV2.js";
import DataCards from "../../../../components/dataCard/dataCards.jsx";
import { sortByDepth } from "../sorter.jsx";
import HydrotestDisplay from "./hydrotestDisplay";
import HydrotestInput from "./hydrotestInput";

const Hydrotest = () => {
  const { id: boreholeId } = useParams();

  return (
    <DataCards
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
