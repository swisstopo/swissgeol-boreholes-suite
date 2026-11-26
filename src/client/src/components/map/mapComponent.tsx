import { FC, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Box, CircularProgress } from "@mui/material";
import { Map, View } from "ol";
import { defaults as defaultControls } from "ol/control";
import { never } from "ol/events/condition";
import { createEmpty, extend } from "ol/extent";
import Feature, { FeatureLike } from "ol/Feature";
import GeoJSON from "ol/format/GeoJSON";
import OlPolygon from "ol/geom/Polygon";
import { defaults as defaultInteractions } from "ol/interaction";
import Draw from "ol/interaction/Draw";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import Overlay from "ol/Overlay";
import { Pixel } from "ol/pixel";
import { get as getProjection } from "ol/proj";
import { Cluster } from "ol/source";
import VectorSource from "ol/source/Vector";
import { StyleFunction } from "ol/style/Style";
import { theme } from "../../AppTheme";
import {
  isWithinMapExtent,
  parseAsPolygon,
  toOlPolygon,
  toPolygonVertices,
} from "../../pages/overview/polygonFilter.ts";
import { SessionKeys } from "../../pages/overview/SessionKey";
import { BasemapContext } from "../basemapSelector/basemapContext";
import { swissExtent, updateBasemap } from "../basemapSelector/basemaps";
import { BasemapSelector } from "../basemapSelector/basemapSelector";
import MapControls from "../buttons/mapControls";
import { PulseLayer, startHighlightPulse } from "./highlightPulse.ts";
import { MapLegend } from "./legend/mapLegend.tsx";
import { getFeatureBoreholes, groupByLocation } from "./locationBadges.ts";
import { addWMSLayerToMap, addWMTSLayerToMap, getDrawSource, MapComponentProps, SRS } from "./map.ts";
import { getBadgeOuterRadius, loadBadgeFont } from "./mapBadgeStyle.ts";
import "./mapProjections";
import { clusterStyleFunction, drawStyle, locationStyleFunction, noBoreholeHighlights } from "./mapStyleFunctions";
import { BoreholePopover } from "./popover/boreholePopover.tsx";
import { getPopoverAnchorPoints, getPopoverOffset, getPopoverPlacement } from "./popover/boreholePopoverPlacement.ts";
import { toPopoverRows } from "./popover/boreholePopoverRows.ts";
import {
  BoreholePopoverState,
  getBoreholeHighlights,
  getHoveredBoreholeIds,
  haveSameBoreholes,
  haveSameHighlights,
  previewCluster,
  previewLocations,
} from "./popover/boreholePopoverState.ts";

// The longest time between the two clicks of a double-click, a little above the 250 ms OpenLayers uses.
const doubleClickInterval = 500;

// The highlight rings start just outside the borehole symbols and the badges.
const boreholePulseRingRadius = 14;
const badgePulseRingGap = 1;

const getPulseRingRadius = (feature: Feature) => {
  const boreholes = getFeatureBoreholes(feature);
  return boreholes.length === 1 ? boreholePulseRingRadius : getBadgeOuterRadius(boreholes.length) + badgePulseRingGap;
};

// Above this resolution the map shows clusters instead of the borehole symbols.
const clusterResolution = 15;

const boreholeLayerName = "points";
const clusterLayerName = "clusters";

const getFeaturesAtPixel = (map: Map, pixel: Pixel, layerName: string): Feature[] => {
  const features: Feature[] = [];
  map.forEachFeatureAtPixel(
    pixel,
    feature => {
      if (feature instanceof Feature) features.push(feature);
    },
    { hitTolerance: 3, layerFilter: layer => layer.get("name") === layerName },
  );
  return features;
};

// The preview of the boreholes and badges under the pointer, or of the cluster under it.
const getPreviewAtPixel = (map: Map, pixel: Pixel): BoreholePopoverState | null => {
  const locations = getFeaturesAtPixel(map, pixel, boreholeLayerName);
  if (locations.length > 0) return previewLocations(locations);

  const [cluster] = getFeaturesAtPixel(map, pixel, clusterLayerName);
  return cluster ? previewCluster(cluster) : null;
};

// The map clusters all boreholes; below the cluster resolution it draws them grouped by location.
const showBoreholes = (points: VectorSource, locations: VectorSource, boreholes: Feature[]) => {
  points.clear();
  points.addFeatures(boreholes);
  locations.clear();
  locations.addFeatures(groupByLocation(boreholes));
};

export const MapComponent: FC<MapComponentProps> = ({
  geoJson,
  highlighted,
  hover,
  layers,
  selected,
  polygonSelectionEnabled,
  setPolygonSelectionEnabled,
  filterPolygon,
  setFilterPolygon,
  displayErrorMessage,
  mapResolution,
  mapCenter,
  isLoading,
  legendTheme,
  onSwitchLegendTheme,
}) => {
  const { t } = useTranslation();
  const { currentBasemapName } = useContext(BasemapContext);

  // ── UI state (triggers rerenders) ──
  const [popover, setPopover] = useState<BoreholePopoverState | null>(null);
  const [hoveredRowId, setHoveredRowId] = useState<number | null>(null);

  // ── OpenLayers object refs (mutable, imperative, never trigger rerenders) ──
  const mapRef = useRef<Map | null>(null);
  const pointsRef = useRef<VectorSource | null>(null);
  const locationsRef = useRef<VectorSource | null>(null);
  const pointLayerRef = useRef<VectorLayer | null>(null);
  const clusterLayerRef = useRef<VectorLayer | null>(null);
  const drawRef = useRef<Draw | null>(null);
  const popoverOverlayRef = useRef<Overlay | null>(null);
  const popoverElementRef = useRef<HTMLDivElement | null>(null);
  const overlaysRef = useRef<TileLayer[]>([]);
  const pulseLayersRef = useRef<PulseLayer[]>([]);
  const stopPulseRef = useRef<(() => void) | null>(null);

  // ── Internal mutable state refs (no rerender needed) ──
  const drawActiveRef = useRef(false);
  const displayedBasemapRef = useRef<string | null>(null);
  const prevHighlightedRef = useRef<number[]>(highlighted);
  const isInitialGeoJsonRef = useRef(true);
  // Set together with the popover state, so OL event handlers see a change before React commits it.
  const popoverRef = useRef<BoreholePopoverState | null>(null);
  const highlightsRef = useRef(noBoreholeHighlights);
  const hoveredClusterRef = useRef<Feature | null>(null);

  // ── Refs for latest prop values (accessed by OL event handlers registered at mount) ──
  const legendThemeRef = useRef(legendTheme);
  const polygonSelectionEnabledRef = useRef(polygonSelectionEnabled);
  const filterPolygonRef = useRef(filterPolygon);
  const callbacksRef = useRef({
    hover,
    selected,
    setFilterPolygon,
    setPolygonSelectionEnabled,
    displayErrorMessage,
    t,
  });

  // No dependency array: every commit refreshes all of the above in one place.
  useEffect(() => {
    legendThemeRef.current = legendTheme;
    polygonSelectionEnabledRef.current = polygonSelectionEnabled;
    filterPolygonRef.current = filterPolygon;
    callbacksRef.current = {
      hover,
      selected,
      setFilterPolygon,
      setPolygonSelectionEnabled,
      displayErrorMessage,
      t,
    };
  });

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

  // ────────────────────── Popover ──────────────────────

  const updatePopover = useCallback((nextPopover: BoreholePopoverState | null) => {
    popoverRef.current = nextPopover;
    setPopover(nextPopover);
    setHoveredRowId(null);
  }, []);

  const openBorehole = useCallback(
    (id: number) => {
      updatePopover(null);
      callbacksRef.current.selected(id);
    },
    [updatePopover],
  );

  // ────────────────────── Effect: Map initialization (mount only) ──────────────────────
  useEffect(() => {
    const initialCenter: [number, number] = mapCenter ?? [
      (swissExtent[2] - swissExtent[0]) / 2 + swissExtent[0],
      (swissExtent[3] - swissExtent[1]) / 2 + swissExtent[1],
    ];

    const projection = getProjection(SRS)!;
    projection.setExtent(swissExtent);

    const map = new Map({
      // No double-click zoom: a polygon is often finished with a double-click, which would zoom the map.
      interactions: defaultInteractions({ doubleClickZoom: false }),
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
    (globalThis as typeof globalThis & { olMap?: Map }).olMap = map;

    // ── Feature layers ──
    const points = new VectorSource();
    pointsRef.current = points;
    const locations = new VectorSource();
    locationsRef.current = locations;

    const clusterSource = new Cluster({ distance: 40, source: points });
    // Use z-index to ensure points/clusters are always on top of WMS/WMTS overlay layers
    const featureLayerZIndex = 1000;

    const clusterStyle: StyleFunction = (feature: FeatureLike) =>
      clusterStyleFunction(feature, legendThemeRef.current, highlightsRef.current, hoveredClusterRef.current);

    const clusterLayer = new VectorLayer({
      source: clusterSource,
      properties: { name: clusterLayerName },
      zIndex: featureLayerZIndex,
      style: clusterStyle,
      minResolution: clusterResolution,
    });
    map.addLayer(clusterLayer);
    clusterLayerRef.current = clusterLayer;

    const pointStyle: StyleFunction = (feature: FeatureLike) =>
      locationStyleFunction(feature, legendThemeRef.current, highlightsRef.current);

    const pointLayer = new VectorLayer({
      properties: { name: boreholeLayerName },
      zIndex: featureLayerZIndex,
      source: locations,
      style: pointStyle,
      maxResolution: clusterResolution,
    });
    map.addLayer(pointLayer);
    pointLayerRef.current = pointLayer;

    pulseLayersRef.current = [
      { layer: pointLayer, getRingRadius: getPulseRingRadius },
      { layer: clusterLayer, getRingRadius: getPulseRingRadius },
    ];

    // Badges drawn before the font of their numbers loaded use a fallback font.
    void loadBadgeFont().then(() => {
      pointLayer.changed();
      clusterLayer.changed();
    });

    const drawSource = new VectorSource();
    map.addLayer(
      new VectorLayer({
        properties: { name: "draw" },
        source: drawSource,
        style: drawStyle,
      }),
    );

    // ── Interactions ──

    // Hover: a preview popover lists the boreholes under the pointer, or those of the cluster under it. A pinned
    // popover stays until it is closed.
    const showPreview = (preview: BoreholePopoverState | null) => {
      const current = popoverRef.current;
      if (preview === null) {
        if (current !== null) updatePopover(null);
      } else if (current === null || !haveSameBoreholes(current.features, preview.features)) {
        updatePopover(preview);
      }
    };

    map.on("pointermove", event => {
      if (event.dragging || drawActiveRef.current || popoverRef.current?.pinned) return;
      showPreview(getPreviewAtPixel(map, event.pixel));
    });

    const hidePreview = () => {
      if (!popoverRef.current?.pinned) showPreview(null);
    };
    map.getViewport().addEventListener("mouseleave", hidePreview);
    // A preview would no longer be next to its boreholes once the map moves.
    map.on("movestart", hidePreview);

    // The pinned popover is not shown with the clusters.
    map.on("moveend", () => {
      if (popoverRef.current?.pinned && (map.getView().getResolution() ?? 0) >= clusterResolution) {
        updatePopover(null);
      }
    });

    // The overlay stops events, so clicks in the pinned popover do not reach the map.
    const popoverOverlay = new Overlay({ element: popoverElementRef.current ?? undefined });
    popoverOverlayRef.current = popoverOverlay;
    map.addOverlay(popoverOverlay);

    // A polygon is often finished with a double-click, whose first click already ends the drawing. Its second
    // click must not zoom into a cluster.
    let drawEndedAt = Number.NEGATIVE_INFINITY;
    const isClickFinishingDrawing = () => Date.now() - drawEndedAt < doubleClickInterval;

    // A click on a single borehole opens it, a click on several boreholes or a badge pins the popover listing them,
    // and a click elsewhere closes the popover and zooms into a clicked cluster.
    map.on("click", event => {
      if (polygonSelectionEnabledRef.current || isClickFinishingDrawing()) return;

      // With the same hit tolerance as the hover, so a cluster that shows its preview also zooms on click.
      const preview = getPreviewAtPixel(map, event.pixel);
      if (preview?.features.length === 1) {
        openBorehole(preview.features[0].get("id") as number);
        return;
      }
      if (preview !== null && preview.cluster === null) {
        updatePopover({ ...preview, pinned: true });
        return;
      }
      updatePopover(null);

      if (preview !== null) {
        const extent = createEmpty();
        preview.features.forEach(feature => {
          const geometry = feature.getGeometry();
          if (geometry) extend(extent, geometry.getExtent());
        });
        map.getView().fit(extent, { duration: 500, padding: [50, 50, 50, 50] });
      }
    });

    // ── Draw interaction (created once, added/removed dynamically) ──
    // No freehand: it adds a vertex per mouse move, and the polygon is stored in the URL.
    // No source: Draw would add the drawn feature after drawend, so a rejected polygon would stay on the map.
    // drawend adds an accepted polygon itself.
    const draw = new Draw({ type: "Polygon", freehandCondition: never });

    // The current polygon is hidden while a new one is drawn, and shown again when the drawing is aborted or
    // discarded.
    draw.on("drawstart", () => {
      drawSource.clear();
    });

    const showFilterPolygon = () => {
      const polygon = filterPolygonRef.current;
      if (polygon !== null) drawSource.addFeature(new Feature(toOlPolygon(polygon)));
    };

    draw.on("drawabort", showFilterPolygon);

    draw.on("drawend", event => {
      drawEndedAt = Date.now();
      const drawnFeature = event.feature;
      const currentPoints = pointsRef.current;
      if (!currentPoints) return;

      const intersectingFeatures: Feature[] = [];
      currentPoints.forEachFeature(feature => {
        if (drawnFeature.getGeometry()!.intersectsExtent(feature.getGeometry()!.getExtent())) {
          intersectingFeatures.push(feature);
        }
      });

      const { displayErrorMessage, setFilterPolygon, t } = callbacksRef.current;
      const drawnPolygon = drawnFeature.getGeometry();
      const vertices = drawnPolygon instanceof OlPolygon ? toPolygonVertices(drawnPolygon) : null;
      if (vertices !== null && !isWithinMapExtent(vertices)) {
        // The drawing is discarded and the current polygon filter stays.
        displayErrorMessage(t("msgPolygonOutsideMapExtent"));
        showFilterPolygon();
      } else if (vertices === null || intersectingFeatures.length === 0) {
        displayErrorMessage(t("msgNoBoreholesInSelection"));
        setFilterPolygon(null);
      } else {
        showBoreholes(currentPoints, locations, intersectingFeatures);
        drawSource.addFeature(new Feature(toOlPolygon(vertices)));
        setFilterPolygon(vertices);
      }

      callbacksRef.current.setPolygonSelectionEnabled(false);
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
      stopPulseRef.current?.();
      map.setTarget(undefined);
    };
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Mount only — prop access goes through refs

  // ────────────────────── Effect: Basemap updates ──────────────────────

  useEffect(() => {
    const map = mapRef.current;
    if (!map || currentBasemapName === displayedBasemapRef.current) return;
    displayedBasemapRef.current = currentBasemapName;
    updateBasemap(map, currentBasemapName);
  }, [currentBasemapName]);

  // ────────────────────── Effect: User layers ──────────────────────

  // The legacy `setting` reducer mutates `state.data.map.explorer` in place on PATCH,
  // so the `layers` prop reference is stable even when content changes. Derive a
  // value-based signature so the sync effect fires on actual changes.
  const layersSignature = JSON.stringify(
    Object.entries(layers).map(([id, l]) => [id, l.visibility, l.transparency, l.position, l.type]),
  );

  useEffect(() => {
    const map = mapRef.current;
    if (!map || Object.keys(layers).length === 0) return;

    const existingNames = new Set(
      map
        .getLayers()
        .getArray()
        .map(layer => layer.get("name") as string),
    );

    for (const [identifier, layer] of Object.entries(layers)) {
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
  }, [layers, layersSignature]);

  // ────────────────────── Effect: GeoJSON feature loading ──────────────────────

  useEffect(() => {
    const points = pointsRef.current;
    const locations = locationsRef.current;
    if (!geoJson || !points || !locations) return;

    // The backend already applied the polygon and all other filters.
    showBoreholes(points, locations, new GeoJSON().readFeatures(geoJson));

    // The popover may list boreholes that are gone; force style recomputation.
    updatePopover(null);
    points.changed();

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
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [geoJson]);

  // ────────────────────── Effect: Highlights from table hover ──────────────────────

  useEffect(() => {
    const points = pointsRef.current;
    if (
      !points ||
      (highlighted.length === prevHighlightedRef.current.length &&
        highlighted.every((v, i) => v === prevHighlightedRef.current[i]))
    )
      return;
    prevHighlightedRef.current = highlighted;

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
  }, [highlighted]);

  // ────────────────────── Effect: Highlights on the map ──────────────────────

  // Force layer redraw so the style function picks up the new highlighted state. Only the layer is changed: a change
  // of the source would make the cluster source cluster all boreholes again.
  // A layout effect, so the redraw is requested in the commit that shows the popover. OpenLayers draws in the next
  // animation frame, which comes before the browser paints that commit. A passive effect can run after that frame,
  // so the popover would show one frame before its highlight.
  useLayoutEffect(() => {
    const highlights = getBoreholeHighlights(popover, hoveredRowId, highlighted);
    if (haveSameHighlights(highlightsRef.current, highlights)) return;
    highlightsRef.current = highlights;
    pointLayerRef.current?.changed();
    // A cluster with a single borehole is drawn as that borehole.
    clusterLayerRef.current?.changed();
  }, [popover, hoveredRowId, highlighted]);

  // The hovered cluster is outlined like hovered boreholes. Only the layer is changed, as above.
  useLayoutEffect(() => {
    const hoveredCluster = popover?.cluster ?? null;
    if (hoveredClusterRef.current === hoveredCluster) return;
    hoveredClusterRef.current = hoveredCluster;
    clusterLayerRef.current?.changed();
  }, [popover]);

  // The table highlights the rows of the boreholes hovered on the map or in the popover.
  useEffect(() => {
    callbacksRef.current.hover(getHoveredBoreholeIds(popover, hoveredRowId));
  }, [popover, hoveredRowId]);

  // ────────────────────── Effect: Popover ──────────────────────

  // Placed after the popover rendered, so its height decides whether it fits above the boreholes.
  useLayoutEffect(() => {
    const map = mapRef.current;
    const overlay = popoverOverlayRef.current;
    const element = popoverElementRef.current;
    if (!map || !overlay || !element) return;

    if (popover === null || popover.anchor.coordinates.length === 0) {
      overlay.setPosition(undefined);
      return;
    }

    // Positioned above first, so the popover is visible and has its height.
    const anchorPoints = getPopoverAnchorPoints(popover.anchor);
    const offset = getPopoverOffset(popover.anchor);
    overlay.setPositioning("bottom-center");
    overlay.setOffset([0, -offset]);
    overlay.setPosition(anchorPoints.above);

    const abovePixel = map.getPixelFromCoordinate(anchorPoints.above);
    const belowPixel = map.getPixelFromCoordinate(anchorPoints.below);
    const mapHeight = map.getSize()?.[1];
    if (!abovePixel || !belowPixel || mapHeight === undefined) return;
    if (getPopoverPlacement(abovePixel[1], belowPixel[1], mapHeight, element.offsetHeight, offset) === "below") {
      overlay.setPositioning("top-center");
      overlay.setOffset([0, offset]);
      overlay.setPosition(anchorPoints.below);
    }
  }, [popover]);

  const popoverPinned = popover?.pinned === true;
  useEffect(() => {
    if (!popoverPinned) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") updatePopover(null);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [popoverPinned, updatePopover]);

  const popoverRows = useMemo(
    () => (popover === null ? [] : toPopoverRows(popover.features, legendTheme)),
    [popover, legendTheme],
  );

  // ────────────────────── Effect: Legend theme ──────────────────────

  // The style functions read the theme from its ref, the layer changes only trigger the redraw. Clusters with a single
  // borehole show its symbol.
  useEffect(() => {
    pointLayerRef.current?.changed();
    clusterLayerRef.current?.changed();
  }, [legendTheme]);

  const onHighlightBoreholes = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    stopPulseRef.current?.();
    stopPulseRef.current = startHighlightPulse(map, pulseLayersRef.current);
  }, []);

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
  }, [polygonSelectionEnabled]);

  // ────────────────────── Effect: Filter polygon from the URL ──────────────────────

  // Keyed on the URL value, so the effect runs when the polygon changes, not when it is parsed again.
  const filterPolygonKey = filterPolygon === null ? null : parseAsPolygon.serialize(filterPolygon);

  useEffect(() => {
    const drawSource = mapRef.current ? getDrawSource(mapRef.current) : null;
    if (!drawSource) return;

    drawSource.clear();
    const vertices = filterPolygonKey === null ? null : parseAsPolygon.parse(filterPolygonKey);
    if (vertices === null) {
      // Removing the polygon, with its chip, the reset or the browser history, also ends drawing mode.
      callbacksRef.current.setPolygonSelectionEnabled(false);
    } else {
      drawSource.addFeature(new Feature(toOlPolygon(vertices)));
    }
  }, [filterPolygonKey]);

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
          cursor: popover === null || popover.pinned ? undefined : "pointer",
          position: "relative",
        }}
      />
      {isLoading && (
        <Box
          data-cy="map-loading"
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            // The map stays usable while the boreholes load.
            pointerEvents: "none",
          }}>
          <CircularProgress aria-label={t("boreholesLoading")} />
        </Box>
      )}
      {/* The overlay moves the popover element into the map; the hidden box only holds it until then. */}
      <Box sx={{ display: "none" }}>
        <div ref={popoverElementRef}>
          {popover !== null && (
            <BoreholePopover
              rows={popoverRows}
              pinned={popover.pinned}
              onHoverRow={setHoveredRowId}
              onOpenRow={openBorehole}
            />
          )}
        </div>
      </Box>
      <MapLegend
        legendTheme={legendTheme}
        onSwitchTheme={onSwitchLegendTheme}
        onHighlightBoreholes={onHighlightBoreholes}
      />
      <BasemapSelector marginBottom={"30px"} />
      <MapControls onZoomIn={onZoomIn} onZoomOut={onZoomOut} onFitToExtent={onFitToExtent} onRotate={undefined} />
    </Box>
  );
};
