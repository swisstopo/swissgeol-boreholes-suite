import { useCallback } from "react";
import DataCards from "../../../../../components/dataCard/dataCards";
import { useRequiredParams } from "../../../../../hooks/useRequiredParams.ts";
import { sortByDepth } from "../../sorter.jsx";
import { getHydrotests, Hydrotest as HydrotestType } from "./Hydrotest";
import { HydrotestDisplay } from "./hydrotestDisplay";
import { HydrotestInput } from "./hydrotestInput";

const Hydrotest = () => {
  const { id: boreholeId } = useRequiredParams<{ id: string }>();
  const renderInput = useCallback(
    (props: { item: HydrotestType; parentId: number }) => <HydrotestInput {...props} />,
    [],
  );
  const renderDisplay = useCallback(
    (props: { item: HydrotestType; editingEnabled: boolean }) => <HydrotestDisplay {...props} />,
    [],
  );
  const sortDisplayed = useCallback(
    (a: HydrotestType, b: HydrotestType) => sortByDepth(a, b, "fromDepthM", "toDepthM"),
    [],
  );

  return (
    <DataCards<HydrotestType>
      parentId={parseInt(boreholeId)}
      getData={getHydrotests}
      cyLabel="hydrotest"
      addLabel="addHydrotest"
      emptyLabel="msgHydrotestEmpty"
      renderInput={renderInput}
      renderDisplay={renderDisplay}
      sortDisplayed={sortDisplayed}
    />
  );
};
export default Hydrotest;
