import React from "react";
import { connect } from "react-redux";
import { withTranslation } from "react-i18next";
import _ from "lodash";

import DomainText from "../form/domain/domainText";
import DateText from "../form/dateText";
import TranslationText from "../form/translationText";

import TTable from "./table";

import {
  Button,
  Table,
  Icon,
  Checkbox,
  Segment,
  Modal,
  Header,
  Dropdown,
} from "semantic-ui-react";

import {
  loadEditingBoreholes,
  getdBoreholeIds,
  deleteBoreholes,
  exportDatabaseById,
  copyBorehole,
} from "../../api-lib/index";

class BoreholeEditorTable extends TTable {
  constructor(props) {
    super(props);

    const wgs = this.props.user.data.workgroups.filter(
      w =>
        w.disabled === null &&
        w.supplier === false &&
        w.roles.indexOf("EDIT") >= 0,
    );
    this.state = {
      ...this.state,

      enabledWorkgroups: wgs,
      workgroup: wgs !== null && wgs.length > 0 ? wgs[0].id : null,

      deleting: false,
      confirmDelete: false,

      copy: false,
      copying: false,
    };
    this.reorder = this.reorder.bind(this);
    this.add2selection = this.add2selection.bind(this);
    this.handleMultipleClick = this.handleMultipleClick.bind(this);
    this.deleteList = this.deleteList.bind(this);
    this.copyBorehole = this.copyBorehole.bind(this);
    this.getHeaderLabel = this.getHeaderLabel.bind(this);
    this.getHeader = this.getHeader.bind(this);
    this.getCols = this.getCols.bind(this);
  }

  componentDidMount() {
    const { filter } = this.props;
    this.props.clear();
    this.props.loadData(1, filter); //, setting.orderby, setting.direction);
  }
  reorder(orderby) {
    const { filter, loadData, store } = this.props;
    let dir = store.direction === "DESC" ? "ASC" : "DESC";
    loadData(store.page, filter, orderby, dir);
  }
  add2selection(id) {
    const { selected } = this.state;
    const { store } = this.props;
    for (let index = 0; index < store.data.length; index++) {
      const item = store.data[index];
      if (item.id === id && item.lock !== null) {
        return;
      }
    }
    const tmp = [...selected];
    const index = tmp.indexOf(id);
    if (index >= 0) {
      tmp.splice(index, 1);
    } else {
      tmp.push(id);
    }
    this.setState({
      selected: tmp,
    });
  }
  handleMultipleClick() {
    const { filter, onMultiple } = this.props;
    if (this.state.all === true || this.state.selected.length > 0) {
      // Load selected id if all is true
      if (onMultiple !== undefined) {
        if (this.state.all === true) {
          getdBoreholeIds(filter)
            .then(response => {
              if (response.data.success) {
                //TODO check this part. Updating state is not incorrect!
                onMultiple(_.pullAll(response.data.data, this.state.selected));
              }
            })
            .catch(err => {
              console.log(err);
            });
        } else {
          onMultiple(this.state.selected);
        }
      }
    }
  }
  deleteList() {
    const { filter } = this.props;
    if (this.state.all === true || this.state.selected.length > 0) {
      if (this.state.all === true) {
        getdBoreholeIds(filter)
          .then(response => {
            if (response.data.success) {
              deleteBoreholes(
                _.pullAll(response.data.data, this.state.selected),
              ).then(() => {
                this.setState(
                  {
                    confirmDelete: false,
                    deleting: false,
                    selected: [],
                    all: false,
                  },
                  () => {
                    this.props.loadData(1, filter);
                  },
                );
              });
            }
          })
          .catch(err => {
            console.log(err);
          });
      } else {
        deleteBoreholes(this.state.selected).then(() => {
          this.setState(
            {
              confirmDelete: false,
              deleting: false,
              selected: [],
              all: false,
            },
            () => {
              this.props.loadData(1, filter);
            },
          );
        });
      }
    }
  }
  exportList() {
    const { filter } = this.props;
    if (this.state.all === true || this.state.selected.length > 0) {
      if (this.state.all === true) {
        getdBoreholeIds(filter)
          .then(response => {
            if (response.data.success) {
              exportDatabaseById(
                _.pullAll(response.data.data, this.state.selected),
              ).then(response => {
                if (response.success === false) {
                  alert(response.message);
                }
              });
              // ).then(() => {
              //   this.setState({
              //     confirmDelete: false,
              //     deleting: false,
              //     selected: [],
              //     all: false
              //   }, () => {
              //     this.props.loadData(1, filter);
              //   });
              // });
            }
          })
          .catch(err => {
            console.log(err);
          });
      } else {
        exportDatabaseById(this.state.selected).then(response => {
          if (response.success === false) {
            alert(response.message);
          }
        });
        // ).then(() => {
        //   this.setState({
        //     confirmDelete: false,
        //     deleting: false,
        //     selected: [],
        //     all: false
        //   }, () => {
        //     this.props.loadData(1, filter);
        //   });
        // });
      }
    }
  }
  copyBorehole() {
    copyBorehole(this.state.selected[0], this.state.workgroup).then(r => {
      debugger;
      this.setState(
        {
          copy: false,
          copying: false,
        },
        () => {
          super.handleClick({ id: r.data.id });
        },
      );
    });
  }
  getHeaderLabel(key, disableOrdering = false) {
    const { store } = this.props;
    return (
      <Table.HeaderCell
        onClick={() => {
          if (disableOrdering === false) {
            this.reorder(key);
          }
        }}
        style={{
          cursor: disableOrdering === true ? null : "pointer",
          whiteSpace: "nowrap",
        }}
        verticalAlign="top">
        {disableOrdering === false && store.orderby === key ? (
          <Icon name={store.direction === "DESC" ? "sort down" : "sort up"} />
        ) : null}{" "}
        {key === "workgroup" ? (
          <span
            key={"betjs-2-" + key}
            style={{
              fontSize: "0.8em",
              color: "#787878",
            }}>
            <TranslationText id="workgroup" />
          </span>
        ) : (
          <TranslationText id={key} />
        )}
        {key === "workgroup"
          ? [
              <br key={"betjs-1-" + key} />,
              <span key={"betjs-2-" + key}>
                {key === "workgroup" ? "Status" : key}
              </span>,
            ]
          : null}
      </Table.HeaderCell>
    );
  }
  getHeader() {
    const { all } = this.state;
    return (
      <Table.Row>
        <Table.HeaderCell style={{ width: "2em" }}>
          <Checkbox
            checked={all === true}
            onClick={e => {
              e.stopPropagation();
              this.setState({
                all: !all,
                selected: [],
              });
            }}
          />
        </Table.HeaderCell>
        {this.getHeaderLabel("workgroup")}
        {this.getHeaderLabel("creationdate")}
        {this.getHeaderLabel("createdBy")}
        {this.getHeaderLabel("original_name")}
        {this.getHeaderLabel("kind")}
        {this.getHeaderLabel("restriction")}
        {/*this.getHeaderLabel('location_x', true)}
        {this.getHeaderLabel('location_y', true)}
          {this.getHeaderLabel('srs', true)*/}
        {this.getHeaderLabel("elevation_z")}
        {this.getHeaderLabel("hrs", true)}
        {this.getHeaderLabel("drilling_end_date")}
        {this.getHeaderLabel("boreholestatus")}
        {this.getHeaderLabel("totaldepth")}
      </Table.Row>
    );
  }
  getCols(item, idx) {
    let colIdx = 0;
    return [
      <Table.Cell
        key={this.uid + "_" + idx + "_" + colIdx++}
        onClick={e => {
          e.stopPropagation();
          if (item.lock === null) {
            this.add2selection(item.id);
          }
        }}
        style={{ width: "2em" }}>
        {item.lock === null ? (
          <Checkbox checked={this.inSelection(item.id)} />
        ) : (
          <Icon color="red" name="lock" size="small" />
        )}
      </Table.Cell>,
      <Table.Cell key={this.uid + "_" + idx + "_" + colIdx++}>
        <span
          style={{
            fontSize: "0.8em",
            color: "#787878",
          }}>
          {item.workgroup !== null ? item.workgroup.name : null}
        </span>
        <br />
        {/* {
          item.percentage < 100 ?
            null :
            <Icon
              color='green'
              name='check circle'
            />
        } {item.percentage}% */}

        <TranslationText id={`status${item.role.toLowerCase()}`} />
      </Table.Cell>,
      <Table.Cell key={this.uid + "_" + idx + "_" + colIdx++}>
        <span
          style={{
            fontSize: "0.8em",
            color: "#787878",
          }}>
          <DateText date={item.creator.date} fromnow />
        </span>
        <br />
        <DateText date={item.creator.date} />
      </Table.Cell>,
      <Table.Cell key={this.uid + "_" + idx + "_" + colIdx++}>
        {item.creator.username}
      </Table.Cell>,
      <Table.Cell key={this.uid + "_" + idx + "_" + colIdx++}>
        {item.original_name}
      </Table.Cell>,
      <Table.Cell key={this.uid + "_" + idx + "_" + colIdx++}>
        <DomainText id={item.kind} schema="kind" />
      </Table.Cell>,
      <Table.Cell key={this.uid + "_" + idx + "_" + colIdx++}>
        <DomainText id={item.restriction} schema="restriction" />
        <br />
        <span
          style={{
            fontSize: "0.9em",
            color: "rgb(60, 137, 236)",
          }}>
          <DateText date={item.restriction_until} />
        </span>
      </Table.Cell>,
      <Table.Cell key={this.uid + "_" + idx + "_" + colIdx++}>
        {_.isNil(item.elevation_z) ? null : item.elevation_z + " m"}
      </Table.Cell>,
      <Table.Cell key={this.uid + "_" + idx + "_" + colIdx++}>
        <DomainText id={item.hrs} schema="hrs" />
      </Table.Cell>,
      <Table.Cell key={this.uid + "_" + idx + "_" + colIdx++}>
        <DateText date={item.drilling_date} />
      </Table.Cell>,
      <Table.Cell key={this.uid + "_" + idx + "_" + colIdx++}>
        <DomainText id={item.extended.status} schema="extended.status" />
      </Table.Cell>,
      <Table.Cell key={this.uid + "_" + idx + "_" + colIdx++}>
        {_.isNil(item.length) ? null : item.length + " m"}
      </Table.Cell>,
    ];
  }
  render() {
    const { t } = this.props;
    const { selected, all } = this.state;
    return (
      <Segment
        basic
        loading={this.props.store.isFetching}
        style={{
          flex: "1 1 100%",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          margin: "0px",
          padding: "0px",
        }}>
        {all === true || selected.length > 0 ? (
          <div
            style={{
              backgroundColor: "rgb(236, 236, 236)",
              color: "black",
              textAlign: "center",
              padding: "0.5em",
            }}>
            <span
              style={{
                fontWeight: "bold",
              }}>
              {all === true
                ? t("common:allSelected")
                : selected.length === 1
                ? t("common:oneSelected")
                : t("common:someSelected", {
                    howMany: selected.length,
                  })}
            </span>{" "}
            (
            <span
              onClick={() => {
                this.setState({
                  selected: [],
                  all: false,
                });
              }}
              style={{
                color: "rgb(242, 113, 28)",
                textDecoration: "underline",
                cursor: "pointer",
              }}>
              {t("common:reset")}
            </span>
            ) &nbsp;
            <Button
              color="black"
              onClick={() => {
                this.exportList();
              }}
              size="mini">
              {t("common:export")}
            </Button>
            &nbsp;
            <Button
              color="black"
              onClick={() => {
                this.handleMultipleClick();
              }}
              size="mini">
              {t("common:bulkEditing")}
            </Button>
            &nbsp;
            {all === false && selected.length === 1 ? (
              <Modal
                closeIcon
                onClose={() =>
                  this.setState({
                    copy: false,
                  })
                }
                open={this.state.copy}
                size="mini"
                trigger={
                  <Button
                    onClick={() => {
                      this.setState({
                        copy: true,
                      });
                    }}
                    primary
                    size="mini">
                    {t("common:copy")}
                  </Button>
                }>
                <Header
                  content={t("common:copy")}
                  // icon='archive'
                />
                <Modal.Content>
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
                </Modal.Content>
                <Modal.Actions>
                  <Button
                    loading={this.state.copying}
                    onClick={() => {
                      this.setState(
                        {
                          copying: true,
                        },
                        () => {
                          this.copyBorehole();
                        },
                      );
                    }}
                    primary>
                    {t("common:copy")}
                  </Button>
                </Modal.Actions>
              </Modal>
            ) : null}
            &nbsp;
            <Modal
              closeIcon
              onClose={() =>
                this.setState({
                  confirmDelete: false,
                })
              }
              open={this.state.confirmDelete}
              size="mini"
              trigger={
                <Button
                  loading={this.state.deleting}
                  negative
                  onClick={() => {
                    this.setState({
                      confirmDelete: true,
                    });
                  }}
                  size="mini">
                  {t("common:delete")}
                </Button>
              }>
              <Header
                content={t("common:deleteForever")}
                // icon='archive'
              />
              <Modal.Content>
                <p>{t("common:sure")}</p>
              </Modal.Content>
              <Modal.Actions>
                <Button
                  loading={this.state.deleting}
                  negative
                  onClick={() => {
                    this.setState(
                      {
                        deleting: true,
                      },
                      () => {
                        this.deleteList();
                      },
                    );
                  }}>
                  <Icon name="trash alternate" /> {t("common:delete")}
                </Button>
              </Modal.Actions>
            </Modal>
          </div>
        ) : null}
        {/* <div
          style={{
            backgroundColor: '#ececec',
            borderBottom: 'thin solid #c5c5c5',
            color: 'black',
            textAlign: 'center',
            padding: '0.5em'
          }}
        >
          {super.render()}
        </div> */}
        {super.render()}
      </Segment>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    store: state.core_borehole_editor_list,
    user: state.core_user,
    ...ownProps,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    dispatch: dispatch,
    clear: () => {
      dispatch({
        type: "CLEAR",
        path: "/borehole",
      });
    },
    loadData: (page, filter = {}, orderby = "creation", direction = null) => {
      dispatch(loadEditingBoreholes(page, 100, filter, orderby, direction));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslation(["common"])(BoreholeEditorTable));
