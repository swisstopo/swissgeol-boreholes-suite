import DataCards from "../../../../../components/dataCard/dataCards";
import { useRequiredParams } from "../../../../../hooks/useRequiredParams.ts";
import { sortByDepth } from "../../sorter.jsx";
import { getHydrotests, Hydrotest as HydrotestType } from "./Hydrotest";
import { HydrotestDisplay } from "./hydrotestDisplay";
import { HydrotestInput } from "./hydrotestInput";

const Hydrotest = () => {
  const { id: boreholeId } = useRequiredParams<{ id: string }>();

  return (
    <DataCards<HydrotestType>
      parentId={parseInt(boreholeId)}
      getData={getHydrotests}
      cyLabel="hydrotest"
      addLabel="addHydrotest"
      emptyLabel="msgHydrotestEmpty"
      renderInput={props => <HydrotestInput {...props} />}
      renderDisplay={props => <HydrotestDisplay {...props} />}
      sortDisplayed={(a, b) => sortByDepth(a, b, "fromDepthM", "toDepthM")}
    />
  );
};
export default Hydrotest;
