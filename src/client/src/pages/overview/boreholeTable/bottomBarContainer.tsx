import { useCallback, useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { BoreholeTable } from "./boreholeTable.tsx";
import BottomBar from "./bottomBar.tsx";
import { BottomDrawer } from "./bottomDrawer.tsx";
import { GridRowSelectionModel, GridSortModel } from "@mui/x-data-grid";
import { Boreholes, ReduxRootState, User } from "../../../api-lib/ReduxStateInterfaces.ts";
import { FilterContext } from "../sidePanelContent/filter/filterContext.tsx";
import { deleteBoreholes } from "../../../api-lib";
import { copyBorehole } from "../../../api/fetchApiV2";

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
  const [isBusy, setIsBusy] = useState(false);
  const [bottomDrawerOpen, setBottomDrawerOpen] = useState(false);
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 100,
    page: 0,
  });
  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>([]);
  const [sortModel, setSortModel] = useState<GridSortModel>([
    {
      field: "original_name",
      sort: "desc",
    },
  ]);
  const { featureIds } = useContext(FilterContext);

  const history = useHistory();

  const user: User = useSelector((state: ReduxRootState) => state.core_user);

  const reloadBoreholes = useCallback(() => {
    loadEditingBoreholes(
      paginationModel.page + 1, // MUI Datagrid pagination starts at 0, whereas server pagination starts at 1
      paginationModel.pageSize,
      search.filter,
      sortModel[0]?.field || "",
      sortModel[0]?.sort === "asc" ? "ASC" : "DESC",
      featureIds,
    );
  }, [paginationModel, search, sortModel, loadEditingBoreholes, featureIds]);

  useEffect(() => {
    reloadBoreholes();
  }, [sortModel, paginationModel, search, loadEditingBoreholes, featureIds, reloadBoreholes]);

  const onCopyBorehole = async () => {
    setIsBusy(true);
    const workgroup = user.data.workgroups.filter(w => w.disabled === null && !w.supplier && w.roles.includes("EDIT"));
    const newBoreholeId = await copyBorehole(selectionModel, workgroup[0].id);
    setIsBusy(false);
    history.push(`/${newBoreholeId}/borehole`);
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
