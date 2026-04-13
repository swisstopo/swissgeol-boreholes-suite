import { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Stack } from "@mui/material";
import { GridPaginationModel, GridRowSelectionModel, GridSortModel } from "@mui/x-data-grid";
import { EditorStore, ReduxRootState, Setting } from "../../../api-lib/ReduxStateInterfaces.ts";
import { FilterRequest, FilterResponse, useFilterBoreholes, useReloadBoreholes } from "../../../api/borehole.ts";
import { BulkEditDialog } from "../../../components/bulkedit/bulkEditDialog.js";
import { ExportDialog } from "../../../components/export/exportDialog.tsx";
import MapComponent from "../../../components/map/mapComponent.jsx";
import { useBoreholesNavigate } from "../../../hooks/useBoreholesNavigate.tsx";
import BottomBarContainer from "../boreholeTable/bottomBarContainer";
import { PolygonFilterContext } from "../sidePanelContent/filter/polygonFilterContext.tsx";
import { useBoreholeUrlParams } from "../useBoreholeUrlParams.ts";

interface MapViewProps {
  displayErrorMessage: (message: string) => void;
}

export const MapView = ({ displayErrorMessage }: MapViewProps) => {
  const [hover, setHover] = useState<number | null>(null);
  const [rowsToHighlight, setRowsToHighlight] = useState<number[]>([]);
  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [sessionRestored, setSessionRestored] = useState(false);
  const reloadBoreholes = useReloadBoreholes();
  const { navigateTo } = useBoreholesNavigate();
  const {
    filterPolygon,
    setFilterPolygon,
    polygonSelectionEnabled,
    setPolygonSelectionEnabled,
    featureIds,
    setFeatureIds,
  } = useContext(PolygonFilterContext);
  const {
    filterParams,
    tableParams,
    setTableParams,
    mapResolution,
    setMapResolution,
    mapCenter,
    setMapCenter,
    saveFilterParamsInSession,
    restoreMapParamsFromSession,
    saveTableParamsInSession,
    restoreTableParamsFromSession,
    restoreFilterParamsFromSession,
  } = useBoreholeUrlParams();

  useEffect(() => {
    restoreTableParamsFromSession();
    restoreFilterParamsFromSession();
    restoreMapParamsFromSession();
    setSessionRestored(true);

    return () => {
      // On unmount: persist current state to sessionStorage.
      saveFilterParamsInSession();
      saveTableParamsInSession();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setting: Setting = useSelector((state: ReduxRootState) => state.setting);
  const editorStore: EditorStore = useSelector((state: ReduxRootState) => state.editor);
  const dispatch = useDispatch();

  // MUI DataGrid uses 0-based page, FilterRequest uses 1-based pageNumber
  const paginationModel: GridPaginationModel = {
    page: tableParams.page,
    pageSize: tableParams.pageSize,
  };
  const setPaginationModel = (model: GridPaginationModel) => {
    setTableParams({ page: model.page, pageSize: model.pageSize });
  };

  const sortModel: GridSortModel = [
    {
      field: tableParams.orderBy,
      sort: tableParams.direction.toLowerCase() as "asc" | "desc",
    },
  ];
  const setSortModel = (model: GridSortModel) => {
    setTableParams({
      orderBy: model[0]?.field ?? "name",
      direction: model[0]?.sort === "desc" ? "DESC" : "ASC",
      page: 0, // reset to first page on sort change
    });
  };

  // Assemble the full FilterRequest from URL params
  const filterRequest: FilterRequest = {
    ...filterParams,
    ids: featureIds?.length > 0 ? featureIds : undefined,
    pageNumber: tableParams.page + 1,
    pageSize: tableParams.pageSize,
    orderBy: tableParams.orderBy,
    direction: tableParams.direction,
  };

  const emptyFilterResponse: FilterResponse = {
    totalCount: 0,
    pageNumber: 1,
    pageSize: tableParams.pageSize,
    totalPages: 0,
    boreholes: [],
    geoJson: null,
    filteredBoreholeIds: [],
    selectableBoreholeIds: [],
  };
  const { data: filterResponse = emptyFilterResponse } = useFilterBoreholes(filterRequest, sessionRestored);

  const lock = (id: string) => {
    dispatch({ type: "CLEAR", path: "/borehole" });
    navigateTo({ path: "/" + id });
  };

  const multipleSelected = (selection: GridRowSelectionModel, filter: Record<string, unknown> | null = null) => {
    dispatch({ type: "EDITOR_MULTIPLE_SELECTED", selection, filter });
  };

  return (
    <Stack direction="column" sx={{ flex: "1 1.5 100%" }}>
      <BulkEditDialog
        isOpen={Array.isArray(editorStore.mselected)}
        loadBoreholes={reloadBoreholes}
        selected={selectionModel}
      />
      <ExportDialog
        isExporting={isExporting}
        setIsExporting={setIsExporting}
        selectionModel={selectionModel}
        fileName={`bulkexport_${new Date().toISOString().split("T")[0]}`}
      />
      <MapComponent
        geoJson={filterResponse.geoJson}
        highlighted={hover ? [hover] : []}
        hover={(ids: number[]) => setRowsToHighlight(ids)}
        layers={setting.data.map.explorer}
        selected={(id: string | null) => {
          if (id !== null) lock(id);
        }}
        mapResolution={mapResolution}
        setMapResolution={setMapResolution}
        mapCenter={mapCenter}
        setMapCenter={setMapCenter}
        polygonSelectionEnabled={polygonSelectionEnabled}
        setPolygonSelectionEnabled={setPolygonSelectionEnabled}
        filterPolygon={filterPolygon}
        setFilterPolygon={setFilterPolygon}
        featureIds={featureIds}
        setFeatureIds={setFeatureIds}
        displayErrorMessage={displayErrorMessage}
      />
      <BottomBarContainer
        boreholes={filterResponse.boreholes}
        totalCount={filterResponse.totalCount}
        selectableBoreholeIds={filterResponse.selectableBoreholeIds}
        multipleSelected={multipleSelected}
        selectionModel={selectionModel}
        setSelectionModel={setSelectionModel}
        rowsToHighlight={rowsToHighlight}
        setHover={setHover}
        setIsExporting={setIsExporting}
        paginationModel={paginationModel}
        setPaginationModel={setPaginationModel}
        sortModel={sortModel}
        setSortModel={setSortModel}
      />
    </Stack>
  );
};
