import React from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import DomainText from "../../form/domain/domainText";
import DateText from "../../form/dateText";
import TranslationText from "../../form/translationText";
import { NumericFormat } from "react-number-format";

// Constants for styles
const rowLabelStyle = {
  fontSize: "0.8em",
  color: "#787878",
  lineHeight: "1em",
};

const flexRowStyle = {
  flex: "1 1 100%",
};

const rowTextStyle = {
  marginBottom: "0.4em",
};

const rowContainerStyle = {
  borderBottom: "thin solid rgba(0, 0, 0, 0.15)",
  display: "flex",
  flexDirection: "row",
  margin: "0.5em 0px",
  padding: "0.5em",
};

// if it's text: this.getTextRow(translationId, data)
// if it's numeric with thousand separators: this.getNumericTextRow(translationId, data)
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
    return this.getTextRow(schema, _.isNil(isodate) || isodate === "" ? null : <DateText date={isodate} />);
  }

  getNumericTextRow(schema, ...values) {
    let coordinates;
    if (values?.length === 2) {
      coordinates = (
        <>
          <NumericFormat value={values[0] ?? "-"} thousandSeparator="'" displayType="text" suffix=", " />
          <NumericFormat value={values[1] ?? "-"} thousandSeparator="'" displayType="text" />
        </>
      );
    } else {
      coordinates = <NumericFormat value={values[0] ?? "-"} thousandSeparator="'" displayType="text" />;
    }

    return (
      <div key={schema}>
        <div style={rowLabelStyle}>
          <TranslationText id={schema} />
        </div>
        <div style={rowTextStyle}>{coordinates}</div>
      </div>
    );
  }

  getTextRow(schema, text, key = Math.random().toString(16).substring(2, 8)) {
    return (
      <div key={key}>
        <div style={rowLabelStyle}>
          <TranslationText
            id={schema}
            // ns='borehole'
          />
        </div>
        <div style={rowTextStyle}>{_.isNil(text) || text === "" ? "-" : text}</div>
      </div>
    );
  }

  getBoolRow(schema, value) {
    const translationId = value ? "yes" : value === false ? "no" : "np";
    return (
      <>
        <div style={rowLabelStyle}>
          <TranslationText id={schema} />
        </div>
        <div style={rowTextStyle}>
          <TranslationText id={translationId} />
        </div>
      </>
    );
  }

  getStatusRow() {
    const { data } = this.props;
    return (
      <div>
        <div style={rowLabelStyle}>
          <TranslationText id="locked_status" />
        </div>
        <div style={rowTextStyle}>
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
          <div style={rowLabelStyle}>
            <TranslationText id="date" />
          </div>
          <div style={rowTextStyle}>
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
              <div style={rowLabelStyle}>
                <TranslationText id="currentVersion" />
              </div>
            ) : null}
            {ret.length === 1 ? (
              <div style={rowLabelStyle}>
                <TranslationText id="previousVersions" />
              </div>
            ) : null}
            <div style={rowTextStyle}>
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
        <div style={{ ...rowContainerStyle, flexDirection: "column" }}>
          <div
            key={`bdms-metadata-cmp-identifiers-application`}
            style={{
              ...flexRowStyle,
              ...rowTextStyle,
            }}>
            <div style={rowLabelStyle}>
              <TranslationText id="borehole_technical_id" />
            </div>
            {data.id}
          </div>
          {data.custom.identifiers
            ? data.custom.identifiers.map((identifier, index) => (
                <div
                  key={`bdms-metadata-cmp-identifiers-${index}`}
                  style={{
                    flexRowStyle,
                    ...rowTextStyle,
                  }}>
                  <div style={rowLabelStyle}>
                    <DomainText id={identifier.id} schema="borehole_identifier" />
                  </div>
                  {identifier.value}
                </div>
              ))
            : null}
        </div>
        <div style={rowContainerStyle}>
          <div style={flexRowStyle}>
            {this.getTextRow("original_name", data.extended.original_name)}
            {this.getTextRow("alternate_name", data.custom.alternate_name)}
          </div>
          <div style={flexRowStyle}>{this.getTextRow("project_name", data.custom.project_name)}</div>
        </div>

        <div style={rowContainerStyle}>
          <div style={flexRowStyle}>{this.getStatusRow()}</div>
          <div style={flexRowStyle}>
            {data.role === "PUBLIC" && data.pubblications !== null ? this.getPublicationsRows() : this.getStatusDate()}
          </div>
        </div>

        <div style={rowContainerStyle}>
          <div data-cy="restriction-label" style={flexRowStyle}>
            {this.getDomainRow("restriction", data.restriction, "restriction")}
            {this.getBoolRow("national_interest", data.national_interest)}
          </div>
          <div data-cy="restriction_until-label" style={flexRowStyle}>
            {this.getTextRow("restriction_until", data.restriction_until)}
          </div>
        </div>

        <div style={rowContainerStyle}>
          <div data-cy="coordinates-div" style={flexRowStyle}>
            {this.getNumericTextRow("coordinatesLV95", data.location_x, data.location_y)}
            {this.getNumericTextRow("coordinatesLV03", data.location_x_lv03, data.location_y_lv03)}
            {this.getNumericTextRow("elevation_z", data.elevation_z)}
            {this.getNumericTextRow("reference_elevation", data.reference_elevation)}
            {this.getDomainRow("reference_elevation_type", data.reference_elevation_type, "reference_elevation_type")}
          </div>
          <div style={flexRowStyle}>
            {this.getDomainRow("location_precision", data.location_precision)}
            {this.getDomainRow("elevation_precision", data.elevation_precision)}
            {this.getDomainRow("elevation_precision", data.qt_reference_elevation, "reference_elevation_qt")}
            {this.getDomainRow("height_reference_system", data.height_reference_system)}
          </div>
        </div>

        <div style={rowContainerStyle}>
          <div style={flexRowStyle}>{this.getTextRow("canton", data.custom.canton)}</div>
          <div style={flexRowStyle}>{this.getTextRow("city", data.custom.municipality)}</div>
        </div>

        <div
          style={{
            borderBottom: "thin solid rgba(0, 0, 0, 0.15)",
            margin: margin,
            padding: padding,
          }}>
          <div
            data-cy="kind-label"
            style={{
              display: "flex",
              flexDirection: "row",
            }}>
            <div style={flexRowStyle}>
              {this.getDomainRow("borehole_type", data.borehole_type)}
              {this.getDomainRow("extended.purpose", data.extended.purpose, "purpose")}
              {this.getTextRow("spud_date", data.spud_date)}
              {this.getNumericTextRow(
                "drill_diameter",
                data.custom.drill_diameter !== null ? data.custom.drill_diameter : null,
              )}
              {this.getTextRow("inclination", data.inclination !== null ? data.inclination : null)}
              {this.getDomainRow("custom.qt_bore_inc_dir", data.custom.qt_bore_inc_dir, "qt_bore_inc_dir")}
            </div>
            <div style={flexRowStyle}>
              {this.getDomainRow("extended.drilling_method", data.extended.drilling_method, "drilling_method")}

              {this.getDomainRow("custom.cuttings", data.custom.cuttings, "cuttings")}
              {this.getTextRow("drilling_end_date", data.drilling_date)}
              {this.getDomainRow("extended.status", data.extended.status, "boreholestatus")}
              {this.getTextRow(
                "inclination_direction",
                data.inclination_direction !== null ? data.inclination_direction : null,
              )}
            </div>
          </div>
        </div>

        <div style={rowContainerStyle}>
          <div style={flexRowStyle}>
            {this.getNumericTextRow("totaldepth", data.total_depth !== null ? data.total_depth : null)}
            {this.getNumericTextRow("total_depth_tvd", data.total_depth_tvd !== null ? data.total_depth_tvd : null)}
            {this.getNumericTextRow(
              "top_bedrock",
              data.extended.top_bedrock !== null ? data.extended.top_bedrock : null,
            )}
            {this.getNumericTextRow(
              "top_bedrock_tvd",
              data.extended.top_bedrock_tvd !== null ? data.extended.top_bedrock_tvd : null,
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
          <div data-cy="qt_depth-label" style={flexRowStyle}>
            {this.getDomainRow("custom.qt_top_bedrock", data.custom.qt_depth, "qt_depth")}
            {this.getDomainRow("custom.qt_top_bedrock", data.qt_total_depth_tvd, "total_depth_tvd_qt")}
            {this.getNumericTextRow(
              "qt_top_bedrock",
              data.custom.qt_top_bedrock !== null ? data.custom.qt_top_bedrock : null,
            )}
            {this.getNumericTextRow(
              "top_bedrock_tvd_qt",
              data.custom.qt_top_bedrock_tvd !== null ? data.custom.qt_top_bedrock_tvd : null,
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
          {this.getTextRow("remarks", data.custom.remarks !== "" ? data.custom.remarks : "-")}
        </div>
      </div>
    );
  }
}

MetaComponent.propTypes = {
  data: PropTypes.object,
};

export default MetaComponent;
