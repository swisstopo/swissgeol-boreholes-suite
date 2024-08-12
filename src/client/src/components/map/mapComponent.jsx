import React from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import TileWMS from "ol/source/TileWMS";
import WMTSTileGrid from "ol/tilegrid/WMTS";
import WMTS from "ol/source/WMTS";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Cluster } from "ol/source";
import GeoJSON from "ol/format/GeoJSON";
import Select from "ol/interaction/Select";
import Overlay from "ol/Overlay";
import { defaults as defaultControls } from "ol/control";
import { click, pointerMove } from "ol/events/condition";
import { createEmpty, extend } from "ol/extent";
import { get as getProjection } from "ol/proj";
import { register } from "ol/proj/proj4";
import proj4 from "proj4";
import { getGeojson } from "../../api-lib";
import { Box } from "@mui/material";
import ZoomControls from "./zoomControls.jsx";
import NamePopup from "./namePopup.jsx";
import { BasemapSelector } from "../basemapSelector/basemapSelector.tsx";
import { swissExtent, updateBasemap } from "../basemapSelector/basemaps.ts";
import { BasemapContext } from "../basemapSelector/basemapContext.tsx";
import { clusterStyleFunction, drawStyle, styleFunction } from "./mapStyleFunctions.js";
import { projections } from "./mapProjections.js";
import { theme } from "../../AppTheme.ts";
import Draw from "ol/interaction/Draw.js";
import { withTranslation } from "react-i18next";

class MapComponent extends React.Component {
  static contextType = BasemapContext;

  constructor(props) {
    super(props);
    this.onSelected = this.onSelected.bind(this);
    this.setStateBound = this.setState.bind(this);
    this.fetchAndDisplayGeojson = this.fetchAndDisplayGeojson.bind(this);
    this.styleFunction = styleFunction.bind(this);
    this.clusterStyleFunction = clusterStyleFunction.bind(this);
    this.initializeMapLayers = this.initializeMapLayers.bind(this);
    this.calculateLayerZIndex = this.calculateLayerZIndex.bind(this);
    this.initializeMap = this.initializeMap.bind(this);
    this.addWMTSLayer = this.addWMTSLayer.bind(this);
    this.addWMSLayer = this.addWMSLayer.bind(this);
    this.addUserLayers = this.addUserLayers.bind(this);
    this.handleHighlights = this.handleHighlights.bind(this);
    this.setFeatureHighlight = this.setFeatureHighlight.bind(this);
    this.clearFeatureHighlight = this.clearFeatureHighlight.bind(this);
    this.updateLayerProperties = this.updateLayerProperties.bind(this);
    this.onZoomIn = this.onZoomIn.bind(this);
    this.onZoomOut = this.onZoomOut.bind(this);
    this.onFitToExtent = this.onFitToExtent.bind(this);
    this.onHover = this.onHover.bind(this);
    this.onSelected = this.onSelected.bind(this);
    this.handleMapInteractions = this.handleMapInteractions.bind(this);
    this.setExtentAndResolution = this.setExtentAndResolution.bind(this);
    this.getFeaturesAtPixel = this.getFeaturesAtPixel.bind(this);
    this.zoomToCluster = this.zoomToCluster.bind(this);
    this.zoomToPoint = this.zoomToPoint.bind(this);
    this.zoomToFeatures = this.zoomToFeatures.bind(this);
    this.handleFilter = this.handleFilter.bind(this);
    this.refreshPoints = this.refreshPoints.bind(this);
    this.timeoutFilter = null;
    this.draw = null;

    this.srs = "EPSG:2056";
    _.forEach(projections, function (proj, srs) {
      proj4.defs(srs, proj);
    });
    register(proj4);
    this.overlays = [];
    this.state = {
      hover: null,
      displayedBaseMap: null,
      drawActive: false,
    };
  }

  //////  INITIALIZE BOREHOLE FEATURE LAYERS //////
  async fetchAndDisplayGeojson() {
    try {
      const response = await getGeojson(this.props.searchState.filter);
      if (response.data.success) {
        this.initializeMapLayers();
        this.handleMapInteractions();
        let features = new GeoJSON().readFeatures(response.data.data);
        features = this.filterByPolygon(features);
        this.points.clear();
        this.points.addFeatures(features);

        this.setExtentAndResolution();
      }
    } catch (error) {
      console.error("Failed to fetch and display GeoJSON:", error);
    }
  }

  calculateLayerZIndex() {
    return this.overlays.length + 1;
  }

  initializeMapLayers() {
    if (!this.points) {
      this.points = new VectorSource();
      const clusterSource = new Cluster({
        distance: 40,
        source: this.points,
      });

      // Display clusters for resolutions >= 20.
      const clusterLayer = new VectorLayer({
        source: clusterSource,
        name: "clusters",
        zIndex: this.calculateLayerZIndex(),
        style: features => this.clusterStyleFunction(features.get("features").length),
        minResolution: 20,
      });

      // Display original point layer for resolutions <= 20.
      const pointLayer = new VectorLayer({
        name: "points",
        zIndex: this.calculateLayerZIndex(),
        source: this.points,
        style: feature => {
          return this.styleFunction(feature, this.props.highlighted);
        },
        maxResolution: 20,
      });

      // Layer to draw selection polygon
      const drawingLayer = new VectorLayer({
        name: "draw",
        source: new VectorSource(),
        style: drawStyle,
      });

      this.map.addLayer(clusterLayer);
      this.map.addLayer(pointLayer);
      this.map.addLayer(drawingLayer);
      this.drawPolygon();
    }
  }

  //////  ADD MAP INTERACTIONS //////
  zoomToCluster = clusterMembers => {
    const extent = createEmpty();
    clusterMembers.forEach(feature => {
      if (feature.getGeometry()) {
        extend(extent, feature.getGeometry().getExtent());
      }
    });
    if (extent) {
      this.map.getView().fit(extent, {
        duration: 500,
        padding: [50, 50, 50, 50],
      });
    }
  };

  zoomToPoint = feature => {
    const coordinates = feature.getGeometry().getCoordinates();
    const view = this.map.getView();
    view.setCenter(coordinates);
    view.setResolution(15);
  };

  zoomToFeatures = features => {
    const clusterMembers = features[0].get("features");
    if (clusterMembers.length > 1) {
      this.zoomToCluster(clusterMembers);
    } else {
      this.zoomToPoint(clusterMembers[0]);
    }
  };

  getFeaturesAtPixel = pixel => {
    return this.map.getFeaturesAtPixel(pixel, {
      layerFilter: layer => layer.get("name") === "clusters",
    });
  };

  handleMapInteractions() {
    // Move to detail view on point click.
    const selectPointerMove = new Select({ condition: pointerMove });
    selectPointerMove.on("select", this.onHover);
    this.map.addInteraction(selectPointerMove);

    this.selectClick = new Select({
      condition: click,
      layers: layer => layer.get("name") === "points",
      style: this.styleFunction.bind(this),
    });
    this.selectClick.on("select", this.onSelected);

    this.map.addInteraction(this.selectClick);

    // Define popup to display on hover.
    this.popup = new Overlay({
      position: undefined,
      positioning: "bottom-center",
      element: document.getElementById("popup-overlay"),
      stopEvent: false,
    });
    this.map.addOverlay(this.popup);

    // Zoom to cluster extent if clicked on cluster.
    this.map.on("click", event => {
      if (this.points && !this.props.polygonSelectionEnabled) {
        const features = this.getFeaturesAtPixel(event.pixel);
        if (features?.length > 0) {
          this.zoomToFeatures(features);
        }
      }
    });
  }

  //////  SET MAP EXTENT AND RESOLUTION //////
  setExtentAndResolution() {
    let extent = this.props.searchState.extent?.length ? this.props.searchState.extent : this.points.getExtent();
    this.map.getView().fit(extent);
    if (this.props.searchState.resolution) {
      this.map.getView().setResolution(this.props.searchState.resolution);
    }
  }

  //////  HANDLE CUSTOM USER LAYERS //////
  addWMTSLayer(identifier, layer) {
    const wmtsLayer = new TileLayer({
      visible: layer.visibility,
      name: identifier,
      opacity: 1,
      source: new WMTS({
        ...layer.conf,
        projection: getProjection(layer.conf.projection),
        tileGrid: new WMTSTileGrid(layer.conf.tileGrid),
      }),
      zIndex: layer.position + 1,
    });
    wmtsLayer.set("name", identifier);
    this.overlays.push(wmtsLayer);
    this.map.addLayer(wmtsLayer);
  }

  addWMSLayer(identifier, layer, extent) {
    const wmsLayer = new TileLayer({
      visible: layer.visibility,
      opacity: 1 - layer.transparency / 100,
      name: identifier,
      extent: extent,
      source: new TileWMS({
        url: layer.url,
        params: {
          LAYERS: layer.Identifier,
          TILED: true,
          SRS: this.srs,
          transition: 0,
        },
      }),
      zIndex: layer.position + 1,
    });
    wmsLayer.set("name", identifier);
    this.overlays.push(wmsLayer);
    this.map.addLayer(wmsLayer);
  }

  addUserLayers(extent) {
    const existingLayerNames = new Set(
      this.map
        .getLayers()
        .getArray()
        .map(layer => layer.get("name")),
    );

    // Add user layers if they not yet exist on the map
    for (const [identifier, layer] of Object.entries(this.props.layers)) {
      if (!existingLayerNames.has(identifier)) {
        switch (layer.type) {
          case "WMS":
            this.addWMSLayer(identifier, layer, extent);
            break;
          case "WMTS":
            this.addWMTSLayer(identifier, layer);
            break;
        }
      }
    }
  }

  initializeMap(initialExtent) {
    const initialCenter = [
      (initialExtent[2] - initialExtent[0]) / 2 + initialExtent[0],
      (initialExtent[3] - initialExtent[1]) / 2 + initialExtent[1],
    ];
    const projection = getProjection(this.srs);
    projection.setExtent(initialExtent);

    this.setState({ displayedBaseMap: this.context.currentBasemapName });

    this.map = new Map({
      controls: defaultControls({
        attribution: true,
        zoom: false,
        attributionOptions: {
          collapsed: false,
          collapsible: false,
          collapseLabel: "",
        },
      }),
      loadTilesWhileAnimating: true,
      loadTilesWhileInteracting: true,
      layers: [],
      target: "map",
      view: new View({
        minResolution: 0.1,
        resolution: 500,
        center: initialCenter,
        projection: projection,
        extent: initialExtent,
        showFullExtent: true,
      }),
    });

    updateBasemap(this.map, this.context.currentBasemapName);
  }

  handleHighlights(currentHighlights, hoverCallback, previousHighlights) {
    if (!this.points || _.isEqual(currentHighlights, previousHighlights)) {
      return;
    }

    // Clear any existing popups
    this.popup.setPosition(undefined);

    // Handle highlighting logic
    if (currentHighlights.length > 0) {
      const feature = this.points.getFeatureById(currentHighlights[0]);
      if (feature) {
        this.setFeatureHighlight(feature, hoverCallback);
      } else {
        this.clearFeatureHighlight(hoverCallback);
      }
    } else {
      this.clearFeatureHighlight(hoverCallback);
    }
    this.points.changed(); // forces the layer to redraw and apply the hover style.
  }

  handlePolygonSelection() {
    if (this.points) {
      const drawLayer = this.map
        .getLayers()
        .getArray()
        .find(layer => layer.get("name") === "draw");
      if (drawLayer) {
        const drawSource = drawLayer.getSource();

        if (!this.draw) {
          this.draw = new Draw({
            source: drawSource,
            type: "Polygon",
          });

          // clear other polygons when drawing a new one
          this.draw.on("drawstart", () => {
            drawSource.clear();
          });

          this.draw.on("drawend", event => {
            const drawnFeature = event.feature;

            // Get the features from the points layer that intersect with the drawn polygon
            const intersectingFeatures = [];
            this.points.forEachFeature(feature => {
              if (drawnFeature.getGeometry().intersectsExtent(feature.getGeometry().getExtent())) {
                intersectingFeatures.push(feature);
              }
            });
            if (intersectingFeatures.length > 0) {
              this.points.clear();
              this.points.addFeatures(intersectingFeatures);
              this.props.setFilterPolygon(drawnFeature);
              // Zoom to the extent of the drawn feature
              this.map.getView().fit(drawnFeature.getGeometry().getExtent(), { padding: [10, 10, 10, 10] });
            } else {
              this.props.displayErrorMessage(this.props.t("msgNoBoreholesInSelection"));
              this.props.setFilterPolygon(null);
              drawSource.clear();
            }
            this.props.setPolygonSelectionEnabled(false);
            this.props.setFeatureIds(intersectingFeatures.map(f => f.getId()));
          });
        }

        // Update map interactions
        if (this.state.drawActive) {
          if (!this.props.polygonSelectionEnabled) {
            this.map.removeInteraction(this.draw);
            this.setState({ drawActive: false });
          }
        } else {
          if (this.props.polygonSelectionEnabled) {
            this.map.addInteraction(this.draw);
            this.setState({ drawActive: true });
          }
        }

        // Remove polygon from map if filterpolygon prop no longer exists
        if (!this.props.filterPolygon) {
          drawSource.clear();
        }
      }
    }
  }

  // draw
  drawPolygon() {
    if (this.props.filterPolygon === null) return;
    const drawLayer = this.map
      .getLayers()
      .getArray()
      .find(layer => layer.get("name") === "draw");
    if (drawLayer) {
      const drawSource = drawLayer.getSource();
      if (drawSource.getFeatures().length === 0) {
        drawSource.addFeature(this.props.filterPolygon);
      }
    }
  }

  setFeatureHighlight(feature, hoverCallback) {
    if (hoverCallback) {
      hoverCallback(feature.getId());
    }
  }

  clearFeatureHighlight(hoverCallback) {
    if (hoverCallback) {
      hoverCallback(null);
    }
  }

  //// Filter geojson with polygon
  filterByPolygon(features) {
    if (this.props.filterPolygon === null) return features;

    const originalVectorSources = new VectorSource({
      features: features,
    });
    const intersectingVectorSource = new VectorSource();

    originalVectorSources.forEachFeature(feature => {
      if (this.props.filterPolygon.getGeometry().intersectsExtent(feature.getGeometry().getExtent())) {
        intersectingVectorSource.addFeature(feature);
      }
    });
    const intersectingFeatures = intersectingVectorSource.getFeatures();
    this.props.setFeatureIds(intersectingFeatures.map(f => f.getId()));
    return intersectingFeatures;
  }

  handleFilter(searchState, previousSearchState, view) {
    if (this.timeoutFilter !== null) {
      clearTimeout(this.timeoutFilter);
    }
    this.timeoutFilter = setTimeout(() => {
      getGeojson(searchState.filter)
        .then(
          function (response) {
            if (response.data.success) {
              let features = new GeoJSON().readFeatures(response.data.data);
              features = this.filterByPolygon(features);
              this.points.clear();
              this.points.addFeatures(features);
              view.fit(this.points.getExtent());
            }
          }.bind(this),
        )
        .catch(function (error) {
          console.log(error);
        });
    }, 500);
    this.refreshPoints();
    this.map.updateSize();
    view.getResolution() < 1 && view.setResolution(1);
  }

  refreshPoints() {
    if (this.selectClick && this.points) {
      this.selectClick.getFeatures().clear();
      this.points.changed();
    }
  }

  updateLayerProperties(layers) {
    const keys = Object.keys(layers);
    keys.forEach(identifier => {
      const overlay = this.overlays.find(overlay => overlay.get("name") === identifier);
      if (overlay) {
        overlay.setVisible(layers[identifier].visibility);
        overlay.setOpacity(1 - layers[identifier].transparency / 100);
        overlay.setZIndex(layers[identifier].position + 1);
      }
    });
  }

  //////  COMPONENT HOOKS //////
  componentDidMount() {
    this.initializeMap(swissExtent);

    // Load additional user layers
    this.addUserLayers(swissExtent);

    // Load borehole points
    this.fetchAndDisplayGeojson();
  }

  componentDidUpdate(prevProps) {
    const { searchState, highlighted, hover: hoverCallback, layers } = this.props;
    const view = this.map.getView();

    if (this.context.currentBasemapName !== this.state.displayedBaseMap) {
      this.setState({ displayedBaseMap: this.context.currentBasemapName });
      updateBasemap(this.map, this.context.currentBasemapName);
    }

    if (Object.keys(layers).length !== 0) {
      this.addUserLayers(view.getProjection().getExtent());
      this.updateLayerProperties(layers);
    }

    if (!_.isEqual(prevProps.highlighted, highlighted)) {
      this.handleHighlights(highlighted, hoverCallback, prevProps.highlighted);
    }
    if (!_.isEqual(searchState.filter, prevProps.searchState.filter)) {
      this.handleFilter(searchState, prevProps.searchState, view);
    }

    if (
      !_.isEqual(prevProps.polygonSelectionEnabled, this.props.polygonSelectionEnabled) ||
      !_.isEqual(prevProps.filterPolygon, this.props.filterPolygon)
    ) {
      this.handlePolygonSelection();
    }

    if (!_.isEqual(prevProps.filterPolygon, this.props.filterPolygon)) {
      if (this.props.filterPolygon === null) {
        this.handleFilter(searchState, prevProps.searchState, view);
      }
    }
  }

  //////// Event handlers ////////
  onSelected(e) {
    const { selected } = this.props;
    if (selected !== undefined) {
      if (e.selected.length > 0) {
        selected(e.selected[0].getId());
      } else {
        selected(null);
      }
    }
  }

  onHover(e) {
    this.removePopup();
    // Remove any existing popover if no features are selected or drawing is active
    if (e.selected.length === 0 || this.state.drawActive) return;

    const feature = e.selected[0];
    const isCluster = feature.values_.features?.length > 0;
    if (isCluster) {
      return;
    }
    if (feature?.getGeometry().getType() !== "Polygon") {
      this.displayPopup(feature);
    }
  }

  removePopup() {
    if (this.popup.getPosition() !== undefined) {
      const { hover: hoverCallback } = this.props;
      if (hoverCallback !== undefined) {
        this.setState(
          {
            hover: null,
          },
          () => {
            this.popup.setPosition(undefined);
            hoverCallback(null);
          },
        );
      }
    }
  }

  displayPopup(feature) {
    const { hover: hoverCallback } = this.props;
    if (hoverCallback !== undefined) {
      this.setState(
        {
          hover: feature,
        },
        () => {
          this.popup.setPosition(feature.getGeometry().getCoordinates());
          hoverCallback(feature.getId());
        },
      );
    }
  }

  onZoomIn = () => {
    const view = this.map.getView();
    const zoom = view.getZoom();
    view.setZoom(zoom + 1);
  };

  onZoomOut = () => {
    const view = this.map.getView();
    const zoom = view.getZoom();
    view.setZoom(zoom - 1);
  };

  onFitToExtent = () => {
    const view = this.map.getView();
    const extent = this.points.getExtent();
    view.fit(extent, this.map.getSize());
    view.getResolution() < 1 && view.setResolution(1);
  };

  render() {
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
            cursor: this.state.hover === null ? null : "pointer",
            position: "relative",
          }}
        />
        <NamePopup state={this.state}></NamePopup>
        <BasemapSelector marginBottom={"30px"} />
        <ZoomControls onZoomIn={this.onZoomIn} onZoomOut={this.onZoomOut} onFitToExtent={this.onFitToExtent} />
      </Box>
    );
  }
}

MapComponent.propTypes = {
  searchState: PropTypes.object,
  highlighted: PropTypes.array,
  hover: PropTypes.func,
  layers: PropTypes.object,
  selected: PropTypes.func,
};

MapComponent.defaultProps = {
  highlighted: [],
  searchState: {},
  layers: {},
};

const TranlatedMapComponent = withTranslation()(MapComponent);
export default TranlatedMapComponent;
