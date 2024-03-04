import React from "react";
import { connect } from "react-redux";
import { withTranslation } from "react-i18next";
import PropTypes from "prop-types";
import _ from "lodash";
import { Route, Switch, withRouter } from "react-router-dom";

import ExportLink from "../../commons/exportlink";
import BoreholeTable from "../../commons/table/boreholeTable";
import DetailsContainer from "../../commons/detail/detailsContainer";
import MapComponent from "../../commons/map/mapComponent";
import MenuExplorer from "../../commons/menu/explorer/menuExplorer";
import MenuContainer from "../../commons/menu/menuContainer";

class HomeComponent extends React.Component {
  constructor(props) {
    super(props);
    this.rowHover = false;
    this.getMap = this.getMap.bind(this);
    this.getTable = this.getTable.bind(this);
    this.state = {
      refresh: 0,
      tableScrollPosition: 0,
    };
  }

  getMap() {
    const { detail, history, home, search, setting } = this.props;
    return (
      <div
        className="stbg"
        style={{
          flex: "1 1 100%",
          display: "flex",
          flexDirection: "row",
          border: "1px solid rgb(204, 204, 204)",
          position: "relative",
          overflow: "hidden",
          zIndex: 1,
        }}>
        <MapComponent
          centerto={
            search.center2selected && setting.data.appearance.explorer !== 0
              ? detail.borehole !== null
                ? detail.borehole.id
                : null
              : null
          }
          searchState={{
            ...search,
          }}
          highlighted={!_.isNil(detail.borehole) ? [detail.borehole.id] : home.hover ? [home.hover.id] : []}
          hover={id => {
            if (_.isNil(detail.borehole)) {
              this.props.mapHover(id);
            }
          }}
          layers={setting.data.map.explorer}
          moveend={(extent, resolution) => {
            this.props.filterByExtent(extent, resolution);
          }}
          filterByExtent={extent => {
            this.props.filterByExtent(extent);
          }}
          setmapfilter={checked => {
            this.props.setmapfilter(checked);
          }}
          selected={id => {
            if (id === null) {
              history.push("/");
            } else {
              history.push("/" + id);
            }
          }}
          zoomto={search.zoom2selected && setting.data.appearance.explorer !== 0}
        />
      </div>
    );
  }

  getTable(id) {
    const { checkout, history, home, search, t } = this.props;
    return (
      <div
        style={{
          flex: "1 1 100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          zIndex: 1,
        }}>
        {checkout.cart.length > 0 ? (
          <div
            style={{
              backgroundColor: "#ececec",
              borderBottom: "thin solid #c5c5c5",
              color: "black",
              textAlign: "center",
              padding: "0.5em",
            }}>
            <span
              style={{
                fontWeight: "bold",
              }}>
              {checkout.cart.length === 1
                ? t("common:oneSelected")
                : t("common:someSelected", {
                    howMany: checkout.cart.length,
                  })}
            </span>{" "}
            (
            <span
              onClick={() => {
                this.props.resetCart();
              }}
              style={{
                color: "#f2711c",
                textDecoration: "underline",
                cursor: "pointer",
              }}>
              {t("common:reset")}
            </span>
            ) &nbsp;&nbsp;
            <ExportLink
              id={checkout.cart.map(k => {
                return k.id;
              })}
              style={{
                fontSize: "0.8em",
              }}
            />
          </div>
        ) : null}
        <BoreholeTable
          activeItem={id ? parseInt(id, 10) : null}
          filter={{
            ...search.filter,
          }}
          highlight={id ? null : home.maphover}
          onHover={item => {
            if (this.rowHover) {
              clearTimeout(this.rowHover);
              this.rowHover = false;
            }
            this.rowHover = setTimeout(() => {
              this.props.boreholeHover(item);
            }, 250);
          }}
          onSelected={borehole => {
            if (borehole === null) {
              history.push("/");
            } else {
              history.push("/" + borehole.id);
            }
          }}
          scrollPosition={this.state.tableScrollPosition}
          onScrollChange={position => {
            this.setState({
              tableScrollPosition: position,
            });
          }}
        />
      </div>
    );
  }

  render() {
    const { detail, setting } = this.props;
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}>
        <MenuContainer />
        <div
          style={{
            flex: "1 1 100%",
            display: "flex",
            flexDirection: "row",
            overflow: "hidden",
          }}>
          <div
            style={{
              boxShadow: "rgba(0, 0, 0, 0.17) 2px 6px 6px 0px",
              display: "flex",
              flexDirection: "column",
              width: "250px",
              minWidth: "250px",
            }}>
            <MenuExplorer />
          </div>
          {(() => {
            switch (setting.data.appearance.explorer) {
              case 0: {
                return (
                  <div
                    style={{
                      flex: "1 1 100%",
                      display: "flex",
                      flexDirection: "row",
                      overflow: "hidden",
                    }}>
                    <Switch>
                      <Route
                        exact
                        path={"/:id"}
                        render={props => {
                          return <DetailsContainer id={parseInt(props.match.params.id, 10)} />;
                        }}
                      />
                    </Switch>
                    {this.getMap()}
                  </div>
                );
              }
              case 1: {
                return (
                  <div
                    style={{
                      flex: "1 1 100%",
                      display: "flex",
                      flexDirection: "row",
                      overflow: "hidden",
                    }}>
                    <div
                      style={{
                        boxShadow: !_.isNil(detail.borehole) ? "rgba(0, 0, 0, 0.17) 2px 6px 6px 0px" : null,
                        display: "flex",
                        flex: "1 1 100%",
                        flexDirection: "column",
                        overflow: "hidden",
                      }}>
                      <div
                        style={{
                          flex: "1 1 75%",
                          overflow: "hidden",
                          display: "flex",
                          flexDirection: "column",
                          minHeight: "300px",
                        }}>
                        {this.getMap()}
                      </div>
                      <div
                        style={{
                          flex: "1 1 100%",
                          overflow: "hidden",
                          display: "flex",
                          flexDirection: "column",
                        }}>
                        <Switch>
                          <Route
                            path={`/:id?`}
                            render={p => {
                              if (p.match.params.id === undefined) return this.getTable();
                              else return this.getTable(p.match.params.id);
                            }}
                          />
                        </Switch>
                      </div>
                    </div>
                    <Switch>
                      <Route
                        exact
                        path={"/:id"}
                        render={props => {
                          return <DetailsContainer id={parseInt(props.match.params.id, 10)} />;
                        }}
                      />
                      <Route
                        exact
                        path={"/"}
                        render={() => (
                          <div
                            style={{
                              flex: "1 1 100%",
                              overflow: "hidden",
                              display: "flex",
                              flexDirection: "column",
                            }}
                          />
                        )}
                      />
                    </Switch>
                  </div>
                );
              }
              case 2: {
                return (
                  <div
                    style={{
                      flex: "1 1 100%",
                      display: "flex",
                      flexDirection: "row",
                      overflow: "hidden",
                    }}>
                    <div
                      style={{
                        display: "flex",
                        flex: "1 1 100%",
                        flexDirection: "column",
                        overflow: "hidden",
                      }}>
                      {this.getMap()}
                    </div>
                    <div
                      style={{
                        flex: "1 1 100%",
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column",
                      }}>
                      <Switch>
                        <Route
                          exact
                          path={"/:id"}
                          render={props => {
                            return <DetailsContainer id={parseInt(props.match.params.id, 10)} />;
                          }}
                        />

                        <Route
                          exact
                          path={`/:id?`}
                          render={p => {
                            if (p.match.params.id === undefined) return this.getTable();
                            else return this.getTable(p.match.params.id);
                          }}
                        />
                      </Switch>
                    </div>
                  </div>
                );
              }
              case 3: {
                return (
                  <div
                    style={{
                      flex: "1 1 100%",
                      display: "flex",
                      flexDirection: "row",
                      overflow: "hidden",
                    }}>
                    <div
                      style={{
                        display: "flex",
                        flex: "1 1 100%",
                        flexDirection: "column",
                        overflow: "hidden",
                      }}>
                      <Switch>
                        <Route
                          path={`/:id?`}
                          render={p => {
                            if (p.match.params.id === undefined) return this.getTable();
                            else return this.getTable(p.match.params.id);
                          }}
                        />
                      </Switch>
                    </div>
                    <div
                      style={{
                        flex: "1 1 100%",
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column",
                      }}>
                      <Switch>
                        <Route
                          exact
                          path={"/:id"}
                          render={props => {
                            return <DetailsContainer id={parseInt(props.match.params.id, 10)} />;
                          }}
                        />
                        <Route exact path={"/"} render={() => this.getMap()} />
                      </Switch>
                    </div>
                  </div>
                );
              }
              case 4: {
                return (
                  <div
                    style={{
                      flex: "1 1 100%",
                      display: "flex",
                      flexDirection: "row",
                      overflow: "hidden",
                    }}>
                    <div
                      style={{
                        display: "flex",
                        flex: "1 1 100%",
                        flexDirection: "column",
                        overflow: "hidden",
                      }}>
                      <Switch>
                        <Route
                          exact
                          path={"/:id"}
                          render={h => {
                            return <DetailsContainer id={parseInt(h.match.params.id, 10)} />;
                          }}
                        />
                        <Route exact path={"/"} render={() => this.getMap()} />
                      </Switch>
                    </div>
                    <div
                      style={{
                        flex: "1 1 100%",
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column",
                      }}>
                      <Switch>
                        <Route
                          path={`/:id?`}
                          render={p => {
                            if (p.match.params.id === undefined) return this.getTable();
                            else return this.getTable(p.match.params.id);
                          }}
                        />
                      </Switch>
                    </div>
                  </div>
                );
              }
              case 5: {
                return (
                  <div
                    style={{
                      flex: "1 1 100%",
                      display: "flex",
                      flexDirection: "row",
                      overflow: "hidden",
                    }}>
                    <div
                      style={{
                        display: "flex",
                        flex: "1 1 100%",
                        flexDirection: "column",
                        overflow: "hidden",
                      }}>
                      <Switch>
                        <Route
                          exact
                          path={"/:id"}
                          render={props => {
                            return <DetailsContainer id={parseInt(props.match.params.id, 10)} />;
                          }}
                        />

                        <Route
                          exact
                          path={`/:id?`}
                          render={p => {
                            if (p.match.params.id === undefined) return this.getTable();
                            else return this.getTable(p.match.params.id);
                          }}
                        />
                      </Switch>
                    </div>
                    <div
                      style={{
                        flex: "1 1 100%",
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column",
                      }}>
                      {this.getMap()}
                    </div>
                  </div>
                );
              }
              default: {
                return this.getTable();
              }
            }
          })()}
        </div>
      </div>
    );
  }
}

HomeComponent.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func,
  }).isRequired,
};

const mapStateToProps = state => {
  return {
    checkout: state.checkout,
    detail: state.detail_borehole,
    home: state.home,
    leftmenu: state.leftmenu,
    search: state.search,
    setting: state.setting,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    dispatch: dispatch,
    setIndex: (e, titleProps) => {
      const { index } = titleProps;
      dispatch({
        type: "LFMSELECTED",
        index: index,
      });
    },
    boreholeSeleced: id => {
      dispatch({
        type: "HOME_BOREHOLE_SELECTED",
        id: id,
      });
    },
    boreholeHover: borehole => {
      dispatch({
        type: "HOME_BOREHOLE_HOVER",
        borehole: borehole,
      });
    },
    mapHover: id => {
      dispatch({
        type: "HOME_MAP_HOVER",
        id: id,
      });
    },
    filterByExtent: (extent, resolution) => {
      dispatch({
        type: "SEARCH_EXTENT_CHANGED",
        extent: extent,
        resolution: resolution,
      });
    },
    setmapfilter: active => {
      dispatch({
        type: "SEARCH_MAPFILTER_CHANGED",
        active: active,
      });
    },
    resetCart: () => {
      dispatch({
        type: "CHECKOUT_RESET_CART",
      });
    },
  };
};

const ConnectedHomeComponent = withRouter(
  connect(mapStateToProps, mapDispatchToProps)(withTranslation(["common"])(HomeComponent)),
);
export default ConnectedHomeComponent;
