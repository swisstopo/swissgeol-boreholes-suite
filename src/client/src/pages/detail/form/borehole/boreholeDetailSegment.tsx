import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { NumericFormat } from "react-number-format";
import { FormControl, FormControlLabel, RadioGroup } from "@mui/material";
import { Form, Segment } from "semantic-ui-react";
import _ from "lodash";
import { getBoreholeGeometryDepthTVD } from "../../../../api/fetchApiV2.js";
import DomainDropdown from "../../../../components/legacyComponents/domain/dropdown/domainDropdown.jsx";
import DomainTree from "../../../../components/legacyComponents/domain/tree/domainTree.jsx";
import { parseIfString } from "../../../../components/legacyComponents/formUtils.ts";
import TranslationText from "../../../../components/legacyComponents/translationText.jsx";
import { DisabledRadio } from "../styledComponents.jsx";
import { BoreholeDetailProps, DepthTVD } from "./boreholePanelInterfaces.ts";

const BoreholeDetailSegment = ({ legacyBorehole, updateChange, updateNumber, isEditable }: BoreholeDetailProps) => {
  const { t } = useTranslation();
  const [depthTVD, setDepthTVD] = useState<DepthTVD>();

  const updateTVD = useCallback(
    (field: string, depthMD: number) => {
      if (depthMD == null) {
        setDepthTVD(value => ({ ...value, [field]: null }));
      } else {
        getBoreholeGeometryDepthTVD(legacyBorehole.data.id, depthMD).then(response => {
          if (response != null) {
            setDepthTVD(value => {
              return { ...value, [field]: response };
            });
          } else {
            setDepthTVD(value => ({ ...value, [field]: null }));
          }
        });
      }
    },
    [legacyBorehole.data.id],
  );

  useEffect(() => {
    updateTVD("total_depth", legacyBorehole.data.total_depth);
  }, [legacyBorehole.data.total_depth, updateTVD]);

  useEffect(() => {
    updateTVD("extended.top_bedrock_fresh_md", legacyBorehole.data.extended.top_bedrock_fresh_md);
  }, [legacyBorehole.data.extended.top_bedrock_fresh_md, updateTVD]);

  useEffect(() => {
    updateTVD("custom.top_bedrock_weathered_md", legacyBorehole.data.custom.top_bedrock_weathered_md);
  }, [legacyBorehole.data.custom.top_bedrock_weathered_md, updateTVD]);

  const updateNumericField = (fieldNameMD: string, event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value === "" ? null : parseIfString(event.target.value);
    updateNumber(fieldNameMD, value);
  };

  const roundTvdValue = (value: number | undefined) => {
    return value ? Math.round(value * 100) / 100 : "";
  };

  return (
    <Segment>
      <Form autoComplete="off" error>
        <Form.Group widths="equal">
          <Form.Field required>
            <label>{t("totaldepth")}</label>
            <NumericFormat
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              onChange={e => updateNumericField("total_depth", e)}
              spellCheck="false"
              value={_.isNil(legacyBorehole.data.total_depth) ? "" : legacyBorehole.data.total_depth}
              thousandSeparator="'"
              readOnly={!isEditable}
            />
          </Form.Field>

          <Form.Field required>
            <label>{t("qt_depth")}</label>
            <DomainDropdown
              onSelected={(selected: { id: number }) => {
                updateChange("custom.qt_depth", selected.id, false);
              }}
              schema="depth_precision"
              selected={legacyBorehole.data.custom.qt_depth}
              readOnly={!isEditable}
            />
          </Form.Field>
          <Form.Field
            style={{
              opacity: 0.6,
              pointerEvents: "none",
            }}>
            <label>{t("total_depth_tvd")}</label>
            <NumericFormat
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
              value={roundTvdValue(depthTVD?.total_depth)}
              thousandSeparator="'"
              readOnly={true}
            />
          </Form.Field>
        </Form.Group>
        <Form.Group widths="equal">
          <Form.Field required>
            <label>{t("top_bedrock_fresh_md")}</label>
            <NumericFormat
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              onChange={e => updateNumericField("extended.top_bedrock_fresh_md", e)}
              spellCheck="false"
              value={
                _.isNil(legacyBorehole.data.extended.top_bedrock_fresh_md)
                  ? ""
                  : legacyBorehole.data.extended.top_bedrock_fresh_md
              }
              thousandSeparator="'"
              readOnly={!isEditable}
            />
          </Form.Field>
          <Form.Field
            style={{
              opacity: 0.6,
              pointerEvents: "none",
            }}>
            <label>{t("top_bedrock_fresh_tvd")}</label>
            <NumericFormat
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
              value={roundTvdValue(depthTVD?.["extended.top_bedrock_fresh_md"])}
              thousandSeparator="'"
              readOnly={true}
            />
          </Form.Field>
        </Form.Group>
        <Form.Group widths="equal">
          <Form.Field required>
            <label>{t("top_bedrock_weathered_md")}</label>
            <NumericFormat
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              onChange={e => updateNumericField("custom.top_bedrock_weathered_md", e)}
              spellCheck="false"
              value={legacyBorehole.data.custom.top_bedrock_weathered_md}
              thousandSeparator="'"
              readOnly={!isEditable}
            />
          </Form.Field>
          <Form.Field
            style={{
              opacity: 0.6,
              pointerEvents: "none",
            }}>
            <label>{t("top_bedrock_weathered_tvd")}</label>
            <NumericFormat
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
              value={roundTvdValue(depthTVD?.["custom.top_bedrock_weathered_md"])}
              thousandSeparator="'"
              readOnly={true}
            />
          </Form.Field>
        </Form.Group>
        <Form.Field required>
          <label>{t("lithology_top_bedrock")}</label>
          <DomainTree
            onSelected={(selected: { id: number }) => {
              updateChange("custom.lithology_top_bedrock", selected.id, false);
            }}
            schema="custom.lithology_top_bedrock"
            selected={legacyBorehole.data.custom.lithology_top_bedrock}
            title={t("lithology_top_bedrock")}
            isEditable={isEditable}
          />
        </Form.Field>
        <Form.Field required>
          <label>{t("lithostratigraphy_top_bedrock")}</label>
          <DomainTree
            levels={{
              1: "super",
              2: "group",
              3: "subgroup",
              4: "superformation",
              5: "formation",
            }}
            onSelected={(selected: { id: number }) => {
              updateChange("custom.lithostratigraphy_top_bedrock", selected.id, false);
            }}
            schema="custom.lithostratigraphy_top_bedrock"
            selected={legacyBorehole.data.custom.lithostratigraphy_top_bedrock}
            title={t("lithostratigraphy_top_bedrock")}
            isEditable={isEditable}
          />
        </Form.Field>
        <Form.Field required>
          <label>{t("chronostratigraphy_top_bedrock")}</label>
          <DomainTree
            levels={{
              1: "1st_order_eon",
              2: "2nd_order_era",
              3: "3rd_order_period",
              4: "4th_order_epoch",
              5: "5th_order_sub_epoch",
              6: "6th_order_sub_stage",
            }}
            onSelected={(selected: { id: number }) => {
              updateChange("custom.chronostratigraphy_top_bedrock", selected.id, false);
            }}
            schema="custom.chronostratigraphy_top_bedrock"
            selected={legacyBorehole.data.custom.chronostratigraphy_top_bedrock}
            title={t("chronostratigraphy_top_bedrock")}
            isEditable={isEditable}
          />
        </Form.Field>
        <Form.Field required>
          <label>{t("groundwater")}</label>
          <FormControl className="radio-group">
            <RadioGroup
              row
              value={
                legacyBorehole.data.extended.groundwater
                  ? "TRUE"
                  : !legacyBorehole.data.extended.groundwater
                    ? "FALSE"
                    : "NULL"
              }
              onChange={e => {
                const value = e.target.value === "TRUE" ? true : e.target.value === "FALSE" ? false : null;
                updateChange("extended.groundwater", value, false);
              }}>
              <FormControlLabel
                value="TRUE"
                control={<DisabledRadio isEditable={!isEditable} />}
                label={<TranslationText id={"yes"} />}
              />
              <FormControlLabel
                value="FALSE"
                control={<DisabledRadio isEditable={!isEditable} />}
                label={<TranslationText id={"no"} />}
              />
              <FormControlLabel
                value="NULL"
                control={<DisabledRadio isEditable={!isEditable} />}
                label={<TranslationText id={"np"} />}
              />
            </RadioGroup>
          </FormControl>
        </Form.Field>
      </Form>
    </Segment>
  );
};

export default BoreholeDetailSegment;
