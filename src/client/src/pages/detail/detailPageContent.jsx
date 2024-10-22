import React from "react";
import { withTranslation } from "react-i18next";
import { connect } from "react-redux";
import { Redirect, Route, Switch, withRouter } from "react-router-dom";
import { Box, Stack } from "@mui/material";
import { Dimmer, Loader } from "semantic-ui-react";
import _ from "lodash";
import PropTypes from "prop-types";
import { loadBorehole, patchBorehole, updateBorehole } from "../../api-lib";
import { theme } from "../../AppTheme";
import { AlertContext } from "../../components/alert/alertContext";
import EditorBoreholeFilesTable from "./attachments/table/editorBoreholeFilesTable.tsx";
import BoreholePanel from "./form/borehole/boreholePanel.jsx";
import Completion from "./form/completion/completion.jsx";
import FieldMeasurement from "./form/hydrogeology/fieldMeasurement.jsx";
import GroundwaterLevelMeasurement from "./form/hydrogeology/groundwaterLevelMeasurement.jsx";
import Hydrotest from "./form/hydrogeology/hydrotest.jsx";
import WaterIngress from "./form/hydrogeology/waterIngress.jsx";
import IdentifierSegment from "./form/location/identifierSegment.tsx";
import LocationSegment from "./form/location/locationSegment.tsx";
import NameSegment from "./form/location/nameSegment.tsx";
import RestrictionSegment from "./form/location/restrictionSegment.tsx";
import ChronostratigraphyPanel from "./form/stratigraphy/chronostratigraphy/chronostratigraphyPanel.jsx";
import Lithology from "./form/stratigraphy/lithology";
import LithostratigraphyPanel from "./form/stratigraphy/lithostratigraphy/lithostratigraphyPanel.jsx";
import WorkflowForm from "./form/workflow/workflowForm.jsx";

class DetailPageContent extends React.Component {
  static contextType = AlertContext;

  constructor(props) {
    super(props);
    this.updateAttributeDelay = {};
    this.state = {
      tab: 0,
      loadingFetch: false,
      patchFetch: false,
      creationFetch: false,
      identifier: null,
      identifierValue: "",

      // Stratigraphy
      newStartModal: false,
      stratigraphy_id: null,
      layer: null,
      layers: [],
      layerUpdated: null,

      // Finish
      note: "",
    };
    this.loadOrCreate = this.loadOrCreate.bind(this);
    this.checkLock = this.checkLock.bind(this);
    this.isNumber = this.isNumber.bind(this);
    this.updateNumber = this.updateNumber.bind(this);
    this.updateChange = this.updateChange.bind(this);
    this.patch = this.patch.bind(this);
  }

  componentDidMount() {
    const { match } = this.props;
    if (!_.isNil(match.params.id)) {
      this.loadOrCreate(parseInt(match.params.id, 10));
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.match.params.id !== null && this.props.match.params.id !== prevProps.match.params.id) {
      this.loadOrCreate(parseInt(this.props.match.params.id, 10));
    }
  }

  loadOrCreate(id) {
    if (_.isInteger(id)) {
      // request to edit a borehole
      this.setState(
        {
          loadingFetch: true,
          stratigraphy_id: null,
          layers: [],
          layer: null,
          borehole: this.empty,
        },
        () => {
          this.props
            .getBorehole(id)
            .then(response => {
              if (response.success) {
                this.setState({
                  loadingFetch: false,
                  stratigraphy_id:
                    _.isArray(response.data.stratigraphy) && response.data.stratigraphy.length > 0
                      ? response.data.stratigraphy[0].id
                      : null,
                });
              }
            })
            .catch(function (error) {
              console.log(error);
            });
        },
      );
    }
  }

  checkLock() {
    const { t, editingEnabled, editableByCurrentUser } = this.props;
    if (this.props.borehole.data.role !== "EDIT") {
      return false;
    }
    if (!editingEnabled) {
      if (editableByCurrentUser) {
        this.context.showAlert(t("errorStartEditing"), "error");
      }
      return false;
    }
    return true;
  }

  isNumber(value) {
    return /^-?\d*[.,]?\d*$/.test(value);
  }

  updateNumber(attribute, value, to = true) {
    if (!this.checkLock()) return;
    const state = {
      ...this.state,
      patchFetch: true,
    };
    const borehole = {
      ...this.props.borehole,
    };
    _.set(borehole.data, attribute, value);

    if (value === null) {
      this.setState(state, () => {
        this.patch(borehole.data, attribute, value, to);
      });
    } else if (/^-?\d*[.,]?\d*$/.test(value)) {
      this.setState(state, () => {
        this.patch(borehole.data, attribute, _.toNumber(value), to);
      });
    }
  }

  updateChange(attribute, value, to = true) {
    if (this.checkLock() === false) {
      return;
    }
    const state = {
      ...this.state,
      patchFetch: true,
    };
    const borehole = {
      ...this.props.borehole,
    };
    if (attribute === "location") {
      _.set(borehole.data, "location_x", value[0]);
      _.set(borehole.data, "location_y", value[1]);
      if (value[2] !== null && this.isNumber(value[2])) {
        _.set(borehole.data, "elevation_z", value[2]);
      }
      _.set(borehole.data, "custom.country", value[3]);
      _.set(borehole.data, "custom.canton", value[4]);
      _.set(borehole.data, "custom.municipality", value[5]);
    } else {
      _.set(borehole.data, attribute, value);
    }
    this.setState(state, () => {
      this.patch(borehole.data, attribute, value, to);
    });
  }

  patch(borehole, attribute, value, to = true) {
    if (
      Object.prototype.hasOwnProperty.call(this.updateAttributeDelay, attribute) &&
      this.updateAttributeDelay[attribute]
    ) {
      clearTimeout(this.updateAttributeDelay[attribute]);
      this.updateAttributeDelay[attribute] = false;
    }
    this.updateAttributeDelay[attribute] = setTimeout(
      () => {
        patchBorehole(borehole.id, attribute, value)
          .then(response => {
            if (response.data.success) {
              this.setState(
                {
                  patchFetch: false,
                },
                () => {
                  borehole.lock = response.data.lock;
                  borehole.updater = response.data.updater;
                  if (response.data.location) {
                    borehole.custom.country = response.data.location.country;
                    borehole.custom.canton = response.data.location.canton;
                    borehole.custom.municipality = response.data.location.municipality;
                  }
                  this.props.updateBorehole(borehole);
                },
              );
            } else if (response.status === 200) {
              this.context.showAlert(response.data.message, "error");
              if (response.data.error === "errorLocked") {
                this.setState(
                  {
                    patchFetch: false,
                  },
                  () => {
                    borehole.lock = null;
                    this.props.updateBorehole(borehole);
                  },
                );
              } else {
                window.location.reload();
              }
            }
          })
          .catch(error => {
            console.error(error);
          });
      },
      to ? 500 : 0,
    );
  }

  render() {
    const { t, borehole, editingEnabled } = this.props;
    if (borehole.error !== null) {
      return <div>{t(borehole.error, borehole.data)}</div>;
    }

    const id = this.props?.match?.params?.id;

    return (
      <>
        <Box
          sx={{
            height: "100%",
            display: "flex",
            flex: "1 1 100%",
            flexDirection: "column",
            px: 11,
            py: 5,
            overflowY: "auto",
            backgroundColor: theme.palette.background.lightgrey,
          }}>
          <Dimmer.Dimmable
            as={"div"}
            dimmed={
              borehole.isFetching === true || this.state.loadingFetch === true || this.state.creationFetch === true
            }
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
            }}>
            <Dimmer
              active={
                borehole.isFetching === true || this.state.loadingFetch === true || this.state.creationFetch === true
              }
              inverted>
              <Loader>
                {(() => {
                  if (borehole.isFetching || this.state.loadingFetch === true) {
                    return t("layer_loading_fetch");
                  } else if (this.state.creationFetch === true) {
                    return t("layer_creation_fetch");
                  }
                })()}
              </Loader>
            </Dimmer>
            <Switch>
              <Route
                exact
                path={"/:id"}
                render={() => (
                  <Box>
                    <Stack gap={3} mr={2}>
                      <IdentifierSegment
                        borehole={borehole}
                        updateBorehole={this.props.updateBorehole}
                        editingEnabled={editingEnabled}></IdentifierSegment>
                      <NameSegment
                        borehole={borehole}
                        updateChange={this.updateChange}
                        editingEnabled={editingEnabled}></NameSegment>
                      <RestrictionSegment
                        borehole={borehole}
                        updateChange={this.updateChange}
                        editingEnabled={editingEnabled}></RestrictionSegment>
                      <LocationSegment
                        borehole={borehole}
                        editingEnabled={editingEnabled}
                        updateChange={this.updateChange}
                        updateNumber={this.updateNumber}
                        domains={this.props.domains}></LocationSegment>
                    </Stack>
                  </Box>
                )}
              />
              <Route
                exact
                path={"/:id/borehole"}
                render={() => (
                  <BoreholePanel
                    boreholeId={id}
                    borehole={borehole}
                    updateChange={this.updateChange}
                    updateNumber={this.updateNumber}
                    isEditable={editingEnabled}
                  />
                )}
              />
              <Route
                exact
                path={"/:id/stratigraphy/lithology"}
                render={() => <Lithology id={parseInt(id, 10)} unlocked={editingEnabled} checkLock={this.checkLock} />}
              />
              <Route
                exact
                path={"/:id/stratigraphy/chronostratigraphy"}
                render={() => <ChronostratigraphyPanel id={parseInt(id, 10)} isEditable={editingEnabled} />}
              />
              <Route
                exact
                path={"/:id/stratigraphy/lithostratigraphy"}
                render={() => <LithostratigraphyPanel id={parseInt(id, 10)} isEditable={editingEnabled} />}
              />
              <Route
                path={"/:id/stratigraphy"}
                render={() => {
                  return (
                    <Redirect
                      to={{
                        pathname: `/${id}/stratigraphy/lithology`,
                      }}
                    />
                  );
                }}
              />
              <Route
                exact
                path={"/:id/attachments"}
                render={() => <EditorBoreholeFilesTable id={parseInt(id, 10)} unlocked={editingEnabled} />}
              />
              <Route
                exact
                path={"/:id/hydrogeology/wateringress"}
                render={() => <WaterIngress isEditable={editingEnabled} boreholeId={parseInt(id, 10)} />}
              />
              <Route
                exact
                path={"/:id/hydrogeology/groundwaterlevelmeasurement"}
                render={() => <GroundwaterLevelMeasurement isEditable={editingEnabled} boreholeId={parseInt(id, 10)} />}
              />
              <Route
                exact
                path={"/:id/hydrogeology/fieldmeasurement"}
                render={() => <FieldMeasurement isEditable={editingEnabled} boreholeId={parseInt(id, 10)} />}
              />
              <Route
                exact
                path={"/:id/hydrogeology/hydrotest"}
                render={() => <Hydrotest isEditable={editingEnabled} boreholeId={parseInt(id, 10)} />}
              />
              <Route
                path={"/:id/hydrogeology"}
                render={() => {
                  return (
                    <Redirect
                      to={{
                        pathname: `/${id}/hydrogeology/wateringress`,
                      }}
                    />
                  );
                }}
              />
              <Route
                path={"/:boreholeId/completion/:completionId"}
                render={() => <Completion isEditable={editingEnabled} />}
              />
              <Route path={"/:boreholeId/completion"} render={() => <Completion isEditable={editingEnabled} />} />
              <Route
                exact
                path={"/:id/status"}
                render={() => <WorkflowForm id={parseInt(this.props.match.params.id, 10)} />}
              />
            </Switch>
          </Dimmer.Dimmable>
        </Box>
      </>
    );
  }
}

DetailPageContent.propTypes = {
  borehole: PropTypes.object,
  getBorehole: PropTypes.func,
  id: PropTypes.number,
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string,
    }),
  }),
  t: PropTypes.func,
  updateBorehole: PropTypes.func,
  workflow: PropTypes.object,
  editingEnabled: PropTypes.bool,
  editableByCurrentUser: PropTypes.bool,
};

DetailPageContent.defaultProps = {
  id: undefined,
};

const mapStateToProps = state => {
  return {
    borehole: state.core_borehole,
    workflow: state.core_workflow,
    domains: state.core_domain_list,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    dispatch: dispatch,
    getBorehole: id => {
      return dispatch(loadBorehole(id));
    },
    updateBorehole: data => {
      return dispatch(updateBorehole(data));
    },
  };
};

const ConnectedDetailPageContent = withRouter(
  connect(mapStateToProps, mapDispatchToProps)(withTranslation(["common"])(DetailPageContent)),
);
export default ConnectedDetailPageContent;
