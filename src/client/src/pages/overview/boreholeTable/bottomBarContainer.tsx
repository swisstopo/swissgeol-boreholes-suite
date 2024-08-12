import { useCallback, useContext, useEffect, useState } from "react";
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

interface BottomBarContainerProps {
  boreholes: Boreholes;
  search: { filter: string };
  loadEditingBoreholes: (
    page: number,
    limit: number,
    filter: string,
    orderby: string,
    direction: string,
    featureIds: number[],
  ) => void;
  multipleSelected: (selection: GridRowSelectionModel, filter: string) => void;
  onHover: (id: string | null) => void;
  rowToHighlight: number | null;
}

const BottomBarContainer = ({
  boreholes,
  loadEditingBoreholes,
  multipleSelected,
  search,
  onHover,
  rowToHighlight,
}: BottomBarContainerProps) => {
  const user: User = useSelector((state: ReduxRootState) => state.core_user);
  const history = useHistory();
  const { featureIds } = useContext(FilterContext);
  const [workgroupId, setWorkgroupId] = useState<number | null>(user.data.workgroups[0]?.id);
  const [isBusy, setIsBusy] = useState(false);
  const [bottomDrawerOpen, setBottomDrawerOpen] = useState(false);
  const [paginationModel, setPaginationModel] = useState({
    pageSize: boreholes.limit ?? 100,
    page: boreholes.page ? boreholes.page - 1 : 0, // MUI pagination starts at 0, whereas server pagination starts at 1
  });
  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>([]);
  const [sortModel, setSortModel] = useState<GridSortModel>([
    {
      field: boreholes.orderby ?? "original_name",
      sort: boreholes.direction ? (boreholes.direction.toLowerCase() as GridSortDirection) : "asc",
    },
  ]);

  const reloadBoreholes = useCallback(() => {
    loadEditingBoreholes(
      paginationModel.page + 1, // MUI pagination starts at 0, whereas server pagination starts at 1
      paginationModel.pageSize,
      search.filter,
      sortModel[0]?.field || "original_name",
      sortModel[0]?.sort === "desc" ? "DESC" : "ASC",
      featureIds,
    );
  }, [paginationModel, search, sortModel, loadEditingBoreholes, featureIds]);

  useEffect(() => {
    reloadBoreholes();
  }, [sortModel, paginationModel, search, loadEditingBoreholes, featureIds, reloadBoreholes]);

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

  const toggleBottomDrawer = () => {
    setBottomDrawerOpen(!bottomDrawerOpen);
  };

  return (
    <>
      <BottomBar
        toggleBottomDrawer={toggleBottomDrawer}
        bottomDrawerOpen={bottomDrawerOpen}
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
          onHover={onHover}
          isBusy={isBusy}
        />
      </BottomDrawer>
    </>
  );
};

export default BottomBarContainer;
