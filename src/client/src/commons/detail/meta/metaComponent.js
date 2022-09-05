import React from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import DomainText from "../../form/domain/domainText";
import DateText from "../../form/dateText";
import MunicipalityText from "../../form/municipality/municipalityText";
import CantonText from "../../form/cantons/cantonText";
import TranslationText from "../../form/translationText";

// if it's text: this.getTextRow(translationId, data)
// if it's dropdown :  this.getDomainRow(schema,data,translationId)
// if it's date : this.getTextRow(translationId, data)
class MetaComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      pubexpanded: false,
    };
  }

  getDomainRow(schema, id, i18n = undefined) {
    return this.getTextRow(
      _.isUndefined(i18n) ? schema : i18n,
      _.isNil(id) || id === "" ? null : (
        <div>
          <DomainText id={id} schema={schema} />
        </div>
      ),
    );
  }
  getDateRow(schema, isodate) {
    return this.getTextRow(
      schema,
      _.isNil(isodate) || isodate === "" ? null : <DateText date={isodate} />,
    );
  }

  getTextRow(schema, text, key = Math.random().toString(16).substring(2, 8)) {
    return (
      <div key={key}>
        <div
          style={{
            fontSize: "0.8em",
            color: "#787878",
            lineHeight: "1em",
          }}>
          <TranslationText
            id={schema}
            // ns='borehole'
          />
        </div>
        <div
          style={{
            marginBottom: "0.4em",
          }}>
          {_.isNil(text) || text === "" ? "-" : text}
        </div>
      </div>
    );
  }

  getStatusRow() {
    const { data } = this.props;
    return (
      <div>
        <div
          style={{
            fontSize: "0.8em",
            color: "#787878",
            lineHeight: "1em",
          }}>
          <TranslationText id="locked_status" />
        </div>
        <div
          style={{
            marginBottom: "0.4em",
          }}>
          <TranslationText id={`status${data.role.toLowerCase()}`} />
        </div>
      </div>
    );
  }

  getStatusDate() {
    const { data } = this.props;

    if (data.workflow.finished) {
      return this.getDateRow("date", data.workflow.finished);
    } else {
      return (
        <div>
          <div
            style={{
              fontSize: "0.8em",
              color: "#787878",
              lineHeight: "1em",
            }}>
            <TranslationText id="date" />
          </div>
          <div
            style={{
              marginBottom: "0.4em",
            }}>
            <TranslationText id="inProgress" />
          </div>
        </div>
      );
    }
  }

  getPublicationsRows() {
    const { data } = this.props;
    const ret = [];
    for (let index = 0; index < data.pubblications.length; index++) {
      const pubblication = data.pubblications[index];
      if (pubblication.finished) {
        ret.push(
          <div key={index}>
            {ret.length === 0 ? (
              <div
                style={{
                  fontSize: "0.8em",
                  color: "#787878",
                  lineHeight: "1em",
                }}>
                <TranslationText id="currentVersion" />
              </div>
            ) : null}
            {ret.length === 1 ? (
              <div
                style={{
                  fontSize: "0.8em",
                  color: "#787878",
                  lineHeight: "1em",
                }}>
                <TranslationText id="previousVersions" />
              </div>
            ) : null}
            <div
              style={{
                marginBottom: "0.4em",
              }}>
              <DateText date={pubblication.finished} hours />
            </div>
          </div>,
        );
      }
    }
    return ret;
  }

  render() {
    const { data } = this.props;
    const margin = "0.5em 0px";
    const padding = "0.5em";
    return (
      <div
        style={{
          minWidth: "250px",
        }}>
        {data.custom.identifiers && data.custom.identifiers.length > 0 ? (
          <div
            style={{
              borderBottom: "thin solid rgba(0, 0, 0, 0.15)",
              display: "flex",
              flexDirection: "column",
              margin: margin,
              padding: padding,
            }}>
            {data.custom.identifiers.map((identifier, index) => (
              <div
                key={`bdms-metadata-cmp-identifiers-${index}`}
                style={{
                  flex: "1 1 100%",
                  marginBottom: "0.4em",
                }}>
                <div
                  style={{
                    fontSize: "0.8em",
                    color: "#787878",
                    lineHeight: "1em",
                  }}>
                  <DomainText id={identifier.id} schema="borehole_identifier" />
                </div>
                {identifier.value}
              </div>
            ))}
          </div>
        ) : null}

        <div
          style={{
            borderBottom: "thin solid rgba(0, 0, 0, 0.15)",
            display: "flex",
            flexDirection: "row",
            margin: margin,
            padding: padding,
          }}>
          <div
            style={{
              flex: "1 1 100%",
            }}>
            {this.getTextRow("original_name", data.extended.original_name)}
            {this.getTextRow("alternate_name", data.custom.alternate_name)}
          </div>
          <div
            style={{
              flex: "1 1 100%",
            }}>
            {this.getTextRow("project_name", data.custom.project_name)}
          </div>
        </div>

        <div
          style={{
            borderBottom: "thin solid rgba(0, 0, 0, 0.15)",
            display: "flex",
            flexDirection: "row",
            margin: margin,
            padding: padding,
          }}>
          <div
            style={{
              flex: "1 1 100%",
            }}>
            {this.getStatusRow()}
          </div>
          <div
            style={{
              flex: "1 1 100%",
            }}>
            {data.role === "PUBLIC" && data.pubblications !== null
              ? this.getPublicationsRows()
              : this.getStatusDate()}
          </div>
        </div>

        <div
          style={{
            borderBottom: "thin solid rgba(0, 0, 0, 0.15)",
            display: "flex",
            flexDirection: "row",
            margin: margin,
            padding: padding,
          }}>
          <div
            style={{
              flex: "1 1 100%",
            }}>
            {this.getDomainRow("restriction", data.restriction, "restriction")}
          </div>
          <div
            style={{
              flex: "1 1 100%",
            }}>
            {this.getTextRow("restriction_until", data.restriction_until)}
          </div>
        </div>

        <div
          style={{
            borderBottom: "thin solid rgba(0, 0, 0, 0.15)",
            display: "flex",
            flexDirection: "row",
            margin: margin,
            padding: padding,
          }}>
          <div
            style={{
              flex: "1 1 100%",
            }}>
            {this.getTextRow(
              "coordinates",
              data.location_x + ", " + data.location_y,
            )}
            {this.getTextRow("elevation_z", data.elevation_z)}
            {this.getTextRow("reference_elevation", data.reference_elevation)}
            {this.getDomainRow(
              "ibor117",
              data.reference_elevation_type,
              "reference_elevation_type",
            )}
          </div>
          <div
            style={{
              flex: "1 1 100%",
            }}>
            {this.getDomainRow("qt_location", data.qt_location)}
            {this.getDomainRow("qt_elevation", data.qt_elevation)}
            {this.getDomainRow(
              "qt_elevation",
              data.qt_reference_elevation,
              "reference_elevation_qt",
            )}
            {this.getDomainRow("hrs", data.hrs)}
          </div>
        </div>

        <div
          style={{
            borderBottom: "thin solid rgba(0, 0, 0, 0.15)",
            display: "flex",
            flexDirection: "row",
            margin: margin,
            padding: padding,
          }}>
          <div
            style={{
              flex: "1 1 100%",
            }}>
            {this.getTextRow("canton", <CantonText id={data.custom.canton} />)}
          </div>
          <div
            style={{
              flex: "1 1 100%",
            }}>
            {this.getTextRow(
              "city",
              <MunicipalityText id={data.custom.city} />,
            )}
          </div>
        </div>

        <div
          style={{
            borderBottom: "thin solid rgba(0, 0, 0, 0.15)",
            margin: margin,
            padding: padding,
          }}>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
            }}>
            <div
              style={{
                flex: "1 1 100%",
              }}>
              {this.getDomainRow("kind", data.kind)}
              {this.getDomainRow(
                "extended.purpose",
                data.extended.purpose,
                "purpose",
              )}
              {this.getTextRow("spud_date", data.spud_date)}
              {this.getTextRow(
                "drill_diameter",
                data.custom.drill_diameter !== null
                  ? data.custom.drill_diameter
                  : null,
              )}
              {this.getTextRow(
                "inclination",
                data.inclination !== null ? data.inclination : null,
              )}
              {this.getDomainRow(
                "custom.qt_bore_inc_dir",
                data.custom.qt_bore_inc_dir,
                "qt_bore_inc_dir",
              )}
            </div>
            <div
              style={{
                flex: "1 1 100%",
              }}>
              {this.getDomainRow(
                "extended.drilling_method",
                data.extended.drilling_method,
                "drilling_method",
              )}

              {this.getDomainRow(
                "custom.cuttings",
                data.custom.cuttings,
                "cuttings",
              )}
              {this.getTextRow("drilling_end_date", data.drilling_date)}
              {this.getDomainRow(
                "extended.status",
                data.extended.status,
                "boreholestatus",
              )}
              {this.getTextRow(
                "inclination_direction",
                data.inclination_direction !== null
                  ? data.inclination_direction
                  : null,
              )}
            </div>
          </div>
        </div>

        <div
          style={{
            borderBottom: "thin solid rgba(0, 0, 0, 0.15)",
            display: "flex",
            flexDirection: "row",
            margin: margin,
            padding: padding,
          }}>
          <div
            style={{
              flex: "1 1 100%",
            }}>
            {this.getTextRow(
              "totaldepth",
              data.total_depth !== null ? data.total_depth : null,
            )}
            {this.getTextRow(
              "total_depth_tvd",
              data.total_depth_tvd !== null ? data.total_depth_tvd : null,
            )}
            {this.getTextRow(
              "top_bedrock",
              data.extended.top_bedrock !== null
                ? data.extended.top_bedrock
                : null,
            )}
            {this.getTextRow(
              "top_bedrock_tvd",
              data.extended.top_bedrock_tvd !== null
                ? data.extended.top_bedrock_tvd
                : null,
            )}
            {this.getTextRow(
              "groundwater",
              data.extended.groundwater === true ? (
                <TranslationText id="yes" />
              ) : data.extended.groundwater === false ? (
                <TranslationText id="no" />
              ) : null,
            )}
            {this.getDomainRow(
              "custom.lithostratigraphy_top_bedrock",
              data.custom.lithostratigraphy_top_bedrock,
              "lithostratigraphy_top_bedrock",
            )}
          </div>
          <div
            style={{
              flex: "1 1 100%",
            }}>
            {this.getDomainRow(
              "custom.qt_depth",
              data.custom.qt_depth,
              "qt_depth",
            )}
            {this.getDomainRow(
              "custom.qt_top_bedrock",
              data.qt_total_depth_tvd,
              "total_depth_tvd_qt",
            )}
            {this.getDomainRow(
              "custom.qt_top_bedrock",
              data.custom.qt_top_bedrock,
              "qt_top_bedrock",
            )}
            {this.getDomainRow(
              "custom.qt_top_bedrock",
              data.custom.qt_top_bedrock_tvd,
              "top_bedrock_tvd_qt",
            )}
            {this.getDomainRow(
              "custom.lithology_top_bedrock",
              data.custom.lithology_top_bedrock,
              "lithology_top_bedrock",
            )}
            {this.getDomainRow(
              "custom.chronostratigraphy_top_bedrock",
              data.custom.chronostratigraphy_top_bedrock,
              "chronostratigraphy_top_bedrock",
            )}
          </div>
        </div>
        <div
          style={{
            margin: margin,
            padding: padding,
          }}>
          {this.getTextRow(
            "remarks",
            data.custom.remarks !== "" ? data.custom.remarks : "-",
          )}
        </div>
      </div>
    );
  }
}

MetaComponent.propTypes = {
  data: PropTypes.object,
};

export default MetaComponent;
