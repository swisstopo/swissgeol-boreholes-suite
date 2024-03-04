import React from "react";
import { connect } from "react-redux";
import _ from "lodash";
import { Route, Switch, withRouter } from "react-router-dom";
import { NumericFormat } from "react-number-format";
import { Button, Header, Icon, Menu, Segment } from "semantic-ui-react";
import DateText from "../../form/dateText";
import SearchComponent from "../../search/searchComponent";
import TranslationText from "../../form/translationText";
let isMounted = true;

class MenuExplorer extends React.Component {
  constructor(props) {
    super(props);
    this.updateDimensions = this.updateDimensions.bind(this);
    this.state = {
      scroller: false,
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
    const { history, boreholes, detail } = this.props;
    return (
      <Switch>
        <Route
          exact
          path={"/:id"}
          render={() => (
            <div
              style={{
                padding: "1em",
              }}>
              <Button
                fluid
                icon
                onClick={() => {
                  history.push("/");
                }}
                primary
                data-cy="back-to-list-button">
                <Icon name="caret left" />
                <TranslationText id="back_to_list" />
              </Button>
              <Segment loading={detail.isFetching}>
                <span
                  style={{
                    color: "#787878",
                    fontSize: "0.8em",
                  }}>
                  <TranslationText id="name" />:
                </span>
                <Header style={{ margin: "auto" }}>
                  {_.hasIn(detail.borehole, "extended.original_name") ? detail.borehole.extended.original_name : null}
                </Header>
                <div
                  style={{
                    marginTop: "0.5em",
                  }}>
                  <span
                    style={{
                      color: "#787878",
                      fontSize: "0.8em",
                    }}>
                    <TranslationText id="createdBy" />:
                  </span>
                  <br />
                  {_.hasIn(detail.borehole, "creator.username") ? detail.borehole.creator.username : null}
                </div>
                <div
                  style={{
                    marginTop: "0.5em",
                  }}>
                  <span
                    style={{
                      color: "#787878",
                      fontSize: "0.8em",
                    }}>
                    <TranslationText id="creationdate" />:
                  </span>
                  <br />
                  {_.hasIn(detail.borehole, "creator.date") ? (
                    <DateText date={detail.borehole.creator.date} hours />
                  ) : null}
                </div>
              </Segment>
            </div>
          )}
        />
        <Route
          exact
          path={"/"}
          render={() => [
            <div
              key="sb-em-1"
              style={{
                color: "#767676",
                padding: "1em 1em 0px 1em",
              }}>
              <TranslationText firstUpperCase id="boreholes" />:{" "}
              {boreholes.isFetching ? (
                <Icon loading name="spinner" />
              ) : (
                <NumericFormat value={boreholes.dlen} thousandSeparator="'" displayType="text" />
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
                marginRight: this.state.scroller === true ? this.props.setting.scrollbar : "0px",
              }}>
              <SearchComponent />
            </div>,
            <Menu
              icon="labeled"
              key="sb-em-3"
              size="mini"
              style={{
                margin: "0px",
              }}>
              <Menu.Item
                onClick={() => {
                  this.props.refresh();
                }}
                style={{
                  flex: 1,
                }}>
                <Icon name="refresh" loading={boreholes.isFetching} />
                <TranslationText firstUpperCase id="refresh" />
              </Menu.Item>
              <Menu.Item
                onClick={() => {
                  this.props.reset();
                }}
                style={{
                  flex: 1,
                }}>
                <Icon name="undo" />
                &nbsp;
                <TranslationText firstUpperCase id="reset" />
              </Menu.Item>
            </Menu>,
          ]}
        />
      </Switch>
    );
  }
}

const mapStateToProps = state => {
  return {
    leftmenu: state.leftmenu,
    detail: state.detail_borehole,
    home: state.home,
    search: state.search,
    boreholes: state.core_borehole_list,
    setting: state.setting,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    dispatch: dispatch,
    boreholeSeleced: () => {
      dispatch({
        type: "HOME_BOREHOLE_SELECTED",
        id: null,
      });
    },
    refresh: () => {
      dispatch({
        type: "SEARCH_FILTER_REFRESH",
      });
    },
    reset: () => {
      dispatch({
        type: "SEARCH_FILTER_RESET",
      });
    },
  };
};

const ConnectedMenuExplorer = withRouter(connect(mapStateToProps, mapDispatchToProps)(MenuExplorer));
export default ConnectedMenuExplorer;
