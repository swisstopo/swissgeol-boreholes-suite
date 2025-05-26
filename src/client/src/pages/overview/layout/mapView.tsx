import React, { useCallback, useContext, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Stack } from "@mui/material";
import { GridRowSelectionModel } from "@mui/x-data-grid";
import { loadEditingBoreholes } from "../../../api-lib";
import { Boreholes, EditorStore, Filters, ReduxRootState, Setting } from "../../../api-lib/ReduxStateInterfaces.ts";
import { BulkEditDialog } from "../../../components/bulkedit/bulkEditDialog.js";
import { ExportDialog } from "../../../components/export/exportDialog.tsx";
import MapComponent from "../../../components/map/mapComponent.jsx";
import BottomBarContainer from "../boreholeTable/bottomBarContainer";
import { OverViewContext } from "../overViewContext.tsx";
import { FilterContext } from "../sidePanelContent/filter/filterContext.tsx";

interface MapViewProps {
  displayErrorMessage: (message: string) => void;
}

export const MapView = ({ displayErrorMessage }: MapViewProps) => {
  const [hover, setHover] = useState<number | null>(null);
  const [rowsToHighlight, setRowsToHighlight] = useState<number[]>([]);
  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>([]);
  const [isExporting, setIsExporting] = useState(false);
  const navigate = useNavigate();
  const {
    filterPolygon,
    setFilterPolygon,
    polygonSelectionEnabled,
    setPolygonSelectionEnabled,
    featureIds,
    setFeatureIds,
  } = useContext(FilterContext);
  const { mapResolution, setMapResolution, mapCenter, setMapCenter } = useContext(OverViewContext);

  const boreholes: Boreholes = useSelector((state: ReduxRootState) => state.core_borehole_editor_list);
  const setting: Setting = useSelector((state: ReduxRootState) => state.setting);
  const editorStore: EditorStore = useSelector((state: ReduxRootState) => state.editor);
  const filters: Filters = useSelector((state: ReduxRootState) => state.filters);
  const dispatch = useDispatch();

  const lock = (id: string) => {
    dispatch({
      type: "CLEAR",
      path: "/borehole",
    });
    navigate("/" + id);
  };

  const multipleSelected = (selection: GridRowSelectionModel, filter: Record<string, unknown> | null = null) => {
    dispatch({
      type: "EDITOR_MULTIPLE_SELECTED",
      selection: selection,
      filter: filter,
    });
  };

  const loadBoreholes = useCallback(
    (
      page: number,
      limit = 100,
      filter = {},
      orderby = "alternate_name",
      direction = "ASC",
      featureIds: number[] = [],
    ) => {
      // @ts-expect-error legacy api functions are not typed
      dispatch(loadEditingBoreholes(page, limit, filter, orderby, direction, featureIds));
    },
    [dispatch],
  );

  return (
    <Stack
      direction="column"
      sx={{
        flex: "1 1.5 100%",
      }}>
      <BulkEditDialog
        isOpen={Array.isArray(editorStore.mselected)}
        loadBoreholes={() => {
          loadBoreholes(
            boreholes.page,
            boreholes.limit,
            filters.filter,
            boreholes.orderby,
            boreholes.direction,
            featureIds,
          );
        }}
        selected={selectionModel}
      />
      <ExportDialog
        isExporting={isExporting}
        setIsExporting={setIsExporting}
        selectionModel={selectionModel}
        fileName={`bulkexport_${new Date().toISOString().split("T")[0]}`}
      />
      <MapComponent
        searchState={{
          ...filters,
        }}
        highlighted={hover ? [hover] : []}
        hover={(featureIds: number[]) => {
          setRowsToHighlight(featureIds);
        }}
        layers={setting.data.map.explorer}
        selected={(id: string | null) => {
          if (id !== null) {
            lock(id);
          }
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
        boreholes={boreholes}
        loadEditingBoreholes={loadBoreholes}
        multipleSelected={multipleSelected}
        filters={filters}
        selectionModel={selectionModel}
        setSelectionModel={setSelectionModel}
        rowsToHighlight={rowsToHighlight}
        setHover={setHover}
        setIsExporting={setIsExporting}
      />
    </Stack>
  );
};
