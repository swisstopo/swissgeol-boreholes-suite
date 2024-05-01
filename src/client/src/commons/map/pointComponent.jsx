import React from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import { Map, View } from "ol";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Draw from "ol/interaction/Draw";
import Modify from "ol/interaction/Modify";
import Point from "ol/geom/Point";
import Feature from "ol/Feature";
import { defaults as defaultControls } from "ol/control";
import { get as getProjection } from "ol/proj";
import { register } from "ol/proj/proj4";
import proj4 from "proj4";
import { Segment, Button, Label, Icon } from "semantic-ui-react";
import { Box } from "@mui/material";
import { getHeight } from "../../api-lib/index";
import { fetchApiV2 } from "../../api/fetchApiV2";
import ZoomControls from "./zoomControls";
import { BasemapSelector } from "../../components/basemapSelector/basemapSelector";
import { swissExtent, updateBasemap, getBasemap } from "../../components/basemapSelector/basemaps";
import { BasemapContext } from "../../components/basemapSelector/basemapContext";
import { projections } from "../../commons/map/mapProjections";
import { detailMapStyleFunction } from "../../commons/map/mapStyleFunctions";

class PointComponent extends React.Component {
  static contextType = BasemapContext;
  constructor(props) {
    super(props);
    this.lh = false; // loading location queue
    this.changefeature = this.updatePointAndGetAddress.bind(this);
    this.detailMapStyleFunction = detailMapStyleFunction.bind(this);
    this.getAddress = this.getAddress.bind(this);
    this.setStateBound = this.setState.bind(this);
    this.srs = "EPSG:2056";

    _.forEach(projections, function (proj, srs) {
      proj4.defs(srs, proj);
    });
    register(proj4);

    this.state = {
      point: null,
      height: null,
      country: null,
      canton: null,
      municipality: null,
      address: false,
      displayedBaseMap: null,
    };
  }

  componentDidMount() {
    const center = [
      (swissExtent[2] - swissExtent[0]) / 2 + swissExtent[0],
      (swissExtent[3] - swissExtent[1]) / 2 + swissExtent[1],
    ];
    const projection = getProjection(this.srs);
    projection.setExtent(swissExtent);

    this.setState({ displayedBaseMap: this.context.currentBasemapName });

    this.map = new Map({
      controls: defaultControls({
        attribution: true,
        zoom: false,
        attributionOptions: {
          collapsed: false,
          collapsible: false,
        },
      }),
      layers: [getBasemap(this.context.currentBasemapName)],
      target: "point",
      view: new View({
        resolution: this.state.point !== null ? 1 : 500,
        minResolution: 0.05,
        center: this.state.point !== null ? this.state.point : center,
        projection: projection,
        extent: swissExtent,
        showFullExtent: true,
      }),
    });

    this.position = new VectorSource();
    this.map.addLayer(
      new VectorLayer({
        source: this.position,
        style: feature => {
          return this.detailMapStyleFunction(feature, this.props.highlighted);
        },
        zIndex: 100,
      }),
    );

    this.position.on("addfeature", e => this.updatePointAndGetAddress(e.feature), this);

    if (this.props.x !== 0 && this.props.y !== 0) {
      this.manageMapInteractions();
    }
  }

  componentDidUpdate(prevProps) {
    const { x, y, isEditable } = this.props;

    if (this.context.currentBasemapName !== this.state.displayedBaseMap) {
      this.setState({ displayedBaseMap: this.context.currentBasemapName });
      updateBasemap(this.map, this.context.currentBasemapName);
    }

    // update map if props have changed or no feature is present.
    if (x !== prevProps.x || y !== prevProps.y || this.position.getFeatures().length === 0) {
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
          const view = this.map.getView();
          view.fit(this.centerFeature.getGeometry());
          view.setResolution(1);
          this.position.on("addfeature", e => this.updatePointAndGetAddress(e.feature), this);
        }
      }
    }
    if (isEditable !== prevProps.isEditable) {
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
    view.fit(this.centerFeature.getGeometry());
    view.setResolution(1);
  };

  render() {
    const { isEditable } = this.props;
    return (
      <Segment
        style={{
          padding: "0px",
          flex: "1 1 100%",
        }}>
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
        <Box sx={{ position: "absolute", right: "0px", top: "425px" }}>
          <BasemapSelector marginBottom="0px" />
        </Box>
        <Box
          style={{
            bottom: "0px",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            padding: "0.5em",
            color: "white",
            backgroundColor: "#3e3e3e",
          }}>
          <Box
            sx={{
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
          </Box>
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
        </Box>
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
