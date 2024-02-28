import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import StratigraphiesComponent from "./stratigrafy/stratigraphiesComponent";
import DomainText from "../form/domain/domainText";
import DateText from "../form/dateText";
import TranslationText from "../form/translationText";
import ExportLink from "../exportlink";
import { Icon } from "semantic-ui-react";
import { NumericFormat } from "react-number-format";

class DetailsComponent extends React.Component {
  render() {
    const { detail } = this.props;
    return (
      <div
        id="DetailsComponent"
        style={{
          flex: "1 1 100%",
          overflowY: "hidden",
          display: "flex",
          flexDirection: "column",
        }}>
        {detail.borehole ? (
          [
            <div
              id="bms-dc-1"
              key="bms-dc-1"
              style={{
                padding: "1em",
                display: "flex",
                flexDirection: "row",
              }}>
              <div>
                <div
                  style={{
                    fontSize: "1em",
                    margin: "0px 0px 0.4em",
                  }}>
                  {(() => {
                    if (!Object.prototype.hasOwnProperty.call(this.props.domains.data, "borehole_type")) {
                      return null;
                    }

                    const borehole_type = this.props.domains.data["borehole_type"].find(function (element) {
                      return element.id === detail.borehole.borehole_type;
                    });

                    const restriction = this.props.domains.data["restriction"].find(function (element) {
                      return element.id === detail.borehole.restriction;
                    });

                    let color = "black";
                    if (restriction !== undefined) {
                      if (restriction.code === "f") {
                        color = "green";
                      } else if (["b", "g"].indexOf(restriction.code) >= 0) {
                        color = "red";
                      }
                    }

                    if (borehole_type !== undefined) {
                      return (
                        <img
                          alt=""
                          src={"/img/" + borehole_type.code + "-" + color + ".svg"}
                          style={{
                            height: "0.75em",
                            width: "auto",
                          }}
                        />
                      );
                    } else {
                      return (
                        <img
                          alt=""
                          src={"/img/a-" + color + ".svg"}
                          style={{
                            height: "0.75em",
                            width: "auto",
                          }}
                        />
                      );
                    }
                  })()}{" "}
                  <DomainText id={detail.borehole.borehole_type} schema={"borehole_type"} />
                </div>
                <div
                  style={{
                    fontWeight: "bold",
                    // color: '#2185d0',
                    fontSize: "2em",
                  }}>
                  {detail.borehole.extended.original_name}
                </div>
                <div
                  style={{
                    color: "#787878",
                    paddingTop: "0.4em",
                  }}>
                  {detail.borehole.custom.municipality}
                  {detail.borehole.custom.municipality !== null && detail.borehole.custom.municipality !== ""
                    ? ",  "
                    : " "}
                  {detail.borehole.custom.canton}
                </div>
                <div>
                  <ExportLink
                    id={[detail.borehole.id]}
                    style={{
                      fontSize: "0.8em",
                    }}
                  />
                </div>
              </div>
              <div
                style={{
                  flexGrow: 1,
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  flexWrap: this.props.developer.debug === true ? "wrap" : "nowrap",
                }}>
                <div
                  style={{
                    textAlign: "center",
                    margin: "0px 1em",
                  }}>
                  <div
                    style={{
                      fontWeight: "bold",
                      fontSize: "1.1em",
                    }}>
                    <DomainText id={detail.borehole.extended.purpose} schema={"extended.purpose"} />
                  </div>
                  <div
                    style={{
                      color: "#787878",
                      fontSize: "0.8em",
                    }}>
                    <TranslationText id="purpose" />
                  </div>
                </div>
                <div
                  style={{
                    textAlign: "center",
                    margin: "0px 1em",
                  }}>
                  <div
                    style={{
                      fontWeight: "bold",
                      fontSize: "1.1em",
                    }}>
                    <NumericFormat value={detail.borehole.total_depth} thousandSeparator="'" displayType="text" />
                  </div>
                  <div
                    style={{
                      color: "#787878",
                      fontSize: "0.8em",
                    }}>
                    <TranslationText id="totaldepth" />
                  </div>
                </div>
                <div
                  style={{
                    textAlign: "center",
                    margin: "0px 1em",
                  }}>
                  <div
                    style={{
                      fontWeight: "bold",
                      fontSize: "1.1em",
                    }}>
                    <NumericFormat value={detail.borehole.elevation_z} thousandSeparator="'" displayType="text" />
                  </div>
                  <div
                    style={{
                      color: "#787878",
                      fontSize: "0.8em",
                    }}>
                    <TranslationText id="elevation_z" />
                  </div>
                </div>
                <div
                  style={{
                    textAlign: "center",
                    margin: "0px 1em",
                  }}>
                  <div
                    style={{
                      fontWeight: "bold",
                      fontSize: "1.1em",
                    }}>
                    <DateText date={detail.borehole.drilling_date} />
                  </div>
                  <div
                    style={{
                      color: "#787878",
                      fontSize: "0.8em",
                    }}>
                    <TranslationText id="drilling_end_date" />
                  </div>
                </div>
              </div>
            </div>,
            <div
              key="bms-dc-2"
              style={{
                display: "flex",
                flexDirection: "row",
                flex: "1 1 100%",
                paddingBottom: "1em",
                overflowY: "hidden",
              }}>
              <StratigraphiesComponent data={detail} />
            </div>,
          ]
        ) : detail.isFetching === true ? (
          <div
            style={{
              display: "flex",
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
            }}>
            <div
              style={{
                margin: "auto",
              }}>
              <Icon loading name="spinner" /> Loading...
            </div>
          </div>
        ) : (
          ""
        )}
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    developer: state.developer,
  };
};

DetailsComponent.propTypes = {
  detail: PropTypes.object,
  domains: PropTypes.object,
  developer: PropTypes.shape({
    debug: PropTypes.bool,
  }),
  i18n: PropTypes.shape({
    t: PropTypes.func,
  }),
};
export default connect(mapStateToProps, null)(DetailsComponent);
