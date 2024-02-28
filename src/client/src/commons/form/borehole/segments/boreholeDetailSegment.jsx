import _ from "lodash";

import DomainDropdown from "../../domain/dropdown/domainDropdown";
import DomainTree from "../../domain/tree/domainTree";
import TranslationText from "../../translationText";
import { NumericFormat } from "react-number-format";
import { Form, Segment } from "semantic-ui-react";
import { FormControl, RadioGroup, FormControlLabel } from "@mui/material";
import { parseIfString } from "../../formUtils";
import { DisabledRadio } from "./styledComponents";

const BoreholeDetailSegment = props => {
  const { size, borehole, updateChange, updateNumber, isEditable } = props;
  return (
    <Segment>
      <Form autoComplete="off" error size={size}>
        <Form.Group widths="equal">
          <Form.Field required>
            <label>
              <TranslationText id="totaldepth" />
            </label>
            <NumericFormat
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              onChange={e => {
                updateNumber("total_depth", e.target.value === "" ? null : parseIfString(e.target.value));
              }}
              spellCheck="false"
              value={_.isNil(borehole.data.total_depth) ? "" : borehole.data.total_depth}
              thousandSeparator="'"
              readOnly={!isEditable}
            />
          </Form.Field>
          <Form.Field required>
            <label>
              <TranslationText id="qt_depth" />
            </label>
            <DomainDropdown
              onSelected={selected => {
                updateChange("custom.qt_depth", selected.id, false);
              }}
              schema="custom.qt_top_bedrock"
              selected={borehole.data.custom.qt_depth}
              readOnly={!isEditable}
            />
          </Form.Field>
        </Form.Group>
        <Form.Group widths="equal">
          <Form.Field required>
            <label>
              <TranslationText id="total_depth_tvd" />
            </label>
            <NumericFormat
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              onChange={e => {
                updateNumber("total_depth_tvd", e.target.value === "" ? null : parseIfString(e.target.value));
              }}
              spellCheck="false"
              value={_.isNil(borehole.data.total_depth_tvd) ? "" : borehole.data.total_depth_tvd}
              thousandSeparator="'"
              readOnly={!isEditable}
            />
          </Form.Field>

          <Form.Field required>
            <label>
              <TranslationText id="total_depth_tvd_qt" />
            </label>
            <DomainDropdown
              onSelected={selected => {
                updateChange("qt_total_depth_tvd", selected.id, false);
              }}
              schema="custom.qt_top_bedrock"
              selected={borehole.data.qt_total_depth_tvd}
              readOnly={!isEditable}
            />
          </Form.Field>
        </Form.Group>
        <Form.Group widths="equal">
          <Form.Field required>
            <label>
              <TranslationText id="top_bedrock" />
            </label>
            <NumericFormat
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              onChange={e => {
                updateNumber("extended.top_bedrock", e.target.value === "" ? null : parseIfString(e.target.value));
              }}
              spellCheck="false"
              value={_.isNil(borehole.data.extended.top_bedrock) ? "" : borehole.data.extended.top_bedrock}
              thousandSeparator="'"
              readOnly={!isEditable}
            />
          </Form.Field>
          <Form.Field required>
            <label>
              <TranslationText id="qt_top_bedrock" />
            </label>
            <NumericFormat
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              onChange={e => {
                updateNumber("custom.qt_top_bedrock", e.target.value === "" ? null : parseIfString(e.target.value));
              }}
              spellCheck="false"
              value={borehole.data.custom.qt_top_bedrock}
              thousandSeparator="'"
              readOnly={!isEditable}
            />
          </Form.Field>
        </Form.Group>
        <Form.Group widths="equal">
          <Form.Field required>
            <label>
              <TranslationText id="top_bedrock_tvd" />
            </label>
            <NumericFormat
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              onChange={e => {
                updateNumber("extended.top_bedrock_tvd", e.target.value === "" ? null : parseIfString(e.target.value));
              }}
              spellCheck="false"
              value={_.isNil(borehole.data.extended.top_bedrock_tvd) ? "" : borehole.data.extended.top_bedrock_tvd}
              thousandSeparator="'"
              readOnly={!isEditable}
            />
          </Form.Field>

          <Form.Field required>
            <label>
              <TranslationText id="top_bedrock_tvd_qt" />
            </label>
            <NumericFormat
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              onChange={e => {
                updateNumber("custom.qt_top_bedrock_tvd", e.target.value === "" ? null : parseIfString(e.target.value));
              }}
              spellCheck="false"
              value={borehole.data.custom.qt_top_bedrock_tvd}
              thousandSeparator="'"
              readOnly={!isEditable}
            />
          </Form.Field>
        </Form.Group>
        <Form.Field required>
          <label>
            <TranslationText id="groundwater" />
          </label>
          <FormControl className="radio-group">
            <RadioGroup
              row
              value={
                borehole.data.extended.groundwater === true
                  ? "TRUE"
                  : borehole.data.extended.groundwater === false
                    ? "FALSE"
                    : "NULL"
              }
              onChange={e => {
                let value = e.target.value === "TRUE" ? true : e.target.value === "FALSE" ? false : null;
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
        <Form.Field required>
          <label>
            <TranslationText id="lithology_top_bedrock" />
          </label>
          <DomainTree
            levels={{
              1: "rock",
              2: "process",
              3: "type",
            }}
            onSelected={selected => {
              updateChange("custom.lithology_top_bedrock", selected.id, false);
            }}
            schema="custom.lithology_top_bedrock"
            selected={borehole.data.custom.lithology_top_bedrock}
            title={<TranslationText id="lithology_top_bedrock" />}
            isEditable={isEditable}
          />
        </Form.Field>
        <Form.Field required>
          <label>
            <TranslationText id="lithostratigraphy_top_bedrock" />
          </label>
          <DomainTree
            levels={{
              1: "super",
              2: "group",
              3: "subgroup",
              4: "superformation",
              5: "formation",
            }}
            onSelected={selected => {
              updateChange("custom.lithostratigraphy_top_bedrock", selected.id, false);
            }}
            schema="custom.lithostratigraphy_top_bedrock"
            selected={borehole.data.custom.lithostratigraphy_top_bedrock}
            title={<TranslationText id="lithostratigraphy_top_bedrock" />}
            isEditable={isEditable}
          />
        </Form.Field>
        <Form.Field required>
          <label>
            <TranslationText id="chronostratigraphy_top_bedrock" />
          </label>
          <DomainTree
            levels={{
              1: "1st_order_eon",
              2: "2nd_order_era",
              3: "3rd_order_period",
              4: "4th_order_epoch",
              5: "5th_order_sub_epoch",
              6: "6th_order_sub_stage",
            }}
            onSelected={selected => {
              updateChange("custom.chronostratigraphy_top_bedrock", selected.id, false);
            }}
            schema="custom.chronostratigraphy_top_bedrock"
            selected={borehole.data.custom.chronostratigraphy_top_bedrock}
            title={<TranslationText id="chronostratigraphy_top_bedrock" />}
            isEditable={isEditable}
          />
        </Form.Field>
      </Form>
    </Segment>
  );
};

export default BoreholeDetailSegment;
