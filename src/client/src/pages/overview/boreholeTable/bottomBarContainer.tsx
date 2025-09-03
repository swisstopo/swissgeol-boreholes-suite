import { Dispatch, SetStateAction, useCallback, useContext, useLayoutEffect, useState } from "react";
import { GridRowSelectionModel, GridSortDirection, GridSortModel } from "@mui/x-data-grid";
import { deleteBoreholes } from "../../../api-lib";
import { Boreholes, Filters } from "../../../api-lib/ReduxStateInterfaces.ts";
import { copyBorehole } from "../../../api/borehole.ts";
import { useBoreholesNavigate } from "../../../hooks/useBoreholesNavigate.tsx";
import { OverViewContext } from "../overViewContext.tsx";
import { FilterContext } from "../sidePanelContent/filter/filterContext.tsx";
import { useUserWorkgroups } from "../UserWorkgroupsContext.tsx";
import { BoreholeTable } from "./boreholeTable.tsx";
import BottomBar from "./bottomBar.tsx";
import { BottomDrawer } from "./bottomDrawer.tsx";

interface BottomBarContainerProps {
  boreholes: Boreholes;
  filters: Filters;
  setHover: Dispatch<SetStateAction<number | null>>;
  loadEditingBoreholes: (
    page: number,
    limit: number,
    filter: Record<string, unknown>,
    orderby: string,
    direction: string,
    featureIds: number[],
  ) => void;
  multipleSelected: (selection: GridRowSelectionModel, filter: Record<string, unknown>) => void;
  rowsToHighlight: number[];
  selectionModel: GridRowSelectionModel;
  setSelectionModel: Dispatch<SetStateAction<GridRowSelectionModel>>;
  setIsExporting: Dispatch<SetStateAction<boolean>>;
}

const BottomBarContainer = ({
  boreholes,
  loadEditingBoreholes,
  multipleSelected,
  filters,
  setHover,
  rowsToHighlight,
  selectionModel,
  setSelectionModel,
  setIsExporting,
}: BottomBarContainerProps) => {
  const { navigateTo } = useBoreholesNavigate();
  const { featureIds } = useContext(FilterContext);
  const { bottomDrawerOpen } = useContext(OverViewContext);
  const { currentWorkgroupId } = useUserWorkgroups();

  const [isBusy, setIsBusy] = useState(false);
  const [paginationModel, setPaginationModel] = useState({
    pageSize: boreholes.limit ?? 100,
    page: boreholes.page ? boreholes.page - 1 : 0, // MUI pagination starts at 0, whereas server pagination starts at 1
  });
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
      filters.filter,
      sortModel[0]?.field || "alternate_name",
      sortModel[0]?.sort === "desc" ? "DESC" : "ASC",
      featureIds,
    );
  }, [paginationModel, filters, sortModel, loadEditingBoreholes, featureIds]);

  // LayoutEffect prevents cached table data to appear before reload
  useLayoutEffect(() => {
    reloadBoreholes();
  }, [reloadBoreholes]);

  const onCopyBorehole = useCallback(async () => {
    setIsBusy(true);
    const newBoreholeId = await copyBorehole(selectionModel, currentWorkgroupId);
    setIsBusy(false);
    navigateTo({ path: `/${newBoreholeId}` });
  }, [navigateTo, selectionModel, currentWorkgroupId]);

  const onDeleteMultiple = useCallback(async () => {
    setIsBusy(true);
    // @ts-expect-error legacy api calls not typed
    await deleteBoreholes(selectionModel).then(() => {
      reloadBoreholes();
    });
    setIsBusy(false);
  }, [reloadBoreholes, selectionModel]);

  return (
    <>
      <BottomBar
        selectionModel={selectionModel}
        multipleSelected={multipleSelected}
        onCopyBorehole={onCopyBorehole}
        onDeleteMultiple={onDeleteMultiple}
        filters={filters}
        boreholes={boreholes}
        setIsExporting={setIsExporting}
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
          rowsToHighlight={rowsToHighlight}
          setHover={setHover}
          isBusy={isBusy}
        />
      </BottomDrawer>
    </>
  );
};

export default BottomBarContainer;
