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
import { defaults as defaultControls } from "ol/control/util";
import { get as getProjection } from "ol/proj";
import { register } from "ol/proj/proj4";
import proj4 from "proj4";
import { Segment, Button, Label, Icon } from "semantic-ui-react";
import { getHeight, getAddressByPoint } from "../../api-lib/index";

const projections = {
  "EPSG:21781":
    "+proj=somerc +lat_0=46.95240555555556 +lon_0=7.439583333333333 +k_0=1 +x_0=600000 +y_0=200000 +ellps=bessel +towgs84=674.4,15.1,405.3,0,0,0,0 +units=m +no_defs",
  "EPSG:2056":
    "+proj=somerc +lat_0=46.95240555555556 +lon_0=7.439583333333333 +k_0=1 +x_0=2600000 +y_0=1200000 +ellps=bessel +towgs84=674.374,15.056,405.346,0,0,0,0 +units=m +no_defs",
  "EPSG:21782":
    "+proj=somerc +lat_0=46.95240555555556 +lon_0=7.439583333333333 +k_0=1 +x_0=0 +y_0=0 +ellps=bessel +towgs84=674.4,15.1,405.3,0,0,0,0 +units=m +no_defs",
  "EPSG:4149":
    "+proj=longlat +ellps=bessel +towgs84=674.4,15.1,405.3,0,0,0,0 +no_defs",
  "EPSG:4150":
    "+proj=longlat +ellps=bessel +towgs84=674.374,15.056,405.346,0,0,0,0 +no_defs",
};

class PointComponent extends React.Component {
  constructor(props) {
    super(props);
    this.lh = false; // loading location queue
    this.changefeature = this.changefeature.bind(this);
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
      toPoint: null,
      height: null,
      satellite: false,
      cid: null,
      canton: null,
      mid: null,
      municipality: null,
      address: false,
    };
  }

  componentDidMount() {
    const resolutions = [
      4000, 3750, 3500, 3250, 3000, 2750, 2500, 2250, 2000, 1750, 1500, 1250,
      1000, 750, 650, 500, 250, 100, 50, 20, 10, 5, 2.5, 2, 1.5, 1, 0.5,
    ];
    const extent = [2420000, 1030000, 2900000, 1350000];
    const center = [
      (extent[2] - extent[0]) / 2 + extent[0],
      (extent[3] - extent[1]) / 2 + extent[1],
    ];
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
        center: this.state.point !== null ? this.state.point : center,
        projection: projection,
        extent: extent,
      }),
    });

    this.position = new VectorSource();
    this.map.addLayer(
      new VectorLayer({
        source: this.position,
        style: this.styleFunction,
      }),
    );

    // ol Drawing point interaction declaration
    this.draw = new Draw({
      type: "Point",
      source: this.position,
    });
    this.map.addInteraction(this.draw);

    // ol Modify point interaction declaration
    this.modify = new Modify({
      source: this.position,
    });
    this.map.addInteraction(this.modify);

    if (this.state.point !== null) {
      this.centerFeature = new Feature({
        name: "Center",
        geometry: new Point(this.state.point),
      });
      this.position.addFeature(this.centerFeature);
      this.draw.setActive(false);
    } else {
      this.draw.setActive(true);
    }

    this.position.on("addfeature", this.changefeature, this);
    this.position.on("changefeature", this.changefeature, this);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (
      _.isNumber(nextProps.x) &&
      _.isNumber(nextProps.y) &&
      nextProps.x + nextProps.y !== 0
    ) {
      const point = [nextProps.x, nextProps.y];
      if (!_.isEqual(point, this.state.point)) {
        this.setState(
          {
            point: point,
            toPoint: [nextProps.x, nextProps.y],
            address: true,
          },
          () => {
            this.getAddress(point);
          },
        );
        this.draw.setActive(false);
        this.position.un("changefeature", this.changefeature, this);
        this.position.un("addfeature", this.changefeature, this);
        if (this.centerFeature) {
          this.centerFeature.getGeometry().setCoordinates(point);
        } else {
          this.centerFeature = new Feature({
            name: "Center",
            geometry: new Point(point),
          });
          this.position.addFeature(this.centerFeature);
        }
        this.map.getView().fit(this.centerFeature.getGeometry(), {
          minResolution: 1,
        });
        this.position.on("changefeature", this.changefeature, this);
        this.position.on("addfeature", this.changefeature, this);
      }
    }
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

  /*
      Function fired as soon the editing vector source
      is changed.
  */
  changefeature(ev) {
    const { changefeature } = this.props;
    let feature = ev.feature;
    let coordinates = feature.getGeometry().getCoordinates();
    if (this.centerFeature === undefined) {
      this.centerFeature = feature;
    }
    this.setState(
      {
        point: coordinates,
        height: null,
        toPoint: coordinates,
        cid: null,
        canton: null,
        mid: null,
        municipality: null,
        address: true,
      },
      () => {
        // Callback after state is updated
        if (_.isFunction(changefeature)) {
          changefeature(this.state.toPoint);
        }
        this.getAddress(coordinates);
      },
    );
    this.draw.setActive(false);
  }

  getAddress(coordinates) {
    if (this.lh !== false) {
      clearTimeout(this.lh);
      this.lh = false;
    }
    this.lh = setTimeout(
      function () {
        getAddressByPoint(coordinates[0], coordinates[1]).then(response => {
          this.setState({
            address: false,
            ...response.data.data,
          });
        });
      }.bind(this),
      500,
    );
  }

  styleFunction(feature, resolution) {
    const { highlighted } = this.props;

    let selected =
      highlighted !== undefined && highlighted.indexOf(feature.get("id")) > -1;

    let conf = {
      image: new Circle({
        radius: selected ? 10 : 6,
        fill: selected
          ? new Fill({ color: "rgba(255, 0, 0, 0.8)" })
          : new Fill({ color: "rgba(0, 255, 0, 1)" }),
        stroke: new Stroke({ color: "black", width: 1 }),
      }),
    };

    return [new Style(conf)];
  }

  render() {
    const { satellite } = this.state;
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
            right: "6px",
            zIndex: "1",
          }}>
          <Button
            active={satellite}
            color="black"
            onClick={e => {
              this.setState(
                {
                  satellite: !satellite,
                },
                a => {
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
              {_.isArray(this.state.toPoint)
                ? "E" +
                  _.round(this.state.toPoint[0], 2).toLocaleString() +
                  " N" +
                  _.round(this.state.toPoint[1], 2).toLocaleString()
                : "n/p"}
              <Label.Detail>{this.srs}</Label.Detail>
            </Label>
            {_.compact([this.state.municipality, this.state.canton]).length >
            0 ? (
              <Label color="black">
                {_.compact([this.state.municipality, this.state.canton]).join(
                  ", ",
                )}
              </Label>
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
                disabled={!_.isArray(this.state.toPoint) || this.state.address}
                loading={this.state.address}
                onClick={e => {
                  if (_.isFunction(this.props.applyChange)) {
                    this.props.setMapPointChange(true);
                    this.props.applyChange(
                      _.round(this.state.toPoint[0], 2),
                      _.round(this.state.toPoint[1], 2),
                      this.state.height !== null
                        ? parseFloat(this.state.height)
                        : null,
                      this.state.cid,
                      this.state.mid,
                    );
                  }
                }}
                size="mini">
                Apply
              </Button>
              <Button
                disabled={!_.isArray(this.state.toPoint)}
                icon
                onClick={e => {
                  if (_.isFunction(this.props.applyChange)) {
                    getHeight(this.state.point[0], this.state.point[1]).then(
                      response => {
                        this.setState({
                          height:
                            response.status === 200
                              ? response.data.height
                              : null,
                        });
                      },
                    );
                  }
                }}
                size="mini">
                <Icon name="resize vertical" />
              </Button>
              <Button
                disabled={false}
                icon
                onClick={e => {
                  this.map.getView().fit(this.centerFeature.getGeometry(), {
                    minResolution: 1,
                  });
                }}
                size="mini">
                <Icon name="compress" />
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
