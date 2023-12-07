import React, { useState } from "react";
import _ from "lodash";
import DomainText from "../../../../form/domain/domainText";
import { Stratigraphy } from "../../../../../stratigraphy";
import { NumericFormat } from "react-number-format";
import { Icon } from "semantic-ui-react";
import TranslationText from "../../../../form/translationText";
import { Box, Stack, LinearProgress, Switch, Typography } from "@mui/material";
import { useDomains } from "../../../../../api/fetchApiV2";
import { useTranslation } from "react-i18next";

const ProfileView = props => {
  const { data, handleSelected, layer, kind } = props;
  const [allFields, setAllFields] = useState(false);
  const { t, i18n } = useTranslation();
  const domains = useDomains();

  if (domains.isLoading) return <LinearProgress />;
  const layerKindDomains = domains?.data.filter(d => d.schema === "layer_kind");

  function getRow(text, fieldName) {
    const rowStyle = { marginBottom: "0.4em" };
    return (
      <Stack>
        <Typography variant="subtitle2">
          <TranslationText id={fieldName} />
        </Typography>
        <Typography style={rowStyle}>{text ? text : "-"}</Typography>
      </Stack>
    );
  }

  function getDomainRow(code, fieldName) {
    const text = code?.[i18n.language];
    return getRowIfVisible(fieldName, getRow(text, fieldName));
  }

  function getDomainRowMultiple(codes, fieldName) {
    const text =
      codes.length > 0
        ? codes.map(code => code[i18n.language]).join(",")
        : null;
    return getRowIfVisible(fieldName, getRow(text, fieldName));
  }

  function getNumericTextRow(fieldName, number) {
    const text = number ? (
      <NumericFormat value={number} thousandSeparator="'" displayType="text" />
    ) : null;
    return getTextRow(fieldName, text);
  }

  function getTextRow(fieldName, text) {
    return getRowIfVisible(fieldName, getRow(text, fieldName));
  }

  function getVisibleFields() {
    const filtered = layerKindDomains.filter(d => d.id === kind);
    if (layer === null || filtered.length > 1) return null;
    return {
      fields: { ...JSON.parse(filtered[0].conf).viewerFields },
    };
  }

  function getPattern(id) {
    const filteredDomains = domains?.data.filter(
      d => d.schema === "custom.lithology_top_bedrock",
    );

    let domain = filteredDomains.find(element => {
      return element.id === id;
    });

    if (domain !== undefined && domain.conf !== null) {
      const config = JSON.parse(domain.conf);
      return (
        'url("' + process.env.PUBLIC_URL + "/img/lit/" + config.image + '")'
      );
    } else {
      return null;
    }
  }
  function getColor(id) {
    const filteredDomains = domains.data.filter(
      d => d.schema === "custom.lithostratigraphy_top_bedrock",
    );

    let domain = filteredDomains.find(function (element) {
      return element.id === id;
    });
    if (domain !== undefined && domain.conf !== null) {
      const config = JSON.parse(domain.conf);
      const color = config.color;
      return "rgb(" + color.join(",") + ")";
    } else {
      return null;
    }
  }

  function getRowIfVisible(name, field) {
    const conf = getVisibleFields();
    if (layerKindDomains.length > 0) {
      for (let idx = 0; idx < layerKindDomains.length; idx++) {
        if (
          allFields === false &&
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
          getColor={getColor}
          getPattern={getPattern}
          getSubTitle={layer => (
            <DomainText
              id={layer.lithologyId}
              schema="custom.lithology_top_bedrock"
            />
          )}
          getTitle={layer => (
            <DomainText
              id={layer.lithostratigraphyId}
              schema="custom.lithostratigraphy_top_bedrock"
            />
          )}
          mapping={{
            id: "id",
            from: "fromDepth",
            to: "toDepth",
            color: "lithostratigraphyId",
            pattern: "lithologyId",
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
            ...(layer !== null
              ? {
                  backgroundColor: "rgb(245, 245, 245)",
                  borderTop: "2px solid #787878",
                  borderRight: "2px solid #787878",
                  borderBottom: "2px solid #787878",
                }
              : null),
          }}>
          {layer === null ? (
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
                  checked={allFields}
                  onChange={ev => {
                    setAllFields(ev.target.checked);
                  }}
                />
              </div>
              {getNumericTextRow("fromdepth", layer.fromDepth)}
              {getNumericTextRow("todepth", layer.toDepth)}
              {getTextRow(
                "layer_last",
                layer.isLast === true
                  ? t("common:yes")
                  : layer.isLast === false
                    ? t("common:no")
                    : null,
              )}
              {getDomainRow(layer.qtDescription, "qt_description")}

              {getDomainRow(layer.lithology, "lithology")}
              {getTextRow("original_lithology", layer.originalLithology)}
              {getTextRow("uscs_original", layer.originalUscs)}
              {getDomainRow(layer.uscsDetermination, "uscs_determination")}
              {getDomainRow(layer.uscs1, "uscs_1")}
              {getDomainRow(layer.grainSize1, "grain_size_1")}
              {getDomainRow(layer.uscs2, "uscs_2")}
              {getDomainRow(layer.grainSize2, "grain_size_2")}
              {getDomainRowMultiple(
                layer.codelists.filter(c => c.schema === "mcla101"),
                "uscs_3",
              )}
              {getDomainRowMultiple(
                layer.codelists.filter(c => c.schema === "mlpr110"),
                "grain_shape",
              )}
              {getDomainRowMultiple(
                layer.codelists.filter(c => c.schema === "mlpr115"),
                "grain_granularity",
              )}
              {getDomainRowMultiple(
                layer.codelists.filter(c => c.schema === "mlpr108"),
                "organic_component",
              )}
              {getDomainRowMultiple(
                layer.codelists.filter(c => c.schema === "mcla107"),
                "debris",
              )}
              {getDomainRow(
                layer.lithologyTopBedrock,
                "layer_lithology_top_bedrock",
              )}
              {getTextRow(
                "striae",
                layer.isStriae === true
                  ? t("common:yes")
                  : layer.isStriae === false
                    ? t("common:no")
                    : null,
              )}
              {getDomainRowMultiple(
                layer.codelists.filter(c => c.schema === "mlpr112"),
                "color",
              )}
              {getDomainRow(layer.consistance, "consistance")}
              {getDomainRow(layer.plasticity, "plasticity")}
              {getDomainRow(layer.compactness, "compactness")}
              {getDomainRow(layer.cohesion, "cohesion")}
              {getDomainRow(layer.gradation, "gradation")}
              {getDomainRow(layer.humidity, "humidity")}
              {getDomainRow(layer.alteration, "alteration")}
              {getTextRow("notes", layer.notes)}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ProfileView;
