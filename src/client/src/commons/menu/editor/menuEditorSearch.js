import React from "react";
import { connect } from "react-redux";
import _ from "lodash";
import { withTranslation } from "react-i18next";
import { withRouter } from "react-router-dom";
import { NumericFormat } from "react-number-format";
import TranslationText from "../../form/translationText";

import {
  Button,
  Dropdown,
  Header,
  Icon,
  Input,
  Menu,
  Modal,
} from "semantic-ui-react";

import { createBorehole } from "../../../api-lib/index";
import { AlertContext } from "../../alert/alertContext";
import SearchEditorComponent from "../../search/editor/searchEditorComponent";
import { importBoreholes } from "../../../api/fetchApiV2";

let isMounted = true;

class MenuEditorSearch extends React.Component {
  static contextType = AlertContext;
  constructor(props) {
    super(props);
    this.updateDimensions = this.updateDimensions.bind(this);
    const wgs = this.props.user.data.workgroups.filter(
      w => w.disabled === null && w.supplier === false,
    );
    this.state = {
      creating: false,
      delete: false,
      enabledWorkgroups: wgs,
      modal: false,
      upload: false,
      selectedFile: null,
      scroller: false,
      workgroup: wgs !== null && wgs.length > 0 ? wgs[0].id : null,
    };
  }

  componentDidMount() {
    if (isMounted) {
      this.updateDimensions();
      window.addEventListener("resize", this.updateDimensions.bind(this));
    }
  }

  componentWillUnmount() {
    isMounted = false;
    window.removeEventListener("resize", this.updateDimensions.bind(this));
  }

  updateDimensions() {
    if (!_.isNil(this.menu) && this.menu.children.length > 0) {
      const height = this.menu.clientHeight;
      const childrenHeight = this.menu.children[0].clientHeight;
      this.setState({
        scroller: childrenHeight > height,
      });
    } else {
      this.setState({
        scroller: true,
      });
    }
  }

  render() {
    const { history, boreholes, t } = this.props;
    return [
      <div
        key="sb-em-1"
        style={{
          color:
            boreholes.isFetching === false && boreholes.dlen === 0
              ? "red"
              : "#767676",
          borderBottom: "thin solid rgb(187, 187, 187)",
          padding: "1em 1em 0px 1em",
        }}>
        <TranslationText firstUpperCase id="boreholes" />:{" "}
        {boreholes.isFetching ? (
          <Icon loading name="spinner" />
        ) : (
          <NumericFormat
            value={boreholes.dlen}
            thousandSeparator="'"
            displayType="text"
          />
        )}
      </div>,
      <div
        className={this.state.scroller === true ? "scroller" : null}
        key="sb-em-2"
        ref={divElement => (this.menu = divElement)}
        style={{
          padding: "1em",
          flex: "1 1 100%",
          display: "flex",
          flexDirection: "column",
          overflowY: "hidden",
          marginRight:
            this.state.scroller === true ? this.props.setting.scrollbar : "0px",
        }}>
        <SearchEditorComponent onChange={filter => {}} />
      </div>,
      <Menu
        icon="labeled"
        key="sb-em-3"
        size="mini"
        style={{
          borderTop: "thin solid rgb(187, 187, 187)",
          margin: "0px",
        }}>
        <Menu.Item
          onClick={() => {
            this.props.refresh();
          }}
          style={{
            flex: 1,
            padding: "1.5em",
          }}>
          <Icon loading={boreholes.isFetching} name="refresh" size="tiny" />
          <TranslationText firstUpperCase id="refresh" />
        </Menu.Item>
        <Menu.Item
          onClick={() => {
            this.props.reset();
          }}
          style={{
            flex: 1,
            padding: "1.5em",
          }}>
          <Icon name="undo" size="tiny" />
          <TranslationText firstUpperCase id="reset" />
        </Menu.Item>
      </Menu>,
      <Menu
        icon="labeled"
        key="sb-em-4"
        size="mini"
        style={{
          margin: "0px",
        }}>
        <Menu.Item
          disabled={this.props.user.data.roles.indexOf("EDIT") === -1}
          onClick={() => {
            this.setState({
              modal: true,
              upload: true,
            });
          }}
          style={{
            flex: 1,
            padding: "1.5em",
          }}>
          <Icon name="upload" size="tiny" />
          <TranslationText firstUpperCase id="import" />
        </Menu.Item>
        <Menu.Item
          disabled={this.props.user.data.roles.indexOf("EDIT") === -1}
          onClick={() => {
            this.setState({
              modal: true,
              upload: false,
            });
          }}
          style={{
            flex: 1,
            padding: "1.5em",
          }}>
          <Icon name="add" size="tiny" />

          <TranslationText firstUpperCase id="new" />
        </Menu.Item>
      </Menu>,
      <Modal
        closeIcon
        key="sb-em-5"
        onClose={() => {
          this.setState({
            modal: false,
          });
        }}
        open={this.state.modal === true}
        size="tiny">
        <Header
          content={<TranslationText id="newBorehole" />}
          icon={this.state.upload === true ? "upload" : "plus"}
        />
        <Modal.Content>
          {this.state.upload === true ? (
            <div>
              <span
                style={{
                  fontWeight: "bold",
                }}>
                <TranslationText id="csvFormat" />
              </span>
              <div>
                <TranslationText id="csvFormatExplanation" />.
              </div>
              <div
                style={{
                  border: "thin solid #787878",
                  margin: "1em 0px",
                  padding: "1em",
                  overflow: "auto",
                  whiteSpace: "nowrap",
                }}>
                id_geodin_shortname; id_info_geol; id_original;
                id_canton;id_geo_quat;id_geo_mol;id_geo_therm; id_top_fels;
                id_geodin; original_name; project_name; alternate_name;
                restriction_id; restriction_until; municipality; canton;
                country; original_reference_system; location_x_lv_95;
                location_y_lv_95; location_x_lv_03; location_y_lv_03;
                qt_location_id; elevation_z; qt_elevation_id;
                reference_elevation; reference_elevation_type_id;
                qt_reference_elevation_id; hrs_id; kind_id; drilling_date;
                drilling_diameter; drilling_method_id; purpose_id; spud_date;
                cuttings_id; status_id; inclination; inclination_direction;
                qt_inclination_direction_id; remarks; total_depth; qt_depth_id;
                total_depth_tvd; qt_total_depth_tvd_id; top_bedrock;
                qt_top_bedrock_id; top_bedrock_tvd; qt_top_bedrock_tvd_id;
                has_groundwater; lithology_top_bedrock_id;
                chronostratigraphy_id; lithostratigraphy_id;
              </div>
              <span
                style={{
                  fontWeight: "bold",
                }}>
                <TranslationText id="uploadFile" />:
              </span>
              <div
                style={{
                  padding: "1em",
                }}>
                <Input
                  accept=".csv"
                  onChange={e => {
                    const formdata = new FormData();
                    formdata.append("file", e.target.files[0]);
                    this.setState({
                      selectedFile: formdata,
                    });
                  }}
                  type="file"
                />
              </div>
            </div>
          ) : null}
          <div>
            <span
              style={{
                fontWeight: "bold",
              }}>
              <TranslationText id="workgroup" />
            </span>
            <div
              style={{
                padding: "1em",
              }}>
              {(() => {
                const wg = this.state.enabledWorkgroups;
                if (wg.length === 0) {
                  return <TranslationText id="disabled" />;
                } else if (wg.length === 1) {
                  return wg[0].workgroup;
                }
                return (
                  <Dropdown
                    item
                    onChange={(ev, data) => {
                      this.setState({
                        workgroup: data.value,
                      });
                    }}
                    options={wg
                      .filter(w => w.roles.indexOf("EDIT") >= 0)
                      .map(wg => ({
                        key: wg["id"],
                        text: wg["workgroup"],
                        value: wg["id"],
                      }))}
                    simple
                    value={this.state.workgroup}
                  />
                );
              })()}
            </div>
          </div>
        </Modal.Content>
        <Modal.Actions>
          <Button
            disabled={
              this.state.enabledWorkgroups.length === 0 ||
              (this.state.upload === true && this.state.selectedFile === null)
            }
            loading={this.state.creating === true}
            onClick={() => {
              this.setState(
                {
                  creating: true,
                },
                () => {
                  if (this.state.upload === true) {
                    importBoreholes(
                      this.state.workgroup,
                      this.state.selectedFile,
                    ).then(response => {
                      this.setState(
                        {
                          creating: false,
                          upload: false,
                          modal: false,
                        },
                        async () => {
                          if (response.ok) {
                            this.context.success(
                              `${await response.text()} ${t(
                                "boreholesImported",
                              )}.`,
                            );
                            this.props.refresh();
                          } else {
                            this.context.error(`${t("boreholesImportError")}`);
                          }
                        },
                      );
                    });
                  } else {
                    createBorehole(this.state.workgroup)
                      .then(response => {
                        if (response.data.success) {
                          this.setState(
                            {
                              creating: false,
                              modal: false,
                            },
                            () => {
                              history.push(
                                process.env.PUBLIC_URL +
                                  "/editor/" +
                                  response.data.id,
                              );
                            },
                          );
                        } else {
                          this.setState(
                            {
                              creating: false,
                              modal: false,
                            },
                            () => {
                              this.context.error(response.data.message);
                              window.location.reload();
                            },
                          );
                        }
                      })
                      .catch(function (error) {
                        console.log(error);
                      });
                  }
                },
              );
            }}
            secondary>
            <Icon name={this.state.upload === true ? "upload" : "plus"} />{" "}
            {this.state.upload === true ? (
              <TranslationText id="import" />
            ) : (
              <TranslationText id="create" />
            )}
          </Button>
        </Modal.Actions>
      </Modal>,
    ];
  }
}

const mapStateToProps = state => {
  return {
    leftmenu: state.leftmenu,
    home: state.home,
    search: state.search,
    editor: state.editor,
    borehole: state.core_borehole,
    boreholes: state.core_borehole_editor_list,
    setting: state.setting,
    user: state.core_user,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    dispatch: dispatch,
    boreholeSelected: borehole => {
      dispatch({
        path: "/borehole",
        type: "CLEAR",
      });
      dispatch({
        type: "EDITOR_BOREHOLE_SELECTED",
        selected: borehole,
      });
    },
    refresh: () => {
      dispatch({
        type: "SEARCH_EDITOR_FILTER_REFRESH",
      });
    },
    reset: () => {
      dispatch({
        type: "SEARCH_EDITOR_FILTER_RESET",
      });
    },
  };
};

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  )(withTranslation(["common"])(MenuEditorSearch)),
);
