import React from "react";
import _ from "lodash";

import DomainDropdown from "../../domain/dropdown/domainDropdown";
import DomainTree from "../../domain/tree/domainTree";
import TranslationText from "../../translationText";
import { Form, Input, Segment } from "semantic-ui-react";

const BoreholeDetailSegment = props => {
  const { size, mentions, borehole, updateChange, updateNumber, debug, t } =
    props;
  return (
    <Segment>
      <Form autoComplete="off" error size={size}>
        <Form.Group widths="equal">
          <Form.Field error={mentions.indexOf("total_depth") >= 0} required>
            <label>
              <TranslationText id="totaldepth" />
            </label>
            <Input
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              onChange={e => {
                updateNumber(
                  "total_depth",
                  e.target.value === "" ? null : e.target.value,
                );
              }}
              spellCheck="false"
              value={
                _.isNil(borehole.data.total_depth)
                  ? ""
                  : borehole.data.total_depth
              }
            />
          </Form.Field>
          <Form.Field error={mentions.indexOf("qt_depth") >= 0} required>
            <label>
              <TranslationText id="qt_depth" />
            </label>
            <DomainDropdown
              onSelected={selected => {
                updateChange("custom.qt_depth", selected.id, false);
              }}
              schema="custom.qt_depth"
              selected={borehole.data.custom.qt_depth}
            />
          </Form.Field>
        </Form.Group>
        <Form.Group widths="equal">
          <Form.Field
            // error={borehole.extended.top_bedrock_tvd === true}
            required>
            <label>
              <TranslationText id="total_depth_tvd" />
            </label>
            <Input
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              onChange={e => {
                updateNumber(
                  "total_depth_tvd",
                  e.target.value === "" ? null : e.target.value,
                );
              }}
              spellCheck="false"
              value={
                _.isNil(borehole.data.total_depth_tvd)
                  ? ""
                  : borehole.data.total_depth_tvd
              }
            />
          </Form.Field>

          <Form.Field
            // error={mentions.indexOf('qt_top_bedrock') >= 0}
            required>
            <label>
              <TranslationText id="total_depth_tvd_qt" />
            </label>
            <DomainDropdown
              onSelected={selected => {
                updateChange("qt_total_depth_tvd", selected.id, false);
              }}
              schema="custom.qt_top_bedrock"
              selected={borehole.data.qt_total_depth_tvd}
            />
          </Form.Field>
        </Form.Group>
        <Form.Group widths="equal">
          <Form.Field
            error={
              mentions.indexOf("top_bedrock") >= 0
              // || _.isNil(borehole.extended.top_bedrock)
            }
            required>
            <label>
              <TranslationText id="top_bedrock" />
            </label>
            <Input
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              onChange={e => {
                updateNumber(
                  "extended.top_bedrock",
                  e.target.value === "" ? null : e.target.value,
                );
              }}
              spellCheck="false"
              value={
                _.isNil(borehole.data.extended.top_bedrock)
                  ? ""
                  : borehole.data.extended.top_bedrock
              }
            />
          </Form.Field>
          <Form.Field error={mentions.indexOf("qt_top_bedrock") >= 0} required>
            <label>
              <TranslationText id="qt_top_bedrock" />
            </label>
            <DomainDropdown
              onSelected={selected => {
                updateChange("custom.qt_top_bedrock", selected.id, false);
              }}
              schema="custom.qt_top_bedrock"
              selected={borehole.data.custom.qt_top_bedrock}
            />
          </Form.Field>
        </Form.Group>
        <Form.Group widths="equal">
          <Form.Field
            // error={borehole.extended.top_bedrock_tvd === true}
            required>
            <label>
              <TranslationText id="top_bedrock_tvd" />
            </label>
            <Input
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              onChange={e => {
                updateNumber(
                  "extended.top_bedrock_tvd",
                  e.target.value === "" ? null : e.target.value,
                );
              }}
              spellCheck="false"
              value={
                _.isNil(borehole.data.extended.top_bedrock_tvd)
                  ? ""
                  : borehole.data.extended.top_bedrock_tvd
              }
            />
          </Form.Field>

          <Form.Field required>
            <label>
              <TranslationText id="top_bedrock_tvd_qt" />
            </label>
            <DomainDropdown
              onSelected={selected => {
                updateChange("custom.qt_top_bedrock_tvd", selected.id, false);
              }}
              schema="custom.qt_top_bedrock"
              selected={borehole.data.custom.qt_top_bedrock_tvd}
            />
          </Form.Field>
        </Form.Group>
        <Form.Field error={mentions.indexOf("groundwater") >= 0} required>
          <label>
            <TranslationText id="groundwater" />
          </label>
          <Form.Group inline>
            <Form.Radio
              checked={borehole.data.extended.groundwater === true}
              label={t("common:yes")}
              onChange={(e, d) => {
                updateChange("extended.groundwater", true, false);
              }}
            />
            <Form.Radio
              checked={borehole.data.extended.groundwater === false}
              label={t("common:no")}
              onChange={(e, d) => {
                updateChange("extended.groundwater", false, false);
              }}
            />
            <Form.Radio
              checked={borehole.data.extended.groundwater === null}
              label={t("common:np")}
              onChange={(e, d) => {
                updateChange("extended.groundwater", null, false);
              }}
            />
            {debug === true ? (
              <div>
                <div
                  style={{
                    color: "red",
                  }}>
                  trans=yes
                </div>
                <div
                  style={{
                    color: "red",
                  }}>
                  trans=no
                </div>
                <div
                  style={{
                    color: "red",
                  }}>
                  trans=np
                </div>
              </div>
            ) : null}
          </Form.Group>
        </Form.Field>
        <Form.Field
          error={mentions.indexOf("lithology_top_bedrock") >= 0}
          required>
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
          />
        </Form.Field>
        <Form.Field
          error={mentions.indexOf("lithostratigraphy_top_bedrock") >= 0}
          required>
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
              updateChange(
                "custom.lithostratigraphy_top_bedrock",
                selected.id,
                false,
              );
            }}
            schema="custom.lithostratigraphy_top_bedrock"
            selected={borehole.data.custom.lithostratigraphy_top_bedrock}
            title={<TranslationText id="lithostratigraphy_top_bedrock" />}
          />
        </Form.Field>
        <Form.Field
          error={mentions.indexOf("chronostratigraphy_top_bedrock") >= 0}
          required>
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
              updateChange(
                "custom.chronostratigraphy_top_bedrock",
                selected.id,
                false,
              );
            }}
            schema="custom.chronostratigraphy_top_bedrock"
            selected={borehole.data.custom.chronostratigraphy_top_bedrock}
            title={<TranslationText id="chronostratigraphy_top_bedrock" />}
          />
        </Form.Field>
      </Form>
    </Segment>
  );
};

export default BoreholeDetailSegment;
