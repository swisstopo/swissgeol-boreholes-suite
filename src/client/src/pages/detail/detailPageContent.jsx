import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { withTranslation } from "react-i18next";
import _ from "lodash";
import { Redirect, Route, Switch, withRouter } from "react-router-dom";
import { loadBorehole, patchBorehole, updateBorehole } from "../../api-lib";
import EditorBoreholeFilesTable from "./attachments/table/editorBoreholeFilesTable.tsx";
import { Dimmer, Loader } from "semantic-ui-react";
import Lithology from "./form/stratigraphy/lithology";
import IdentifierSegment from "./form/location/indentifierSegment.jsx";
import NameSegment from "./form/location/nameSegment.jsx";
import RestrictionSegment from "./form/location/restrictionSegment.jsx";
import BoreholePanel from "./form/borehole/boreholePanel.jsx";
import LocationSegment from "./form/location/locationSegment.jsx";
import WaterIngress from "./form/hydrogeology/waterIngress.jsx";
import GroundwaterLevelMeasurement from "./form/hydrogeology/groundwaterLevelMeasurement.jsx";
import Hydrotest from "./form/hydrogeology/hydrotest.jsx";
import FieldMeasurement from "./form/hydrogeology/fieldMeasurement.jsx";
import ChronostratigraphyPanel from "./form/stratigraphy/chronostratigraphy/chronostratigraphyPanel.jsx";
import LithostratigraphyPanel from "./form/stratigraphy/lithostratigraphy/lithostratigraphyPanel.jsx";
import Completion from "./form/completion/completion.jsx";
import { Box } from "@mui/material";
import WorkflowForm from "./form/workflow/workflowForm.jsx";
import { AlertContext } from "../../components/alert/alertContext";

class DetailPageContent extends React.Component {
  static contextType = AlertContext;

  constructor(props) {
    super(props);
    this.checkattribute = false;
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
    this.setStateBound = this.setState.bind(this);
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
    const { t } = this.props;
    if (this.props.borehole.data.role !== "EDIT") {
      this.context.showAlert(
        t("common:errorStartEditingWrongStatus", {
          status: this.props.borehole.data.role,
        }),
        "error",
      );
      return false;
    }
    if (this.props.borehole.data.lock === null || this.props.borehole.data.lock.id !== this.props.user.data.id) {
      this.context.showAlert(t("common:errorStartEditing"), "error");
      return false;
    }
    return true;
  }

  isNumber(value) {
    return /^-?\d*[.,]?\d*$/.test(value);
  }

  updateNumber(attribute, value, to = true) {
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
    const { t, borehole, user } = this.props;
    const size = null; // 'small'
    const isEditable =
      borehole?.data.role === "EDIT" && borehole?.data.lock !== null && borehole?.data.lock?.id === user?.data.id;
    if (borehole.error !== null) {
      return <div>{t(borehole.error, borehole.data)}</div>;
    }

    const id = this.props?.match?.params?.id;

    return (
      <>
        <Box
          style={{
            overflow: "hidden",
            height: "100%",
            display: "flex",
            flex: "1 1 100%",
            flexDirection: "column",
            padding: "1em",
          }}>
          <Dimmer.Dimmable
            as={"div"}
            dimmed={
              borehole.isFetching === true || this.state.loadingFetch === true || this.state.creationFetch === true
            }
            style={{
              flex: 1,
              overflowY: "hidden",
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
                  <div
                    style={{
                      flex: "1 1 0%",
                      padding: "1em",
                      overflowY: "auto",
                      display: "flex",
                      flexDirection: "column",
                    }}>
                    <IdentifierSegment
                      borehole={borehole}
                      identifier={this.state.identifier}
                      identifierValue={this.state.identifierValue}
                      setState={this.setStateBound}
                      updateBorehole={this.props.updateBorehole}
                      user={user}></IdentifierSegment>
                    <NameSegment
                      size={size}
                      borehole={borehole}
                      updateChange={this.updateChange}
                      user={user}></NameSegment>
                    <RestrictionSegment
                      size={size}
                      borehole={borehole}
                      updateChange={this.updateChange}
                      user={user}></RestrictionSegment>
                    <LocationSegment
                      size={size}
                      borehole={borehole}
                      user={user}
                      updateChange={this.updateChange}
                      updateNumber={this.updateNumber}
                      checkLock={this.checkLock}
                      domains={this.props.domains}></LocationSegment>
                  </div>
                )}
              />
              <Route
                exact
                path={"/:id/borehole"}
                render={() => (
                  <BoreholePanel
                    size={size}
                    boreholeId={id}
                    borehole={borehole}
                    updateChange={this.updateChange}
                    updateNumber={this.updateNumber}
                    isEditable={isEditable}
                  />
                )}
              />
              <Route
                exact
                path={"/:id/stratigraphy/lithology"}
                render={() => <Lithology id={parseInt(id, 10)} unlocked={isEditable} />}
              />
              <Route
                exact
                path={"/:id/stratigraphy/chronostratigraphy"}
                render={() => <ChronostratigraphyPanel id={parseInt(id, 10)} isEditable={isEditable} />}
              />
              <Route
                exact
                path={"/:id/stratigraphy/lithostratigraphy"}
                render={() => <LithostratigraphyPanel id={parseInt(id, 10)} isEditable={isEditable} />}
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
                render={() => <EditorBoreholeFilesTable id={parseInt(id, 10)} unlocked={isEditable} />}
              />
              <Route
                exact
                path={"/:id/hydrogeology/wateringress"}
                render={() => <WaterIngress isEditable={isEditable} boreholeId={parseInt(id, 10)} />}
              />
              <Route
                exact
                path={"/:id/hydrogeology/groundwaterlevelmeasurement"}
                render={() => <GroundwaterLevelMeasurement isEditable={isEditable} boreholeId={parseInt(id, 10)} />}
              />
              <Route
                exact
                path={"/:id/hydrogeology/fieldmeasurement"}
                render={() => <FieldMeasurement isEditable={isEditable} boreholeId={parseInt(id, 10)} />}
              />
              <Route
                exact
                path={"/:id/hydrogeology/hydrotest"}
                render={() => <Hydrotest isEditable={isEditable} boreholeId={parseInt(id, 10)} />}
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
                render={() => <Completion isEditable={isEditable} />}
              />
              <Route path={"/:boreholeId/completion"} render={() => <Completion isEditable={isEditable} />} />
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
};

DetailPageContent.defaultProps = {
  id: undefined,
};

const mapStateToProps = state => {
  return {
    borehole: state.core_borehole,
    workflow: state.core_workflow,
    domains: state.core_domain_list,
    user: state.core_user,
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

const ConnectedBoreholeForm = withRouter(
  connect(mapStateToProps, mapDispatchToProps)(withTranslation(["common"])(DetailPageContent)),
);
export default ConnectedBoreholeForm;
