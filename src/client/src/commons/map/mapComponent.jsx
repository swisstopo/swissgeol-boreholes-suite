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
import Overlay from "ol/Overlay.js";
import { defaults as defaultControls } from "ol/control";
import { click, pointerMove } from "ol/events/condition";
import WMTSCapabilities from "ol/format/WMTSCapabilities";
import { createEmpty, extend } from "ol/extent";
import { getGeojson } from "../../api-lib/index";
import { get as getProjection } from "ol/proj";
import { register } from "ol/proj/proj4";
import proj4 from "proj4";
import { Box } from "@mui/material";
import ZoomControls from "./zoomControls";
import LayerSelectControl from "./layerSelectControl";
import Sidebar from "./sidebar";
import NamePopup from "./namePopup";
import { BasemapSelector } from "../../components/basemapSelector/basemapSelector";
import { basemaps } from "../../components/basemapSelector/basemaps";
import { BasemapContext } from "../../components/basemapSelector/basemapContext";
import { styleFunction, clusterStyleFunction } from "./mapStyleFunctions";
import { projections } from "./mapProjections";

class MapComponent extends React.Component {
  static contextType = BasemapContext;
  constructor(props) {
    super(props);
    this.sidebarRef = React.createRef();
    this.moveEnd = this.moveEnd.bind(this);
    this.onSelected = this.onSelected.bind(this);
    this.updateWidth = this.updateWidth.bind(this);
    this.setStateBound = this.setState.bind(this);
    this.fetchAndDisplayGeojson = this.fetchAndDisplayGeojson.bind(this);
    this.styleFunction = styleFunction.bind(this);
    this.clusterStyleFunction = clusterStyleFunction.bind(this);
    this.loadBasemaps = this.loadBasemaps.bind(this);
    this.initializeMapLayers = this.initializeMapLayers.bind(this);
    this.calculateLayerZIndex = this.calculateLayerZIndex.bind(this);
    this.initializeMap = this.initializeMap.bind(this);
    this.addWMTSLayer = this.addWMTSLayer.bind(this);
    this.addWMSLayer = this.addWMSLayer.bind(this);
    this.addUserLayers = this.addUserLayers.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.handleHighlights = this.handleHighlights.bind(this);
    this.setFeatureHighlight = this.setFeatureHighlight.bind(this);
    this.clearFeatureHighlight = this.clearFeatureHighlight.bind(this);
    this.updateLayerProperties = this.updateLayerProperties.bind(this);
    this.handleCenterto = this.handleCenterto.bind(this);
    this.onZoomIn = this.onZoomIn.bind(this);
    this.onZoomOut = this.onZoomOut.bind(this);
    this.onFitToExtent = this.onFitToExtent.bind(this);
    this.onShowLayerSelection = this.onShowLayerSelection.bind(this);
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
    this.cnt = null;
    this.parser = new WMTSCapabilities();
    this.srs = "EPSG:2056";
    _.forEach(projections, function (proj, srs) {
      proj4.defs(srs, proj);
    });
    register(proj4);
    this.overlays = [];
    this.state = {
      counter: 0,
      basemap: "colormap",
      overlay: "nomap",
      colormap: true,
      greymap: false,
      satellite: false,
      geologie500: false,
      hover: null,
      featureExtent: [],
      sidebar: false,
      selectedLayer: null,
      sidebarWidth: 0,
      overlays: [
        {
          key: "nomap",
          value: "nomap",
          text: "Transparent overlay",
        },
      ],
    };

    for (var identifier in this.props.layers) {
      if (Object.prototype.hasOwnProperty.call(this.props.layers, identifier)) {
        const layer = this.props.layers[identifier];
        this.state.overlays.push({
          key: identifier,
          value: identifier,
          text: layer.Title,
        });
      }
    }
  }

  //////  INITIALIZE BOREHOLE FEATURE LAYERS //////
  async fetchAndDisplayGeojson() {
    try {
      const response = await getGeojson(this.props.searchState.filter);
      if (response.data.success) {
        this.initializeMapLayers();
        this.handleMapInteractions();

        const features = new GeoJSON().readFeatures(response.data.data);
        this.points.clear();
        this.points.addFeatures(features);

        this.setExtentAndResolution();
      }
    } catch (error) {
      console.error("Failed to fetch and display GeoJSON:", error);
    }
  }

  calculateLayerZIndex() {
    return this.overlays.length + this.basemaps.length + 1;
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

      this.map.addLayer(clusterLayer);
      this.map.addLayer(pointLayer);
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
      this.props.setmapfilter?.(true);
      this.props.filterByExtent?.(extent);
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
      if (this.points) {
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
    this.moveEnd();
  }

  //////  HANDLE CUSTOM USER LAYERS //////
  addWMTSLayer(identifier, layer) {
    const wmtsLayer = new TileLayer({
      visible: this.state.basemap === identifier,
      name: identifier,
      opacity: 1,
      source: new WMTS({
        ...layer.conf,
        projection: getProjection(layer.conf.projection),
        tileGrid: new WMTSTileGrid(layer.conf.tileGrid),
      }),
    });
    this.overlays.push(wmtsLayer);
    this.map.addLayer(wmtsLayer);
  }

  addWMSLayer(identifier, layer, extent) {
    const wmtsLayer = new TileLayer({
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
      zIndex: layer.position + this.basemaps.length + 1,
    });
    this.overlays.push(wmtsLayer);
    this.map.addLayer(wmtsLayer);
  }

  addUserLayers(extent) {
    for (const identifier in this.props.layers) {
      if (Object.prototype.hasOwnProperty.call(this.props.layers, identifier)) {
        const layer = this.props.layers[identifier];
        if (layer.type === "WMS") {
          this.addWMSLayer(identifier, layer, extent);
        } else if (layer.type === "WMTS") {
          this.addWMTSLayer(identifier, layer);
        }
      }
    }
  }

  //////  LOAD BASEMAPS //////
  loadBasemaps() {
    this.basemaps = basemaps.map(b => b.layer);
    this.setState({ basemap: basemaps.find(bm => bm.shortName === this.context.currentBasemapName) }, () => {
      basemaps.forEach(bm => {
        const isVisible = bm.shortName === this.context.currentBasemapName;
        bm.layer.setVisible(isVisible);
      });
    });
  }

  initializeMap(initialExtent) {
    const initialCenter = [
      (initialExtent[2] - initialExtent[0]) / 2 + initialExtent[0],
      (initialExtent[3] - initialExtent[1]) / 2 + initialExtent[1],
    ];
    const projection = getProjection(this.srs);
    projection.setExtent(initialExtent);

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
      layers: this.basemaps,
      target: "map",
      view: new View({
        maxResolution: 611,
        minResolution: 0.1,
        resolution: 500,
        center: initialCenter,
        projection: projection,
        extent: initialExtent,
        showFullExtent: true,
      }),
    });
  }

  handleResize() {
    this.updateWidth();
    window.addEventListener("resize", this.updateWidth);
  }

  updateWidth() {
    this.setState({ sidebarWidth: this.sidebarRef?.current?.offsetWidth });
  }

  handleHighlights(currentHighlights, hoverCallback, previousHighlights) {
    if (!this.points || _.isEqual(currentHighlights, previousHighlights)) {
      return false;
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
  }

  setFeatureHighlight(feature, hoverCallback) {
    this.setState({ hover: feature }, () => {
      if (hoverCallback) {
        hoverCallback(feature.getId());
      }
    });
  }

  clearFeatureHighlight(hoverCallback) {
    this.setState({ hover: null }, () => {
      if (hoverCallback) {
        hoverCallback(null);
      }
    });
  }

  handleFilter(searchState, previousSearchState, view) {
    if (!_.isEqual(searchState.filter, previousSearchState.filter)) {
      if (_.isEqual(searchState.filter.extent, previousSearchState.filter.extent)) {
        if (this.timeoutFilter !== null) {
          clearTimeout(this.timeoutFilter);
        }
        this.timeoutFilter = setTimeout(() => {
          this.points.clear(true);
          getGeojson(searchState.filter)
            .then(
              function (response) {
                if (response.data.success) {
                  this.points.addFeatures(new GeoJSON().readFeatures(response.data.data));
                  view.fit(this.points.getExtent());
                  this.moveEnd();
                }
              }.bind(this),
            )
            .catch(function (error) {
              console.log(error);
            });
        }, 500);
        return true;
      }
    }
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
        overlay.setZIndex(layers[identifier].position + this.basemaps.length + 1);
      }
    });
  }

  handleCenterto(centerto, prevProps, zoomto, view) {
    if (centerto !== null && centerto !== prevProps.centerto) {
      let feature = this.points.getFeatureById(centerto);
      if (feature !== null) {
        var point = feature.getGeometry();
        if (zoomto === true) {
          view.fit(point, { minResolution: 1 });
        } else {
          view.setCenter(point.getCoordinates());
        }
      } else {
        console.error("Feature not found.");
      }
    }
  }

  //////  COMPONENT HOOKS //////
  componentDidMount() {
    this.loadBasemaps();
    const initialExtent = [2420000, 1030000, 2900000, 1350000];
    this.initializeMap(initialExtent);

    // Load additional user layers
    this.addUserLayers(initialExtent);

    // Load borehole points
    this.fetchAndDisplayGeojson();
    this.handleResize();
  }

  componentDidUpdate(prevProps) {
    const { centerto, searchState, highlighted, hover, layers, zoomto } = this.props;
    const view = this.map.getView();
    this.updateLayerProperties(layers);

    let refresh = this.handleHighlights(highlighted, hover, prevProps.highlighted);
    refresh = this.handleFilter(searchState, prevProps.searchState, view);
    refresh && this.refreshPoints();

    this.handleCenterto(centerto, prevProps, zoomto, view);
    this.map.updateSize();
    view.getResolution() < 1 && view.setResolution(1);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateWidth);
  }

  /*
      Calculate which features are visible in actual map extent
      If moveend prop funtion is present then call it.
  */
  moveEnd() {
    const { moveend } = this.props;
    var extent = this.map.getView().calculateExtent(this.map.getSize());
    if (moveend !== undefined) {
      let features = [];
      this.points.forEachFeatureInExtent(extent, function (feature) {
        features.push(feature.getId());
      });
      if (!_.isEqual(this.state.featureExtent, features)) {
        this.setState(
          {
            featureExtent: features,
          },
          () => {
            moveend(extent, this.map.getView().getResolution());
          },
        );
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
    const { hover } = this.props;
    if (hover !== undefined) {
      // Only display popover if hover contains one single feature and is not a cluster point.
      if (e.selected?.length === 1 && !e.selected[0].values_.features) {
        const singleFeature = e.selected[0];
        this.setState(
          {
            hover: singleFeature,
          },
          () => {
            this.popup.setPosition(singleFeature.getGeometry().getCoordinates());
            hover(singleFeature.getId());
          },
        );
      } else {
        this.setState(
          {
            hover: null,
          },
          () => {
            this.popup.setPosition(undefined);
            hover(null);
          },
        );
      }
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

  onShowLayerSelection = () => {
    this.setState(
      {
        sidebar: !this.state.sidebar,
      },
      () => {
        this.map.updateSize();
        this.setState({ sidebarWidth: this.sidebarRef?.current?.offsetWidth });
      },
    );
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
          backgroundColor: "#F2F2EF",
        }}>
        {Object.keys(this.props.layers).length !== 0 && (
          <LayerSelectControl onShowLayerSelection={this.onShowLayerSelection} sidebarWidth={this.state.sidebarWidth} />
        )}
        <Sidebar
          sidebarRef={this.sidebarRef}
          state={this.state}
          setState={this.setState.bind(this)}
          additionalMapLayers={this.props.layers}
        />
        <Box
          id="map"
          sx={{
            padding: "0px",
            flex: "1 1 100%",
            cursor: this.state.hover === null ? null : "pointer",
            position: "relative",
            boxShadow: "rgba(0, 0, 0, 0.17) 2px 6px 6px 0px",
          }}
        />
        <NamePopup state={this.state}></NamePopup>
        <BasemapSelector setState={this.setStateBound} marginBottom={"30px"} />
        <ZoomControls onZoomIn={this.onZoomIn} onZoomOut={this.onZoomOut} onFitToExtent={this.onFitToExtent} />
      </Box>
    );
  }
}

MapComponent.propTypes = {
  centerto: PropTypes.number,
  searchState: PropTypes.object,
  highlighted: PropTypes.array,
  hover: PropTypes.func,
  layers: PropTypes.object,
  moveend: PropTypes.func,
  selected: PropTypes.func,
  zoomto: PropTypes.bool,
};

MapComponent.defaultProps = {
  highlighted: [],
  searchState: {},
  layers: {},
  zoomto: false,
  centerto: null,
};

export default MapComponent;
