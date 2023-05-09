import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { withTranslation } from "react-i18next";
import _ from "lodash";
import { Route, Switch, withRouter } from "react-router-dom";
import {
  updateBorehole,
  loadBorehole,
  checkBorehole,
  patchBorehole,
} from "../../../api-lib/index";

import EditorBoreholeFilesTable from "../../files/table/editorBoreholeFilesTable";
import TranslationText from "../translationText";

import { Dimmer, Loader } from "semantic-ui-react";
import Profile from "../profile";
import IdentifierSegment from "./segments/indentifierSegment";
import NameSegment from "./segments/nameSegment";
import RestrictionSegment from "./segments/restrictionSegment";
import BoreholeGeneralSegment from "./segments/boreholeGeneralSegment";
import BoreholeDetailSegment from "./segments/boreholeDetailSegment";
import LocationSegment from "./segments/locationSegment";
import WaterIngress from "./hydrogeology/waterIngress";
import { AlertContext } from "../../alert/alertContext";

class BoreholeForm extends React.Component {
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
      "extended.original_name_check": true,
      "extended.original_name_fetch": false,
      "custom.alternate_name_check": true,
      "custom.alternate_name_fetch": false,
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
    this.check = this.check.bind(this);
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
    if (
      this.props.match.params.id !== null &&
      this.props.match.params.id !== prevProps.match.params.id
    ) {
      this.loadOrCreate(parseInt(this.props.match.params.id, 10));
    }
  }

  loadOrCreate(id) {
    const self = this;
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
                self.setState({
                  loadingFetch: false,
                  stratigraphy_id:
                    _.isArray(response.data.stratigraphy) &&
                    response.data.stratigraphy.length > 0
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

  check(attribute, value) {
    const { t } = this.props;
    if (this.props.borehole.data.role !== "EDIT") {
      this.context.error(
        t("common:errorStartEditingWrongStatus", {
          status: this.props.borehole.data.role,
        }),
      );
      return;
    }
    if (
      this.props.borehole.data.lock === null ||
      this.props.borehole.data.lock.username !== this.props.user.data.username
    ) {
      this.context.error(t("common:errorStartEditing"));
      return;
    }
    // Check for uniqueness and patch
    const state = {
      ...this.state,
      patchFetch: true,
    };

    const borehole = {
      ...this.props.borehole.data,
    };
    _.set(borehole, attribute, value);
    state[attribute + "_fetch"] = true;

    // update state
    this.setState(state, () => {
      if (this.checkattribute) {
        clearTimeout(this.checkattribute);
        this.checkattribute = false;
      }
      this.checkattribute = setTimeout(() => {
        checkBorehole(attribute, value)
          .then(response => {
            if (response.data.success) {
              let state = {};
              state[attribute + "_check"] = response.data.check;
              state[attribute + "_fetch"] = false;
              this.setState(state);
              if (response.data.check) {
                // patch attribute
                patchBorehole(borehole.id, attribute, value)
                  .then(response => {
                    if (response.data.success) {
                      this.setState(
                        {
                          patchFetch: false,
                        },
                        () => {
                          borehole.percentage = response.data.percentage;
                          borehole.lock = response.data.lock;
                          borehole.updater = response.data.updater;
                          this.props.updateBorehole(borehole);
                        },
                      );
                    } else if (response.status === 200) {
                      this.context.error(response.data.message);
                      if (response.data.error === "E-900") {
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
              }
            }
          })
          .catch(function (error) {
            console.error(error);
          });
      }, 250);
    });
  }

  checkLock() {
    const { t } = this.props;
    if (this.props.borehole.data.role !== "EDIT") {
      this.context.error(
        t("common:errorStartEditingWrongStatus", {
          status: this.props.borehole.data.role,
        }),
      );
      return false;
    }
    if (
      this.props.borehole.data.lock === null ||
      this.props.borehole.data.lock.username !== this.props.user.data.username
    ) {
      this.context.error(t("common:errorStartEditing"));
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
      this.updateAttributeDelay.hasOwnProperty(attribute) &&
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
                  borehole.percentage = response.data.percentage;
                  borehole.lock = response.data.lock;
                  borehole.updater = response.data.updater;
                  if (response.data.location) {
                    borehole.custom.country = response.data.location.country;
                    borehole.custom.canton = response.data.location.canton;
                    borehole.custom.municipality =
                      response.data.location.municipality;
                  }
                  this.props.updateBorehole(borehole);
                },
              );
            } else if (response.status === 200) {
              this.context.error(response.data.message);
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
      borehole?.data.role === "EDIT" &&
      borehole?.data.lock !== null &&
      borehole?.data.lock?.username === user?.data.username;
    if (borehole.error !== null) {
      return <div>{t(borehole.error, borehole.data)}</div>;
    }

    return (
      <Dimmer.Dimmable
        as={"div"}
        dimmed={
          borehole.isFetching === true ||
          this.state.loadingFetch === true ||
          this.state.creationFetch === true
        }
        style={{
          flex: 1,
          overflowY: "hidden",
          display: "flex",
          flexDirection: "column",
        }}>
        <Dimmer
          active={
            borehole.isFetching === true ||
            this.state.loadingFetch === true ||
            this.state.creationFetch === true
          }
          inverted>
          <Loader>
            {(() => {
              if (borehole.isFetching || this.state.loadingFetch === true) {
                return <TranslationText id="layer_loading_fetch" />;
              } else if (this.state.creationFetch === true) {
                return <TranslationText id="layer_creation_fetch" />;
              }
            })()}
          </Loader>
        </Dimmer>
        <Switch>
          <Route
            exact
            path={process.env.PUBLIC_URL + "/editor/:id"}
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
                  setState={this.setState.bind(this)}
                  updateBorehole={
                    this.props.updateBorehole
                  }></IdentifierSegment>
                <NameSegment
                  size={size}
                  borehole={borehole}
                  originalNameCheck={this.state["extended.original_name_check"]}
                  originalNameFetch={this.state["extended.original_name_fetch"]}
                  alternateNameCheck={this.state["custom.alternate_name_check"]}
                  alternateNameFetch={this.state["custom.alternate_name_fetch"]}
                  updateChange={this.updateChange}
                  check={this.check}></NameSegment>
                <RestrictionSegment
                  size={size}
                  borehole={borehole}
                  updateChange={this.updateChange}></RestrictionSegment>
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
            path={process.env.PUBLIC_URL + "/editor/:id/borehole"}
            render={() => (
              <div
                style={{
                  flex: "1 1 0%",
                  padding: "1em",
                  overflowY: "auto",
                }}>
                <BoreholeGeneralSegment
                  size={size}
                  borehole={borehole}
                  updateChange={this.updateChange}
                  updateNumber={this.updateNumber}></BoreholeGeneralSegment>
                <BoreholeDetailSegment
                  size={size}
                  borehole={borehole}
                  updateChange={this.updateChange}
                  updateNumber={this.updateNumber}
                  t={t}
                  debug={this.props.developer.debug}></BoreholeDetailSegment>
              </div>
            )}
          />
          <Route
            exact
            path={process.env.PUBLIC_URL + "/editor/:id/stratigraphy"}
            render={() => (
              <Profile
                id={parseInt(this.props.match.params.id, 10)}
                kind="stratigraphy"
                unlocked={isEditable}
              />
            )}
          />
          <Route
            exact
            path={
              process.env.PUBLIC_URL +
              "/editor/:id/stratigraphy/chronostratigraphy"
            }
            render={() => (
              <Profile
                id={parseInt(this.props.match.params.id, 10)}
                kind="stratigraphy"
                isChronostratigraphy={true}
                unlocked={isEditable}
              />
            )}
          />

          <Route
            exact
            path={process.env.PUBLIC_URL + "/editor/:id/attachments"}
            render={() => (
              <EditorBoreholeFilesTable
                id={parseInt(this.props.match.params.id, 10)}
                unlocked={isEditable}
              />
            )}
          />
          <Route
            exact
            path={
              process.env.PUBLIC_URL + "/editor/:id/hydrogeology/wateringress"
            }
            render={() => (
              <WaterIngress
                isEditable={isEditable}
                boreholeId={borehole.data.id}
              />
            )}
          />
          <Route
            exact
            path={process.env.PUBLIC_URL + "/editor/:id/completion/casing"}
            render={() => (
              <Profile
                id={parseInt(this.props.match.params.id, 10)}
                kind="casing"
                unlocked={isEditable}
              />
            )}
          />
          <Route
            exact
            path={process.env.PUBLIC_URL + "/editor/:id/completion/instruments"}
            render={() => (
              <Profile
                id={parseInt(this.props.match.params.id, 10)}
                kind="instruments"
                unlocked={isEditable}
              />
            )}
          />
          <Route
            exact
            path={process.env.PUBLIC_URL + "/editor/:id/completion/filling"}
            render={() => (
              <Profile
                id={parseInt(this.props.match.params.id, 10)}
                kind="filling"
                unlocked={isEditable}
              />
            )}
          />
        </Switch>
      </Dimmer.Dimmable>
    );
  }
}

BoreholeForm.propTypes = {
  borehole: PropTypes.object,
  developer: PropTypes.object,
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

BoreholeForm.defaultProps = {
  id: undefined,
};

const mapStateToProps = state => {
  return {
    borehole: state.core_borehole,
    developer: state.developer,
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

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  )(withTranslation(["common"])(BoreholeForm)),
);
