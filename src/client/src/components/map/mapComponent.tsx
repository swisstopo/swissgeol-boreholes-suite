import { FC, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Box } from "@mui/material";
import isEqual from "lodash/isEqual";
import sortBy from "lodash/sortBy";
import { Map, View } from "ol";
import { defaults as defaultControls } from "ol/control";
import { click, pointerMove } from "ol/events/condition";
import { createEmpty, extend } from "ol/extent";
import Feature, { FeatureLike } from "ol/Feature";
import GeoJSON from "ol/format/GeoJSON";
import Point from "ol/geom/Point";
import Draw from "ol/interaction/Draw";
import Select from "ol/interaction/Select";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import Overlay from "ol/Overlay";
import { get as getProjection } from "ol/proj";
import { register } from "ol/proj/proj4";
import { Cluster } from "ol/source";
import VectorSource from "ol/source/Vector";
import { StyleFunction } from "ol/style/Style";
import proj4 from "proj4";
import { theme } from "../../AppTheme";
import { SessionKeys } from "../../pages/overview/SessionKey";
import { BasemapContext } from "../basemapSelector/basemapContext";
import { swissExtent, updateBasemap } from "../basemapSelector/basemaps";
import { BasemapSelector } from "../basemapSelector/basemapSelector";
import MapControls from "../buttons/mapControls";
import { ClickablePopup } from "./clickablePopup";
import {
  addWMSLayerToMap,
  addWMTSLayerToMap,
  filterFeaturesByPolygon,
  getDrawSource,
  LayerConfig,
  MapComponentProps,
  SRS,
} from "./map.ts";
import { projections } from "./mapProjections";
import { clusterStyleFunction, drawStyle, styleFunction } from "./mapStyleFunctions";

// Register Swiss coordinate projections once at module level.
Object.entries(projections).forEach(([srs, proj]) => {
  proj4.defs(srs, proj);
});
register(proj4);

export const MapComponent: FC<MapComponentProps> = ({
  geoJson,
  highlighted,
  hover,
  layers,
  selected,
  setFeatureIds,
  featureIds,
  polygonSelectionEnabled,
  setPolygonSelectionEnabled,
  filterPolygon,
  setFilterPolygon,
  displayErrorMessage,
  mapResolution,
  mapCenter,
}) => {
  const { t } = useTranslation();
  const { currentBasemapName } = useContext(BasemapContext);

  // ── UI state (triggers rerenders) ──
  const [hoverFeatures, setHoverFeatures] = useState<Feature[] | null>(null);

  // ── OpenLayers object refs (mutable, imperative, never trigger rerenders) ──
  const mapRef = useRef<Map | null>(null);
  const pointsRef = useRef<VectorSource | null>(null);
  const drawRef = useRef<Draw | null>(null);
  const popupRef = useRef<Overlay | null>(null);
  const selectClickRef = useRef<Select | null>(null);
  const overlaysRef = useRef<TileLayer[]>([]);

  // ── Internal mutable state refs (no rerender needed) ──
  const drawActiveRef = useRef(false);
  const hoveringPopupRef = useRef(false);
  const displayedBasemapRef = useRef<string | null>(null);
  const prevHighlightedRef = useRef<number[]>(highlighted);
  const isInitialGeoJsonRef = useRef(true);

  // ── Refs for latest prop values (accessed by OL event handlers registered at mount) ──
  const highlightedRef = useRef(highlighted);
  highlightedRef.current = highlighted;

  const polygonSelectionEnabledRef = useRef(polygonSelectionEnabled);
  polygonSelectionEnabledRef.current = polygonSelectionEnabled;

  const filterPolygonRef = useRef(filterPolygon);
  filterPolygonRef.current = filterPolygon;

  const featureIdsRef = useRef(featureIds);
  featureIdsRef.current = featureIds;

  const callbacksRef = useRef({
    hover,
    selected,
    setFilterPolygon,
    setPolygonSelectionEnabled,
    setFeatureIds,
    displayErrorMessage,
    t,
  });
  callbacksRef.current = {
    hover,
    selected,
    setFilterPolygon,
    setPolygonSelectionEnabled,
    setFeatureIds,
    displayErrorMessage,
    t,
  };

  // ────────────────────── Zoom handlers ──────────────────────

  const onZoomIn = useCallback(() => {
    const view = mapRef.current?.getView();
    if (view) view.setZoom(view.getZoom()! + 1);
  }, []);

  const onZoomOut = useCallback(() => {
    const view = mapRef.current?.getView();
    if (view) view.setZoom(view.getZoom()! - 1);
  }, []);

  const onFitToExtent = useCallback(() => {
    const map = mapRef.current;
    const points = pointsRef.current;
    if (!map || !points || points.getFeatures().length < 1) return;
    const pointsExtent = points.getExtent();
    if (!pointsExtent) return;
    map.getView().fit(pointsExtent, {
      size: map.getSize(),
      padding: [20, 20, 20, 20],
    });
  }, []);

  // ────────────────────── Effect: Map initialization (mount only) ──────────────────────
  useEffect(() => {
    const initialCenter: [number, number] = mapCenter ?? [
      (swissExtent[2] - swissExtent[0]) / 2 + swissExtent[0],
      (swissExtent[3] - swissExtent[1]) / 2 + swissExtent[1],
    ];

    const projection = getProjection(SRS)!;
    projection.setExtent(swissExtent);

    const map = new Map({
      controls: defaultControls({
        attribution: true,
        zoom: false,
        attributionOptions: {
          collapsed: false,
          collapsible: false,
          collapseLabel: "",
        },
      }),
      layers: [],
      target: "map",
      view: new View({
        minResolution: 0.1,
        resolution: mapResolution,
        center: initialCenter,
        projection: projection,
        extent: swissExtent,
        showFullExtent: true,
      }),
    });

    mapRef.current = map;
    displayedBasemapRef.current = currentBasemapName;
    updateBasemap(map, currentBasemapName);

    // Attach map to globalThis for Cypress E2E tests.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).olMap = map;

    // ── Feature layers ──
    const points = new VectorSource();
    pointsRef.current = points;

    const clusterSource = new Cluster({ distance: 40, source: points });
    // Use z-index to ensure points/clusters are always on top of WMS/WMTS overlay layers
    const featureLayerZIndex = 1000;

    const clusterStyle: StyleFunction = (feature: FeatureLike) => clusterStyleFunction(feature.get("features").length);

    map.addLayer(
      new VectorLayer({
        source: clusterSource,
        properties: { name: "clusters" },
        zIndex: featureLayerZIndex,
        style: clusterStyle,
        minResolution: 15,
      }),
    );

    const pointStyle: StyleFunction = (feature: FeatureLike) =>
      styleFunction(feature as Feature, highlightedRef.current);

    map.addLayer(
      new VectorLayer({
        properties: { name: "points" },
        zIndex: featureLayerZIndex,
        source: points,
        style: pointStyle,
        maxResolution: 15,
      }),
    );

    const drawSource = new VectorSource();
    map.addLayer(
      new VectorLayer({
        properties: { name: "draw" },
        source: drawSource,
        style: drawStyle,
      }),
    );

    // ── Interactions ──

    // Hover detection
    const selectPointerMove = new Select({ condition: pointerMove });
    selectPointerMove.on("select", e => {
      const pixel = map.getEventPixel(e.mapBrowserEvent.originalEvent);

      if (drawActiveRef.current) return;

      const popupOpen = popupRef.current?.getPosition() !== undefined;

      // Find features under pointer (only when popup not open)
      let features: Feature[] = [];
      if (!popupOpen) {
        const featureSet = new Set<Feature>();
        map.forEachFeatureAtPixel(
          pixel,
          feature => {
            if (feature.getGeometry()!.getType() !== "Polygon") {
              featureSet.add(feature as Feature);
            }
          },
          { hitTolerance: 3 },
        );
        features = Array.from(featureSet);
      }

      // Grace period for popup interaction
      if (popupOpen) {
        setTimeout(() => {
          if (!hoveringPopupRef.current) {
            const popup = popupRef.current;
            if (popup?.getPosition()) {
              setHoverFeatures(null);
              hoveringPopupRef.current = false;
              popup.setPosition(undefined);
              callbacksRef.current.hover([]);
            }
          }
        }, 500);
        return;
      }

      // Ignore clusters
      if (features.length === 1) {
        const clusterFeatures = features[0].get("features");
        if (clusterFeatures?.length > 0) return;
      }

      // Show popup for non-cluster features
      if (features.length > 0) {
        setHoverFeatures(features);
        const coordinate = (features[0].getGeometry() as Point).getCoordinates();
        popupRef.current?.setPosition(coordinate);
        callbacksRef.current.hover(features.map(f => f.get("id") as number));
      }
    });
    map.addInteraction(selectPointerMove);

    // Click selection
    const clickStyle: StyleFunction = (feature: FeatureLike) =>
      styleFunction(feature as Feature, highlightedRef.current);

    const selectClick = new Select({
      condition: click,
      layers: layer => layer.get("name") === "points",
      style: clickStyle,
    });
    selectClick.on("select", e => {
      if (e.selected.length > 0) {
        callbacksRef.current.selected(e.selected[0].get("id"));
      } else {
        callbacksRef.current.selected(null);
      }
    });
    selectClickRef.current = selectClick;
    map.addInteraction(selectClick);

    // Popup overlay
    const popupEl = document.getElementById("popup-overlay");
    const popup = new Overlay({
      position: undefined,
      positioning: "bottom-center",
      element: popupEl!,
      stopEvent: false,
    });
    popupRef.current = popup;
    map.addOverlay(popup);

    if (popupEl) {
      popupEl.addEventListener("mouseenter", () => {
        hoveringPopupRef.current = true;
      });
      popupEl.addEventListener("mouseleave", () => {
        const p = popupRef.current;
        if (p?.getPosition() !== undefined) {
          setHoverFeatures(null);
          hoveringPopupRef.current = false;
          p.setPosition(undefined);
          callbacksRef.current.hover([]);
        }
      });
    }

    // Zoom to cluster on click
    map.on("click", event => {
      if (pointsRef.current && !polygonSelectionEnabledRef.current) {
        const clickFeatures = map.getFeaturesAtPixel(event.pixel, {
          layerFilter: layer => layer.get("name") === "clusters",
        });
        if (clickFeatures?.length > 0) {
          const clusterMembers = clickFeatures[0].get("features");
          if (clusterMembers.length > 1) {
            const extent = createEmpty();
            clusterMembers.forEach((feature: Feature) => {
              if (feature.getGeometry()) {
                extend(extent, feature.getGeometry()!.getExtent());
              }
            });
            map.getView().fit(extent, { duration: 500, padding: [50, 50, 50, 50] });
          } else {
            const coordinates = (clusterMembers[0].getGeometry() as Point).getCoordinates();
            map.getView().setCenter(coordinates);
            map.getView().setResolution(10);
          }
        }
      }
    });

    // ── Draw interaction (created once, added/removed dynamically) ──
    const draw = new Draw({ source: drawSource, type: "Polygon" });

    draw.on("drawstart", () => {
      drawSource.clear();
    });

    draw.on("drawend", event => {
      const drawnFeature = event.feature;
      const currentPoints = pointsRef.current;
      if (!currentPoints) return;

      const intersectingFeatures: Feature[] = [];
      currentPoints.forEachFeature(feature => {
        if (drawnFeature.getGeometry()!.intersectsExtent(feature.getGeometry()!.getExtent())) {
          intersectingFeatures.push(feature);
        }
      });

      if (intersectingFeatures.length > 0) {
        currentPoints.clear();
        currentPoints.addFeatures(intersectingFeatures);
        callbacksRef.current.setFilterPolygon(drawnFeature);
      } else {
        callbacksRef.current.displayErrorMessage(callbacksRef.current.t("msgNoBoreholesInSelection"));
        callbacksRef.current.setFilterPolygon(null);
        drawSource.clear();
      }

      callbacksRef.current.setPolygonSelectionEnabled(false);
      callbacksRef.current.setFeatureIds(intersectingFeatures.map(f => f.get("id") as number));
    });

    drawRef.current = draw;

    // Cleanup on unmount: persist map state to sessionStorage.
    return () => {
      const center = map.getView().getCenter();
      const resolution = map.getView().getResolution();
      if (center) {
        sessionStorage.setItem(SessionKeys.mapCenterX, String(center[0]));
        sessionStorage.setItem(SessionKeys.mapCenterY, String(center[1]));
      }
      if (resolution !== undefined) {
        sessionStorage.setItem(SessionKeys.mapResolution, String(resolution));
      }

      // Persist polygon filter state
      const polygon = filterPolygonRef.current;
      if (polygon) {
        setFilterPolygon(polygon);
      }
      const ids = featureIdsRef.current;
      setFeatureIds(ids);
      map.setTarget(undefined);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Mount only — prop access goes through refs

  // ────────────────────── Effect: Basemap updates ──────────────────────

  useEffect(() => {
    const map = mapRef.current;
    if (!map || currentBasemapName === displayedBasemapRef.current) return;
    displayedBasemapRef.current = currentBasemapName;
    updateBasemap(map, currentBasemapName);
  }, [currentBasemapName]);

  // ────────────────────── Effect: User layers ──────────────────────

  useEffect(() => {
    const map = mapRef.current;
    if (!map || Object.keys(layers).length === 0) return;

    const existingNames = new Set(
      map
        .getLayers()
        .getArray()
        .map(layer => layer.get("name") as string),
    );

    for (const [identifier, layer] of Object.entries(layers) as [string, LayerConfig][]) {
      if (!existingNames.has(identifier)) {
        if (layer.type === "WMTS") {
          addWMTSLayerToMap(map, identifier, layer, overlaysRef.current);
        } else if (layer.type === "WMS") {
          addWMSLayerToMap(map, identifier, layer, overlaysRef.current, map.getView().getProjection().getExtent());
        }
      }

      // Update visibility, opacity, and z-index for existing layers
      const overlay = overlaysRef.current.find(o => o.get("name") === identifier);
      if (overlay) {
        overlay.setVisible(layer.visibility);
        overlay.setOpacity(1 - layer.transparency / 100);
        overlay.setZIndex(layer.position + 1);
      }
    }
  }, [layers]);

  // ────────────────────── Effect: GeoJSON feature loading ──────────────────────

  useEffect(() => {
    const points = pointsRef.current;
    if (!geoJson || !points) return;

    const allFeatures = new GeoJSON().readFeatures(geoJson);
    const { filtered, ids } = filterFeaturesByPolygon(allFeatures, filterPolygonRef.current);
    if (!isEqual(sortBy(ids), sortBy(featureIdsRef.current))) {
      callbacksRef.current.setFeatureIds(ids);
    }
    points.clear();
    points.addFeatures(filtered);

    // Refresh click selection and force style recomputation
    selectClickRef.current?.getFeatures().clear();
    points.changed();

    // Restore polygon drawing if a filter polygon exists
    if (filterPolygonRef.current) {
      const drawSource = mapRef.current ? getDrawSource(mapRef.current) : null;
      if (drawSource?.getFeatures().length === 0) {
        // Clone the feature so it is not tied to a previous map's draw source.
        const clone = filterPolygonRef.current.clone();
        drawSource.addFeature(clone);
      }
    }

    // Fit map to feature extent — but skip on initial mount when a saved
    // center/resolution was restored (matches old componentDidUpdate behaviour
    // where onFitToExtent only ran when geoJson *changed*, not on first load).
    const map = mapRef.current;
    const extent = points.getFeatures().length > 0 ? points.getExtent() : null;
    const isInitialLoad = isInitialGeoJsonRef.current;
    isInitialGeoJsonRef.current = false;
    const shouldSkipFit = isInitialLoad && mapCenter != null;
    if (!shouldSkipFit && map && extent) {
      map.getView().fit(extent, {
        size: map.getSize(),
        padding: [20, 20, 20, 20],
      });
    }
    // Only re-run when geoJson changes. mapCenter is intentionally read only
    // on first load (via isInitialGeoJsonRef guard). Other deps accessed via refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geoJson]);

  // ────────────────────── Effect: Highlights from table hover ──────────────────────

  useEffect(() => {
    const points = pointsRef.current;
    const popup = popupRef.current;
    if (!points || isEqual(highlighted, prevHighlightedRef.current)) return;
    prevHighlightedRef.current = highlighted;

    // Clear any existing popup
    popup?.setPosition(undefined);

    if (highlighted.length > 0) {
      const feature = points.getFeatureById(highlighted[0]);
      if (feature) {
        callbacksRef.current.hover([feature.get("id") as number]);
      } else {
        callbacksRef.current.hover([]);
      }
    } else {
      callbacksRef.current.hover([]);
    }

    // Force layer redraw so the style function picks up the new highlighted state.
    points.changed();
  }, [highlighted]);

  // ────────────────────── Effect: Polygon selection toggle ──────────────────────

  useEffect(() => {
    const map = mapRef.current;
    const draw = drawRef.current;
    if (!map || !draw || !pointsRef.current) return;

    // Toggle draw interaction on/off
    if (drawActiveRef.current && !polygonSelectionEnabled) {
      map.removeInteraction(draw);
      drawActiveRef.current = false;
    } else if (!drawActiveRef.current && polygonSelectionEnabled) {
      map.addInteraction(draw);
      drawActiveRef.current = true;
    }

    // Clear draw source when polygon filter is removed
    if (!filterPolygon) {
      getDrawSource(map)?.clear();
    }
  }, [polygonSelectionEnabled, filterPolygon]);

  // ────────────────────── Render ──────────────────────

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        padding: "0px",
        flex: "1 1 100%",
        position: "relative",
        display: "flex",
        flexDirection: "row",
        backgroundColor: theme.palette.background.lightgrey,
      }}>
      <Box
        id="map"
        sx={{
          padding: "0px",
          flex: "1 1 100%",
          cursor: hoverFeatures === null ? undefined : "pointer",
          position: "relative",
        }}
      />
      <ClickablePopup features={hoverFeatures ?? undefined} />
      <BasemapSelector marginBottom={"30px"} />
      <MapControls onZoomIn={onZoomIn} onZoomOut={onZoomOut} onFitToExtent={onFitToExtent} onRotate={undefined} />
    </Box>
  );
};
