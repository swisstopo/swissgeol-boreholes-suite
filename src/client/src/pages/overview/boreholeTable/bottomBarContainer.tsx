import React, { useCallback, useContext, useLayoutEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { BoreholeTable } from "./boreholeTable.tsx";
import BottomBar from "./bottomBar.tsx";
import { BottomDrawer } from "./bottomDrawer.tsx";
import { GridRowSelectionModel, GridSortDirection, GridSortModel } from "@mui/x-data-grid";
import { Boreholes, ReduxRootState, User } from "../../../api-lib/ReduxStateInterfaces.ts";
import { FilterContext } from "../sidePanelContent/filter/filterContext.tsx";
import { deleteBoreholes } from "../../../api-lib";
import { copyBorehole } from "../../../api/fetchApiV2";
import { useSelector } from "react-redux";
import { TableContext } from "../tableContext.tsx";

interface BottomBarContainerProps {
  boreholes: Boreholes;
  search: { filter: string };
  setHover: React.Dispatch<React.SetStateAction<number | null>>;
  loadEditingBoreholes: (
    page: number,
    limit: number,
    filter: string,
    orderby: string,
    direction: string,
    featureIds: number[],
  ) => void;
  multipleSelected: (selection: GridRowSelectionModel, filter: string) => void;
  rowToHighlight: number | null;
}

const BottomBarContainer = ({
  boreholes,
  loadEditingBoreholes,
  multipleSelected,
  search,
  setHover,
  rowToHighlight,
}: BottomBarContainerProps) => {
  const user: User = useSelector((state: ReduxRootState) => state.core_user);
  const history = useHistory();
  const { featureIds } = useContext(FilterContext);
  const { bottomDrawerOpen } = useContext(TableContext);
  const [workgroupId, setWorkgroupId] = useState<number | null>(user.data.workgroups[0]?.id);
  const [isBusy, setIsBusy] = useState(false);
  const [paginationModel, setPaginationModel] = useState({
    pageSize: boreholes.limit ?? 100,
    page: boreholes.page ? boreholes.page - 1 : 0, // MUI pagination starts at 0, whereas server pagination starts at 1
  });
  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>([]);
  const [sortModel, setSortModel] = useState<GridSortModel>([
    {
      field: boreholes.orderby ?? "alternate_name",
      sort: boreholes.direction ? (boreholes.direction.toLowerCase() as GridSortDirection) : "asc",
    },
  ]);

  const reloadBoreholes = useCallback(() => {
    loadEditingBoreholes(
      paginationModel.page + 1, // MUI pagination starts at 0, whereas server pagination starts at 1
      paginationModel.pageSize,
      search.filter,
      sortModel[0]?.field || "alternate_name",
      sortModel[0]?.sort === "desc" ? "DESC" : "ASC",
      featureIds,
    );
  }, [paginationModel, search, sortModel, loadEditingBoreholes, featureIds]);

  // Layouteffect prevents cached table data to appear before reload
  useLayoutEffect(() => {
    reloadBoreholes();
  }, [reloadBoreholes]);

  const onCopyBorehole = async () => {
    setIsBusy(true);
    const newBoreholeId = await copyBorehole(selectionModel, workgroupId);
    setIsBusy(false);
    history.push(`/${newBoreholeId}`);
  };

  const onDeleteMultiple = async () => {
    setIsBusy(true);
    // @ts-expect-error legacy api calls not typed
    await deleteBoreholes(selectionModel).then(() => {
      reloadBoreholes();
    });
    setIsBusy(false);
  };

  return (
    <>
      <BottomBar
        selectionModel={selectionModel}
        multipleSelected={multipleSelected}
        onCopyBorehole={onCopyBorehole}
        onDeleteMultiple={onDeleteMultiple}
        search={search}
        boreholes={boreholes}
        workgroup={workgroupId}
        setWorkgroup={setWorkgroupId}
      />
      <BottomDrawer drawerOpen={bottomDrawerOpen}>
        <BoreholeTable
          boreholes={boreholes}
          paginationModel={paginationModel}
          setPaginationModel={setPaginationModel}
          selectionModel={selectionModel}
          setSelectionModel={setSelectionModel}
          sortModel={sortModel}
          setSortModel={setSortModel}
          rowToHighlight={rowToHighlight}
          setHover={setHover}
          isBusy={isBusy}
        />
      </BottomDrawer>
    </>
  );
};

export default BottomBarContainer;
