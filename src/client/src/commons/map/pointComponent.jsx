import React from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import WMTSTileGrid from "ol/tilegrid/WMTS";
import LayerGroup from "ol/layer/Group";
import WMTS from "ol/source/WMTS";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Stroke from "ol/style/Stroke";
import Fill from "ol/style/Fill";
import Style from "ol/style/Style";
import Circle from "ol/style/Circle";
import Draw from "ol/interaction/Draw";
import Modify from "ol/interaction/Modify";
import Point from "ol/geom/Point";
import Polygon from "ol/geom/Polygon";
import Feature from "ol/Feature";
import { defaults as defaultControls } from "ol/control";
import { get as getProjection } from "ol/proj";
import { register } from "ol/proj/proj4";
import proj4 from "proj4";
import { Segment, Button, Label, Icon } from "semantic-ui-react";
import { getHeight } from "../../api-lib/index";
import { fetchApiV2 } from "../../api/fetchApiV2";
import ZoomControls from "./zoomControls";

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

class PointComponent extends React.Component {
  constructor(props) {
    super(props);
    this.lh = false; // loading location queue
    this.changefeature = this.updatePointAndGetAddress.bind(this);
    this.styleFunction = this.styleFunction.bind(this);
    this.getAddress = this.getAddress.bind(this);
    this.zoomtopoly = this.zoomtopoly.bind(this);
    this.srs = "EPSG:2056";

    _.forEach(projections, function (proj, srs) {
      proj4.defs(srs, proj);
    });
    register(proj4);

    this.state = {
      point: null,
      height: null,
      satellite: false,
      country: null,
      canton: null,
      municipality: null,
      address: false,
    };
  }

  componentDidMount() {
    const resolutions = [
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
    this.map = new Map({
      controls: defaultControls({
        attribution: true,
        zoom: false,
        attributionOptions: {
          collapsed: false,
          collapsible: false,
        },
      }),
      layers: [
        new LayerGroup({
          visible: !this.state.satellite,
          layers: [
            new TileLayer({
              minResolution: 2.5,
              source: new WMTS({
                crossOrigin: "anonymous",
                attributions: attribution,
                url: "https://wmts10.geo.admin.ch/1.0.0/{Layer}/default/current/2056/{TileMatrix}/{TileCol}/{TileRow}.jpeg",
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
                attributions: attribution,
                url: "https://wmts10.geo.admin.ch/1.0.0/{Layer}/default/current/2056/{TileMatrix}/{TileCol}/{TileRow}.png",
                tileGrid: tileGrid,
                projection: getProjection(this.srs),
                layer: "ch.swisstopo.swisstlm3d-karte-farbe",
                requestEncoding: "REST",
              }),
            }),
          ],
        }),
        new TileLayer({
          visible: this.state.satellite,
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
      ],
      target: "point",
      view: new View({
        resolution: this.state.point !== null ? 1 : 500,
        minResolution: 0.1,
        center: this.state.point !== null ? this.state.point : center,
        projection: projection,
        extent: extent,
        showFullExtent: true,
      }),
    });

    this.position = new VectorSource();
    this.map.addLayer(
      new VectorLayer({
        source: this.position,
        style: this.styleFunction,
      }),
    );

    this.position.on("addfeature", e => this.updatePointAndGetAddress(e.feature), this);

    if (this.props.x !== 0 && this.props.y !== 0) {
      this.manageMapInteractions();
    }
  }

  componentDidUpdate(previousProps) {
    const { x, y, isEditable } = this.props;
    // update map if props have changed or no feature is present.
    if (x !== previousProps.x || y !== previousProps.y || this.position.getFeatures().length === 0) {
      if (_.isNumber(x) && _.isNumber(y) && x + y !== 0) {
        const point = [x, y];
        if (!_.isEqual(point, this.state.point)) {
          this.setState(
            {
              point: point,
              address: true,
            },
            () => {
              this.getAddress(point);
            },
          );

          this.position.un("addfeature", e => this.updatePointAndGetAddress(e.feature), this);
          this.drawOrUpdatePoint(point);
          this.map.getView().fit(this.centerFeature.getGeometry(), { resolution: 1 });

          this.position.on("addfeature", e => this.updatePointAndGetAddress(e.feature), this);
        }
      }
    }
    if (isEditable !== previousProps.isEditable) {
      this.manageMapInteractions();
    }
  }

  drawOrUpdatePoint(point) {
    if (this.centerFeature) {
      this.centerFeature.getGeometry().setCoordinates(point);
    } else {
      this.centerFeature = new Feature({
        name: "Center",
        geometry: new Point(point),
      });
      this.position.addFeature(this.centerFeature);
      this.map.getView().setResolution(1);
      this.map.getView().setCenter(point);
    }
  }

  removeMapFeature() {
    this.centerFeature = null;
    this.position.clear();
    this.setState({
      ...this.state,
      point: null,
    });
  }

  manageMapInteractions() {
    const { x, y, isEditable } = this.props;
    const point = x && y ? [x, y] : null;
    if (isEditable) {
      if (point) {
        this.drawOrUpdatePoint(point);
        this.allowModifying();
      } else {
        this.allowDrawing();
      }
    } else {
      if (point) {
        this.drawOrUpdatePoint(point);
      } else {
        this.removeMapFeature();
      }
      this.map.removeInteraction(this.draw);
      this.map.removeInteraction(this.modify);
    }
  }

  allowDrawing() {
    if (!this.draw) {
      this.draw = new Draw({
        type: "Point",
        source: this.position,
      });
    }
    this.map.addInteraction(this.draw);
    this.map.removeInteraction(this.modify);
  }

  allowModifying() {
    if (!this.modify) {
      this.modify = new Modify({
        source: this.position,
      });
    }

    this.modify.on("modifyend", e => this.updatePointAndGetAddress(e.features.array_[0]));

    this.map.addInteraction(this.modify);
    this.map.removeInteraction(this.draw);
  }

  zoomtopoly(coords) {
    var feature = new Feature({
      geometry: new Polygon(coords),
    });
    this.map.getView().fit(feature.getGeometry(), {
      nearest: true,
      duration: 500,
    });
  }

  /**
   * Updates the point state and queries the address of the given point location.
   * This method gets called everytime a feature is added or edited.
   * @param {Feature} feature
   */
  updatePointAndGetAddress(feature) {
    const { changefeature } = this.props;
    let coordinates = feature.getGeometry().getCoordinates();

    // remove last feature if necessary, so that
    // only one point at the same time is visible.
    const features = this.position.getFeatures();
    const currentFeatureIndex = features.indexOf(feature);
    const lastFeature = features[currentFeatureIndex - 1];
    if (lastFeature) {
      this.position.removeFeature(lastFeature);
    }

    if (this.centerFeature === undefined) {
      this.centerFeature = feature;
    }
    this.setState(
      {
        point: coordinates,
        height: null,
        canton: null,
        municipality: null,
        address: true,
      },
      () => {
        // Callback after state is updated
        if (_.isFunction(changefeature)) {
          changefeature(this.state.point);
        }
        this.getAddress(coordinates);
      },
    );
  }

  getAddress(coordinates) {
    if (this.lh !== false) {
      clearTimeout(this.lh);
      this.lh = false;
    }
    this.lh = setTimeout(
      async function () {
        var location = await fetchApiV2(`location/identify?east=${coordinates[0]}&north=${coordinates[1]}`, "GET");
        this.setState({
          address: false,
          ...location,
        });
      }.bind(this),
      500,
    );
  }

  styleFunction(feature) {
    const { highlighted } = this.props;

    let selected = highlighted !== undefined && highlighted.indexOf(feature.getId()) > -1;

    let conf = {
      image: new Circle({
        radius: selected ? 10 : 6,
        fill: selected ? new Fill({ color: "rgba(255, 0, 0, 0.8)" }) : new Fill({ color: "rgba(0, 255, 0, 1)" }),
        stroke: new Stroke({ color: "black", width: 1 }),
      }),
    };

    return [new Style(conf)];
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
    view.fit(this.centerFeature.getGeometry(), { resolution: 1 });
  };

  render() {
    const { satellite } = this.state;
    const { isEditable } = this.props;
    return (
      <Segment
        style={{
          padding: "0px",
          flex: "1 1 100%",
        }}>
        <div
          style={{
            position: "absolute",
            top: "6px",
            left: "6px",
            zIndex: "1",
          }}>
          <Button
            active={satellite}
            color="black"
            onClick={() => {
              this.setState(
                {
                  satellite: !satellite,
                },
                () => {
                  const layers = this.map.getLayers().getArray();
                  layers[0].setVisible(!this.state.satellite);
                  layers[1].setVisible(this.state.satellite);
                },
              );
            }}
            size="mini"
            toggle>
            Satellite
          </Button>
        </div>
        <div
          className="stbg"
          id="point"
          style={{
            padding: "0px",
            flex: "1 1 100%",
            height: 450,
          }}
        />
        <ZoomControls onZoomIn={this.onZoomIn} onZoomOut={this.onZoomOut} onFitToExtent={this.onFitToExtent} />
        <div
          style={{
            bottom: "0px",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            padding: "0.5em",
            color: "white",
            backgroundColor: "#3e3e3e",
          }}>
          <div
            style={{
              flex: "1 1 100%",
            }}>
            <Label color="black">
              <Icon name="map marker" />
              {_.isArray(this.state.point)
                ? "E" +
                  _.round(this.state.point[0], 2).toLocaleString() +
                  " N" +
                  _.round(this.state.point[1], 2).toLocaleString()
                : "n/p"}
              <Label.Detail>{this.srs}</Label.Detail>
            </Label>
            {_.compact([this.state.municipality, this.state.canton]).length > 0 ? (
              <Label color="black">{_.compact([this.state.municipality, this.state.canton]).join(", ")}</Label>
            ) : null}
            {this.state.height !== null ? (
              <Label color="blue">
                <Icon name="resize vertical" /> {this.state.height} m
              </Label>
            ) : null}
          </div>
          <div>
            <Button.Group size="mini">
              <Button
                data-cy="apply-button"
                disabled={!_.isArray(this.state.point) || this.state.address || !isEditable}
                loading={this.state.address}
                onClick={() => {
                  if (_.isFunction(this.props.applyChange)) {
                    if (this.props.x !== this.state.point[0] || this.props.y !== this.state.point[1]) {
                      this.props.setMapPointChange(true);
                    }
                    this.props.applyChange(
                      _.round(this.state.point[0], 2),
                      _.round(this.state.point[1], 2),
                      this.state.height !== null ? parseFloat(this.state.height) : null,
                      this.state.country,
                      this.state.canton,
                      this.state.municipality,
                    );
                  }
                }}
                size="mini">
                Apply
              </Button>
              <Button
                disabled={!_.isArray(this.state.point)}
                icon
                onClick={() => {
                  if (_.isFunction(this.props.applyChange)) {
                    getHeight(this.state.point[0], this.state.point[1]).then(response => {
                      this.setState({
                        height: response.status === 200 ? response.data.height : null,
                      });
                    });
                  }
                }}
                size="mini">
                <Icon name="resize vertical" />
              </Button>
            </Button.Group>
          </div>
        </div>
      </Segment>
    );
  }
}

PointComponent.propTypes = {
  applyChange: PropTypes.func,
  changefeature: PropTypes.func,
  x: PropTypes.number,
  y: PropTypes.number,
};

PointComponent.defaultProps = {
  x: null,
  y: null,
  srs: null,
};

export default PointComponent;
