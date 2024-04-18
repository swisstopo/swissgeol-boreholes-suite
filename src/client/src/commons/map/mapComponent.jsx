import React from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import TileWMS from "ol/source/TileWMS";
import WMTSTileGrid from "ol/tilegrid/WMTS";
import LayerGroup from "ol/layer/Group";
import WMTS from "ol/source/WMTS";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Circle, Fill, RegularShape, Stroke, Style, Text } from "ol/style";
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

const projections = {
  "EPSG:21781":
    "+proj=somerc +lat_0=46.95240555555556 +lon_0=7.439583333333333 +k_0=1 +x_0=600000 +y_0=200000 +ellps=bessel +towgs84=674.4,15.1,405.3,0,0,0,0 +units=m +no_defs",
  "EPSG:2056":
    "+proj=somerc +lat_0=46.95240555555556 +lon_0=7.439583333333333 +k_0=1 +x_0=2600000 +y_0=1200000 +ellps=bessel +towgs84=674.374,15.056,405.346,0,0,0,0 +units=m +no_defs",
  "EPSG:21782":
    "+proj=somerc +lat_0=46.95240555555556 +lon_0=7.439583333333333 +k_0=1 +x_0=0 +y_0=0 +ellps=bessel +towgs84=674.4,15.1,405.3,0,0,0,0 +units=m +no_defs",
  "EPSG:4149": "+proj=longlat +ellps=bessel +towgs84=674.4,15.1,405.3,0,0,0,0 +no_defs",
  "EPSG:4150": "+proj=longlat +ellps=bessel +towgs84=674.374,15.056,405.346,0,0,0,0 +no_defs",
};

const boreholeStyleCache = {};
const virtualBoreholeStyleCache = {};
const trialpitStyleCache = {};
const probingStyleCache = {};
const deepBoreholeStyleCache = {};
const otherStyleCache = {};
const clusterStyleCache = {};

const blackStroke = new Stroke({ color: "black", width: 1 });
const greenFill = new Fill({ color: "rgb(33, 186, 69)" });
const redFill = new Fill({ color: "rgb(220, 0, 24)" });
const blackFill = new Fill({ color: "rgb(0, 0, 0)" });

const innerSelectedStyle = new Style({
  image: new Circle({
    radius: 10,
    fill: new Fill({ color: "#ffff00" }),
    stroke: new Stroke({
      color: "rgba(0, 0, 0, 0.75)",
      width: 1,
    }),
  }),
});

const outerSelectedStyle = new Style({
  image: new Circle({
    radius: 11,
    stroke: new Stroke({
      color: "rgba(120, 120, 120, 0.5)",
      width: 1,
    }),
  }),
});

class MapComponent extends React.Component {
  constructor(props) {
    super(props);
    this.sidebarRef = React.createRef();
    this.moveEnd = this.moveEnd.bind(this);
    this.selected = this.selected.bind(this);
    this.hover = this.hover.bind(this);
    this.updateDimensions = this.updateDimensions.bind(this);
    this.updateWidth = this.updateWidth.bind(this);
    this.timeoutFilter = null;
    this.cnt = null;
    this.parser = new WMTSCapabilities();
    this.srs = "EPSG:2056";
    _.forEach(projections, function (proj, srs) {
      proj4.defs(srs, proj);
    });
    register(proj4);
    this.layers = [];
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
      maps: [
        {
          key: "nomap",
          value: "nomap",
          text: "White background",
        },
        {
          key: "colormap",
          value: "colormap",
          text: "Color map",
        },
        {
          key: "greymap",
          value: "greymap",
          text: "Grey map",
        },
        {
          key: "satellite",
          value: "satellite",
          text: "Aerial Imagery",
        },
      ],
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

  componentDidMount() {
    this.updateWidth();
    window.addEventListener("resize", this.updateWidth);
    var resolutions = [
      4000, 3750, 3500, 3250, 3000, 2750, 2500, 2250, 2000, 1750, 1500, 1250, 1000, 750, 650, 500, 250, 100, 50, 20, 10,
      5, 2.5, 2, 1.5, 1, 0.5,
    ];
    const extent = [2420000, 1030000, 2900000, 1350000];
    const center = [(extent[2] - extent[0]) / 2 + extent[0], (extent[3] - extent[1]) / 2 + extent[1]];
    const projection = getProjection(this.srs);
    projection.setExtent(extent);
    const matrixIds = [];
    for (var i = 0; i < resolutions.length; i++) {
      matrixIds.push(i);
    }
    var tileGrid = new WMTSTileGrid({
      origin: [extent[0], extent[3]],
      resolutions: resolutions,
      matrixIds: matrixIds,
    });
    const attribution =
      '&copy; Data: <a style="color: black; text-decoration: underline;" href="https://www.swisstopo.admin.ch">swisstopo</a>';

    this.layers = [
      new LayerGroup({
        visible: this.state.basemap === "colormap",
        name: "colormap",
        zIndex: 0,
        layers: [
          new TileLayer({
            minResolution: 2.5,
            source: new WMTS({
              crossOrigin: "anonymous",
              dimensions: {
                Time: "current",
              },
              attributions: attribution,
              url: "https://wmts10.geo.admin.ch/1.0.0/{Layer}/default/{Time}/2056/{TileMatrix}/{TileCol}/{TileRow}.jpeg",
              tileGrid: tileGrid,
              projection: getProjection(this.srs),
              layer: "ch.swisstopo.pixelkarte-farbe",
              requestEncoding: "REST",
            }),
          }),
          new TileLayer({
            maxResolution: 2.5,
            source: new WMTS({
              crossOrigin: "anonymous",
              dimensions: {
                Time: "current",
              },
              attributions: attribution,
              url: "https://wmts10.geo.admin.ch/1.0.0/{Layer}/default/{Time}/2056/{TileMatrix}/{TileCol}/{TileRow}.png",
              tileGrid: tileGrid,
              projection: getProjection(this.srs),
              layer: "ch.swisstopo.swisstlm3d-karte-farbe",
              requestEncoding: "REST",
            }),
          }),
        ],
      }),
      new TileLayer({
        visible: this.state.basemap === "greymap",
        name: "greymap",
        zIndex: 1,
        source: new WMTS({
          crossOrigin: "anonymous",
          attributions: attribution,
          url: "https://wmts10.geo.admin.ch/1.0.0/{Layer}/default/current/2056/{TileMatrix}/{TileCol}/{TileRow}.jpeg",
          tileGrid: tileGrid,
          projection: getProjection(this.srs),
          layer: "ch.swisstopo.pixelkarte-grau",
          requestEncoding: "REST",
        }),
      }),
      new TileLayer({
        visible: this.state.basemap === "satellite",
        name: "satellite",
        zIndex: 2,
        source: new WMTS({
          crossOrigin: "anonymous",
          attributions: attribution,
          url: "https://wmts10.geo.admin.ch/1.0.0/{Layer}/default/current/2056/{TileMatrix}/{TileCol}/{TileRow}.jpeg",
          tileGrid: tileGrid,
          projection: getProjection(this.srs),
          layer: "ch.swisstopo.swissimage",
          requestEncoding: "REST",
        }),
      }),
    ];

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
      layers: this.layers,
      target: "map",
      view: new View({
        maxResolution: 611,
        minResolution: 0.1,
        resolution: 500,
        center: center,
        projection: projection,
        extent: extent,
        showFullExtent: true,
      }),
    });

    // Loading user's layers
    for (var identifier in this.props.layers) {
      if (Object.prototype.hasOwnProperty.call(this.props.layers, identifier)) {
        const layer = this.props.layers[identifier];

        if (layer.type === "WMS") {
          this.overlays.push(
            new TileLayer({
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
                },
                // Countries have transparency, so do not fade tiles:
                transition: 0,
              }),
              zIndex: layer.position + this.layers.length + 1,
            }),
          );
        } else if (layer.type === "WMTS") {
          this.overlays.push(
            new TileLayer({
              visible: this.state.basemap === identifier,
              name: identifier,
              opacity: 1,
              source: new WMTS({
                ...layer.conf,
                projection: getProjection(layer.conf.projection),
                tileGrid: new WMTSTileGrid(layer.conf.tileGrid),
              }),
            }),
          );
        }
        this.map.addLayer(this.overlays[this.overlays.length - 1]);
      }
    }

    getGeojson(this.props.searchState.filter)
      .then(
        function (response) {
          if (response.data.success) {
            this.points = new VectorSource();

            const clusterSource = new Cluster({
              distance: 40,
              minDistance: 35,
              source: this.points,
            });

            // Display clusters for resolutions >= 20.
            const clusterLayer = new VectorLayer({
              source: clusterSource,
              name: "clusters",
              zIndex: this.overlays.length + this.layers.length + 1,
              style: features => {
                const size = features.get("features").length;
                return this.clusterStyleFunction(size);
              },
              minResolution: 20,
            });

            // Display original point layer for resolutions <= 20.
            const pointLayer = new VectorLayer({
              name: "points",
              zIndex: this.overlays.length + this.layers.length + 1,
              source: this.points,
              style: this.styleFunction.bind(this),
              maxResolution: 20,
            });

            this.map.addLayer(clusterLayer);
            this.map.addLayer(pointLayer);

            // Zoom to cluster extent if clicked on cluster.
            this.map.on("click", event => {
              if (clusterLayer) {
                const features = this.map.getFeaturesAtPixel(event.pixel, {
                  layerFilter: layerCandidate => {
                    return layerCandidate.get("name") === "clusters";
                  },
                });
                if (features?.length > 0) {
                  const clusterMembers = features[0].get("features");
                  const view = this.map.getView();
                  if (clusterMembers.length > 1) {
                    // Calculate the extent of the cluster members.
                    const extent = createEmpty();
                    clusterMembers.forEach(feature => extend(extent, feature.getGeometry().getExtent()));
                    // Zoom to the extent of the cluster members.
                    view.fit(extent, {
                      duration: 500,
                      padding: [50, 50, 50, 50],
                    });
                    this.props.setmapfilter?.(true);
                    this.props.filterByExtent?.(extent);
                  } else {
                    // Go zoom to single point.
                    const coordinates = clusterMembers[0].getGeometry().getCoordinates();
                    view.setCenter(coordinates);
                    view.setResolution(15);
                  }
                }
              }
            });

            this.popup = new Overlay({
              position: undefined,
              positioning: "bottom-center",
              element: document.getElementById("popup-overlay"),
              stopEvent: false,
            });
            this.map.addOverlay(this.popup);

            // Register map events
            this.map.on("moveend", this.moveEnd);

            // On point over interaction
            const selectPointerMove = new Select({
              condition: pointerMove,
            });
            selectPointerMove.on("select", this.hover);
            this.map.addInteraction(selectPointerMove);

            this.selectClick = new Select({
              condition: click,
              layers: layerCandidate => {
                return layerCandidate.get("name") === "points";
              },
              style: this.styleFunction.bind(this),
            });
            this.selectClick.on("select", this.selected);
            this.map.addInteraction(this.selectClick);

            this.points.addFeatures(new GeoJSON().readFeatures(response.data.data));

            let extent = this.props.searchState.extent?.length
              ? this.props.searchState.extent
              : this.points.getExtent();

            this.map.getView().fit(extent);

            if (this.props.searchState.resolution) {
              this.map.getView().setResolution(this.props.searchState.resolution);
            }

            this.moveEnd();
          }
        }.bind(this),
      )
      .catch(function (error) {
        console.log(error);
      });
  }

  componentDidUpdate(prevProps) {
    const { centerto, searchState, highlighted, hover, layers, zoomto } = this.props;
    const view = this.map.getView();
    let refresh = false;
    // Check overlays apparence
    const keys = Object.keys(layers);
    for (const identifier of keys) {
      for (let c = 0, l = this.overlays.length; c < l; c++) {
        const layer = this.overlays[c];
        if ((layer.get("name") !== undefined) & (layer.get("name") === identifier)) {
          layer.setVisible(layers[identifier].visibility);
          layer.setOpacity(1 - layers[identifier].transparency / 100);
          layer.setZIndex(layers[identifier].position + this.layers.length + 1);
        }
      }
    }

    if (this.points !== undefined && !_.isEqual(highlighted, prevProps.highlighted)) {
      if (highlighted.length > 0) {
        let feature = this.points.getFeatureById(highlighted[0]);
        this.popup.setPosition(undefined);
        if (feature !== null) {
          this.setState(
            {
              hover: feature,
            },
            () => {
              if (hover !== undefined) {
                hover(feature.getId());
              }
            },
          );
        } else {
          this.setState(
            {
              hover: null,
            },
            () => {
              if (hover !== undefined) {
                hover(null);
              }
            },
          );
        }
      } else {
        this.setState(
          {
            hover: null,
          },
          () => {
            if (hover !== undefined) {
              hover(null);
            }
          },
        );
      }
      refresh = true;
    }
    if (!_.isEqual(searchState.filter, prevProps.searchState.filter)) {
      if (_.isEqual(searchState.filter.extent, prevProps.searchState.filter.extent)) {
        refresh = true;
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
      }
    }
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
    if (refresh && this.selectClick && this.points) {
      this.selectClick.getFeatures().clear();
      this.points.changed();
    }

    this.map.updateSize();
    view.getResolution() < 1 && view.setResolution(1);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateWidth);
  }

  updateWidth() {
    this.setState({ sidebarWidth: this.sidebarRef?.current?.offsetWidth });
  }

  updateDimensions() {
    this.map.updateSize();
  }

  styleFunction(feature) {
    const { highlighted } = this.props;

    let selected = highlighted !== undefined && highlighted.indexOf(feature.getId()) > -1;
    let res = feature.get("restriction");
    let fill = null;
    if (res === "f") {
      fill = greenFill;
    } else if (["b", "g"].indexOf(res) >= 0) {
      fill = redFill;
    } else {
      fill = blackFill;
    }

    let conf = null;
    let kind = feature.get("kind");
    if (kind === "B") {
      // boreholes
      let image = boreholeStyleCache[res];
      if (!image) {
        image = new Circle({
          radius: 6,
          stroke: blackStroke,
          fill: fill,
        });
        boreholeStyleCache[res] = image;
      }

      conf = {
        image: image,
      };
    } else if (kind === "V") {
      // virtual borehole
      let image = virtualBoreholeStyleCache[res];
      if (!image) {
        image = new RegularShape({
          fill: fill,
          stroke: blackStroke,
          points: 5,
          radius: 8,
          radius2: 4,
          angle: 0,
        });
        virtualBoreholeStyleCache[res] = image;
      }

      conf = {
        image: image,
      };
    } else if (kind === "SS") {
      // trial pits
      let image = trialpitStyleCache[res];
      if (!image) {
        image = new RegularShape({
          fill: fill,
          stroke: blackStroke,
          points: 3,
          radius: 8,
          angle: 0,
        });
        trialpitStyleCache[res] = image;
      }

      conf = {
        image: image,
      };
    } else if (kind === "RS") {
      // dynamic probing
      let image = probingStyleCache[res];
      if (!image) {
        image = new RegularShape({
          fill: fill,
          stroke: blackStroke,
          points: 3,
          radius: 8,
          rotation: Math.PI,
          angle: 0,
        });
        probingStyleCache[res] = image;
      }

      conf = {
        image: image,
      };
    } else if (kind === "a") {
      // other
      let image = otherStyleCache[res];
      if (!image) {
        image = new RegularShape({
          fill: fill,
          stroke: blackStroke,
          points: 6,
          radius: 7,
          angle: 0,
        });
        otherStyleCache[res] = image;
      }

      conf = {
        image: image,
      };
    } else {
      // Not set
      let image = deepBoreholeStyleCache[res];
      if (!image) {
        image = new RegularShape({
          fill: fill,
          stroke: blackStroke,
          points: 4,
          radius: 8,
          rotation: 0.25 * Math.PI,
          angle: 0,
        });
        deepBoreholeStyleCache[res] = image;
      }

      conf = {
        image: image,
      };
    }

    if (selected) {
      return [innerSelectedStyle, outerSelectedStyle, new Style(conf)];
    }

    return [new Style(conf)];
  }

  clusterStyleFunction(length) {
    const circleSize = 8 + length.toString().length * 2.5;
    let clusterStyle = clusterStyleCache[circleSize];
    if (!clusterStyle) {
      clusterStyle = new Style({
        image: new Circle({
          radius: circleSize,
          stroke: new Stroke({
            color: "rgba(43, 132, 204, 0.5)",
            width: 8,
          }),
          fill: new Fill({
            color: "rgba(43, 132, 204, 1)",
          }),
        }),
        text: new Text({
          text: length.toString(),
          scale: 1.5,
          fill: new Fill({
            color: "#fff",
          }),
        }),
      });
      clusterStyleCache[circleSize] = clusterStyle;
    }

    clusterStyle.text_.text_ = length.toString();

    return clusterStyle;
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

  selected(e) {
    const { selected } = this.props;
    if (selected !== undefined) {
      if (e.selected.length > 0) {
        selected(e.selected[0].getId());
      } else {
        selected(null);
      }
    }
  }

  hover(e) {
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
        this.updateDimensions();
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
        <LayerSelectControl onShowLayerSelection={this.onShowLayerSelection} sidebarWidth={this.state.sidebarWidth} />
        <Sidebar
          sidebarRef={this.sidebarRef}
          state={this.state}
          setState={this.setState.bind(this)}
          layers={this.layers}
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
