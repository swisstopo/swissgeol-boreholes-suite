import React from "react";
import { connect } from "react-redux";
import _ from "lodash";
import { withTranslation } from "react-i18next";
import { withRouter } from "react-router-dom";

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

import { createBorehole, importBoreholeList } from "../../../api-lib/index";

import SearchEditorComponent from "../../search/editor/searchEditorComponent";
let isMounted = true;

class MenuEditorSearch extends React.Component {
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
      // workgroup: this.props.user.data.workgroups !== null
      //   && this.props.user.data.workgroups.length > 0?
      //   this.props.user.data.workgroups[0].id: null
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
    const { history, boreholes } = this.props;
    return [
      <div
        key="sb-em-1"
        style={{
          color:
            boreholes.isFetching === false && boreholes.dlen === 0
              ? "red"
              : "#767676",
          // fontWeight: 'bold',
          borderBottom: "thin solid rgb(187, 187, 187)",
          padding: "1em 1em 0px 1em",
        }}>
        <TranslationText firstUpperCase id="boreholes" />:{" "}
        {
          boreholes.isFetching ? (
            <Icon loading name="spinner" />
          ) : (
            boreholes.dlen
          )
          // boreholes.dlen + ' ' + (
          //   boreholes.dlen > 1 || boreholes.dlen === 0 ?
          //     <TranslationText
          //       firstUpperCase
          //       id='results'
          //     />:
          //     <TranslationText
          //       firstUpperCase
          //       id='result'
          //     />
          // )
        }
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
        <SearchEditorComponent
          onChange={filter => {
            //console.log(filter)
          }}
        />
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
          <TranslationText firstUpperCase id="upload" />
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
          // content={t(`common:newBorehole`)}
          icon={this.state.upload === true ? "upload" : "plus"}
        />
        <Modal.Content>
          {this.state.upload === true ? (
            <div>
              <span
                style={{
                  fontWeight: "bold",
                }}>
                <TranslationText id="csvFormat" />:
              </span>
              <div
                style={{
                  border: "thin solid #787878",
                  margin: "1em 0px",
                  padding: "1em",
                  overflow: "auto",
                  whiteSpace: "nowrap",
                }}>
                "location_east";"location_north";"original_name";"alternate_name";"project_name";"elevation_z";"drillend_date";"total_depth";"top_bedrock";"remarks"
                <br />
                2719603;1081038.5;"test001";"foo";"bar";"foobar";273.7;"2020-06-16";28.2;18.7;"lorem
                ipsum"
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
                  onChange={e => {
                    this.setState({
                      selectedFile: e.target.files[0],
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
                    // text={this.props.user.data.workgroups[0].workgroup}
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
                    importBoreholeList(
                      this.state.workgroup,
                      this.state.selectedFile,
                    ).then(response => {
                      this.setState(
                        {
                          creating: false,
                          upload: false,
                          modal: false,
                        },
                        () => {
                          if (response.data.success) {
                            this.props.refresh();
                          } else {
                            alert(response.data.message);
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
                              alert(response.data.message);
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
            {
              this.state.upload === true ? (
                <TranslationText id="upload" />
              ) : (
                <TranslationText id="create" />
              )
              // t('editor:upload'):
              // t('editor:create')
            }
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
