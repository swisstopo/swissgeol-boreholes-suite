import React, { useCallback, useContext, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { Modal } from "semantic-ui-react";
import { loadEditingBoreholes } from "../../../api-lib";
import MapComponent from "../../../components/map/mapComponent.jsx";
import { BulkEditForm } from "../../../components/legacyComponents/multiple/bulkEditForm.jsx";
import { FilterContext } from "../sidePanelContent/filter/filterContext.tsx";
import BottomBarContainer from "../boreholeTable/bottomBarContainer";
import { Boreholes, EditorStore, Filters, ReduxRootState, Setting } from "../../../api-lib/ReduxStateInterfaces.ts";
import { GridRowSelectionModel } from "@mui/x-data-grid";
import { Stack } from "@mui/material";
import { OverViewContext } from "../overViewContext.tsx";

interface MapViewProps {
  displayErrorMessage: string;
}

export const MapView = ({ displayErrorMessage }: MapViewProps) => {
  const [hover, setHover] = useState<number | null>(null);
  const [rowToHighlight, setRowToHighlight] = useState<number | null>(null);
  const history = useHistory();
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
  const search: Filters = useSelector((state: ReduxRootState) => state.filters);
  const dispatch = useDispatch();

  const lock = (id: string) => {
    dispatch({
      type: "CLEAR",
      path: "/borehole",
    });
    history.push("/" + id);
  };

  const multipleSelected = (selection: GridRowSelectionModel, filter: string | null = null) => {
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
      <Modal open={Array.isArray(editorStore.mselected)}>
        <Modal.Content>
          <BulkEditForm
            loadBoreholes={() => {
              loadBoreholes(
                boreholes.page,
                boreholes.limit,
                search.filter,
                boreholes.orderby,
                boreholes.direction,
                featureIds,
              );
            }}
            selected={editorStore.mselected}
          />
        </Modal.Content>
      </Modal>
      <MapComponent
        searchState={{
          ...search,
        }}
        highlighted={hover ? [hover] : []}
        hover={(id: React.SetStateAction<number | null>) => {
          setRowToHighlight(id);
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
        search={search}
        rowToHighlight={rowToHighlight}
        setHover={setHover}
      />
    </Stack>
  );
};
