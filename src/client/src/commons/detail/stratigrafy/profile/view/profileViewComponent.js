import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { withTranslation } from "react-i18next";
import _ from "lodash";
import DomainText from "../../../../form/domain/domainText";
import { Stratigraphy } from "../../../../../stratigraphy";
import { NumericFormat } from "react-number-format";
import { Icon } from "semantic-ui-react";
import { Box, Stack, Switch, Typography } from "@mui/material";
import TranslationText from "../../../../form/translationText";

class ProfileView extends React.Component {
  constructor(props) {
    super(props);
    this.getDomainRow = this.getDomainRow.bind(this);
    this.getDomainRowMultiple = this.getDomainRowMultiple.bind(this);
    this.getTextRow = this.getTextRow.bind(this);
    this.getPattern = this.getPattern.bind(this);
    this.getColor = this.getColor.bind(this);
    this.getRowIfVisible = this.getRowIfVisible.bind(this);
    this.state = {
      allfields: false,
      viewas: props.kind,
    };
  }

  getRow(text, fieldName) {
    const rowStyle = { marginBottom: "0.4em" };
    return (
      <Stack>
        <Typography variant="subtitle2">
          <TranslationText id={fieldName} />
        </Typography>
        <Typography style={rowStyle}>{text}</Typography>
      </Stack>
    );
  }

  getDomainRow(code, fieldName) {
    const { i18n } = this.props;
    const text = code?.[i18n.language] ?? "-";
    if (fieldName === "layer_lithology_top_bedrock") {
      fieldName = "lithology_top_bedrock";
    } // Fixes discrepancy between fieldName translationId and fieldName in visible Fields array.

    return this.getRowIfVisible(fieldName, this.getRow(text, fieldName));
  }

  getDomainRowMultiple(codes, fieldName) {
    const { i18n } = this.props;
    const text =
      codes.length > 0 ? codes.map(code => code[i18n.language]).join(",") : "-";
    return this.getRowIfVisible(fieldName, this.getRow(text, fieldName));
  }

  getNumericTextRow(fieldName, number) {
    const text = (
      <NumericFormat value={number} thousandSeparator="'" displayType="text" />
    );
    return this.getTextRow(fieldName, text);
  }

  getTextRow(fieldName, text) {
    return this.getRowIfVisible(fieldName, this.getRow(text, fieldName));
  }

  getVisibleFields() {
    const { domains, layer } = this.props;
    if (layer !== null && domains.data.hasOwnProperty("layer_kind")) {
      const filtered = domains.data.layer_kind.filter(
        kind => this.props.kind === kind.id,
      );

      let fields = { ...filtered[0].conf.viewerFields };
      if (filtered.length > 1) {
        for (let index = 1; index < filtered.length; index++) {
          const element = filtered[index];

          fields = _.mergeWith(
            fields,
            element.conf.viewerFields,
            (objValue, srcValue) => {
              return objValue || srcValue;
            },
          );
        }
      }
      return {
        fields: fields,
      };
    } else {
      return null;
    }
  }

  getPattern(id) {
    const { domains } = this.props;

    const ns = domains.data.layer_kind.find(
      element => element.id === this.state.viewas,
    )?.conf.patternNS;

    if (!domains.data.hasOwnProperty(ns)) {
      return null;
    }

    let domain = domains.data[ns].find(element => {
      return element.id === id;
    });

    if (
      domain !== undefined &&
      domain.conf !== null &&
      domain.conf.hasOwnProperty("image")
    ) {
      return (
        'url("' +
        process.env.PUBLIC_URL +
        "/img/lit/" +
        domain.conf.image +
        '")'
      );
    } else {
      return null;
    }
  }
  getColor(id) {
    const { domains } = this.props;

    const ns = domains.data.layer_kind.find(
      element => element.id === this.state.viewas,
    )?.conf.colorNS;

    if (!domains.data.hasOwnProperty(ns)) {
      return null;
    }

    let domain = domains.data[ns].find(function (element) {
      return element.id === id;
    });
    if (
      domain !== undefined &&
      domain.conf !== null &&
      domain.conf.hasOwnProperty("color")
    ) {
      const color = domain.conf.color;
      return "rgb(" + color.join(",") + ")";
    } else {
      return null;
    }
  }

  getRowIfVisible(name, field) {
    const { domains } = this.props;
    const conf = this.getVisibleFields();

    if (
      _.has(domains, "data.layer_kind") &&
      _.isArray(domains.data.layer_kind)
    ) {
      for (let idx = 0; idx < domains.data.layer_kind.length; idx++) {
        if (
          this.state.allfields === false &&
          _.isObject(conf) &&
          _.has(conf, `fields.${name}`)
        ) {
          if (conf.fields[name] === true) {
            return field;
          } else {
            return null;
          }
        }
      }
    }
    return field;
  }

  render() {
    const { data, domains, t, handleSelected, layer } = this.props;
    return (
      <Box
        className="flex_col"
        style={{
          flex: "1 1 100%",
          height: "100%",
          overflowY: "hidden",
        }}>
        <Box
          style={{
            display: "flex",
            flex: "1 1 100%",
            flexDirection: "row",
            height: "100%",
            overflowY: "hidden",
          }}>
          <Stratigraphy
            data={data}
            getColor={this.getColor}
            getPattern={this.getPattern}
            getSubTitle={layer => (
              <DomainText
                id={layer.lithology}
                schema="custom.lithology_top_bedrock"
              />
            )}
            getTitle={layer => (
              <DomainText
                id={layer.lithostratigraphy}
                schema="custom.lithostratigraphy_top_bedrock"
              />
            )}
            mapping={{
              id: "id",
              from: "depth_from",
              to: "depth_to",
              color: domains.data.layer_kind.find(
                element => element.id === this.state.viewas,
              )?.conf.color,
              pattern: domains.data.layer_kind.find(
                element => element.id === this.state.viewas,
              )?.conf.pattern,
            }}
            onSelected={handleSelected}
            overLayerStyle={{
              backgroundColor: "rgb(245, 245, 245)",
            }}
            selectedLayerStyle={{
              backgroundColor: "rgb(245, 245, 245)",
              borderTop: "2px solid #787878",
              borderBottom: "2px solid #787878",
              overflow: "hidden",
            }}
            unselectedLayerStyle={{
              borderRight: "2px solid #787878",
              overflow: "hidden",
            }}
          />
          <Box
            style={{
              flex: "1 1 100%",
              overflowY: "auto",
              padding: "1em",
              ...(this.props.layer !== null
                ? {
                    backgroundColor: "rgb(245, 245, 245)",
                    borderTop: "2px solid #787878",
                    borderRight: "2px solid #787878",
                    borderBottom: "2px solid #787878",
                  }
                : null),
            }}>
            {this.props.layer === null ? (
              <div
                style={{
                  flex: "1 1 0%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                }}>
                <div
                  style={{
                    color: "#787878",
                  }}>
                  <Icon name="arrow left" />
                  <TranslationText id="clickLayer" />
                </div>
              </div>
            ) : (
              <Box data-cy="stratigraphy-layer-details">
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    textAlign: "right",
                    whiteSpace: "nowrap",
                    paddingBottom: 15,
                    justifyContent: "space-between",
                  }}>
                  <TranslationText id="showallfields" />
                  <Switch
                    checked={this.state.allfields}
                    onChange={ev => {
                      this.setState({
                        allfields: ev.target.checked,
                      });
                    }}
                  />
                </div>
                {this.getNumericTextRow("layer_depth_from", layer.fromDepth)}
                {this.getNumericTextRow("layer_depth_to", layer.toDepth)}
                {this.getTextRow(
                  "lithological_description",
                  layer.descriptionLithological,
                )}
                {this.getTextRow("facies_description", layer.descriptionFacies)}
                {this.getTextRow(
                  "layer_last",
                  layer.isLast === true
                    ? t("common:yes")
                    : layer.isLast === false
                    ? t("common:no")
                    : null,
                )}
                {this.getDomainRow(layer.qtDescription, "qt_description")}

                {this.getDomainRow(layer.lithology, "lithology")}
                {this.getDomainRow(
                  layer.lithostratigraphy,
                  "lithostratigraphy",
                )}
                {this.getDomainRow(
                  layer.chronostratigraphy,
                  "chronostratigraphy",
                )}
                {this.getTextRow("uscs_original", layer.originalUscs)}
                {this.getDomainRow(
                  layer.uscsDetermination,
                  "uscs_determination",
                )}
                {this.getDomainRow(layer.uscs1, "uscs_1")}
                {this.getDomainRow(layer.grainSize1, "grain_size_1")}
                {this.getDomainRow(layer.uscs2, "uscs_2")}
                {this.getDomainRow(layer.grainSize2, "grain_size_2")}
                {this.getDomainRowMultiple(
                  layer.codelists.filter(c => c.schema === "mcla101"),
                  "uscs_3",
                )}
                {this.getDomainRowMultiple(
                  layer.codelists.filter(c => c.schema === "mlpr110"),
                  "grain_shape",
                )}
                {this.getDomainRowMultiple(
                  layer.codelists.filter(c => c.schema === "mlpr115"),
                  "grain_granularity",
                )}
                {this.getDomainRowMultiple(
                  layer.codelists.filter(c => c.schema === "mlpr108"),
                  "organic_component",
                )}
                {this.getDomainRowMultiple(
                  layer.codelists.filter(c => c.schema === "mcla107"),
                  "debris",
                )}
                {this.getDomainRow(
                  layer.lithologyTopBedrock,
                  "layer_lithology_top_bedrock",
                )}
                {this.getTextRow(
                  "striae",
                  layer.isStriae === true
                    ? t("common:yes")
                    : layer.isStriae === false
                    ? t("common:no")
                    : null,
                )}
                {this.getDomainRowMultiple(
                  layer.codelists.filter(c => c.schema === "mlpr112"),
                  "color",
                )}
                {this.getDomainRow(layer.consistance, "consistance")}
                {this.getDomainRow(layer.plasticity, "plasticity")}
                {this.getDomainRow(layer.compactness, "compactness")}
                {this.getDomainRow(layer.cohesion, "cohesion")}
                {this.getDomainRow(layer.gradation, "gradation")}
                {this.getDomainRow(layer.humidity, "humidity")}
                {this.getDomainRow(layer.alteration, "alteration")}
                {this.getTextRow("notes", layer.notes)}
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    );
  }
}

ProfileView.propTypes = {
  data: PropTypes.array,
  domains: PropTypes.shape({
    data: PropTypes.object,
  }),
  handleSelected: PropTypes.func,
  i18n: PropTypes.shape({
    language: PropTypes.string,
  }),
  kind: PropTypes.number,
  layer: PropTypes.object,
  setting: PropTypes.shape({
    data: PropTypes.object,
  }),
  t: PropTypes.func,
};

const mapStateToProps = state => {
  return {
    domains: state.core_domain_list,
    setting: state.setting,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    dispatch: dispatch,
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslation(["common"])(ProfileView));
