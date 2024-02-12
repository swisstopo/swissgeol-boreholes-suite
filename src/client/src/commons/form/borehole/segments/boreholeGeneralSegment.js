import React from "react";
import _ from "lodash";
import moment from "moment";

import DomainDropdown from "../../domain/dropdown/domainDropdown";
import DateField from "../../dateField";
import TranslationText from "../../translationText";
import { NumericFormat } from "react-number-format";
import { Form, Input, Segment, TextArea } from "semantic-ui-react";
import { parseIfString } from "../../formUtils";

const BoreholeGeneralSegment = props => {
  const { size, borehole, updateChange, updateNumber, isEditable } = props;
  return (
    <Segment>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
        }}>
        <div
          style={{
            flex: "1 1 100%",
            minWidth: "600px",
          }}>
          <Form autoComplete="off" error size={size}>
            <Form.Group widths="equal">
              {/* drilling type in Borehole */}
              <Form.Field error={borehole.data.kind === null} required>
                <label>
                  <TranslationText id="kind" />
                </label>
                <DomainDropdown
                  onSelected={selected => {
                    updateChange("kind", selected.id, false);
                  }}
                  schema="kind"
                  selected={borehole.data.kind}
                  readOnly={!isEditable}
                />
              </Form.Field>
              <Form.Field required>
                <label>
                  <TranslationText id="drilling_method" />
                </label>
                <DomainDropdown
                  onSelected={selected => {
                    updateChange("drilling_method", selected.id, false);
                  }}
                  schema="drilling_method"
                  selected={borehole.data.drilling_method}
                  readOnly={!isEditable}
                />
              </Form.Field>
              <Form.Field required>
                <label>
                  <TranslationText id="purpose" />
                </label>
                <DomainDropdown
                  onSelected={selected => {
                    updateChange("drilling_purpose", selected.id, false);
                  }}
                  schema="drilling_purpose"
                  selected={borehole.data.drilling_purpose}
                  readOnly={!isEditable}
                />
              </Form.Field>
            </Form.Group>
            <Form.Group widths="equal">
              <div
                style={{
                  width: "34%",
                  paddingRight: "2%",
                  paddingLeft: "1%",
                }}>
                <Form.Field required>
                  <label>
                    <TranslationText id="cuttings" />
                  </label>
                  <DomainDropdown
                    onSelected={selected => {
                      updateChange(
                        "borehole_cuttings_core",
                        selected.id,
                        false,
                      );
                    }}
                    schema="borehole_cuttings_core"
                    selected={borehole.data.borehole_cuttings_core}
                    readOnly={!isEditable}
                  />
                </Form.Field>
              </div>
              <div style={{ width: "33%", paddingRight: "1%" }}>
                <Form.Field required>
                  <label>
                    <TranslationText id="spud_date" />
                  </label>
                  <DateField
                    date={borehole.data.spud_date}
                    onChange={selected => {
                      updateChange("spud_date", selected, false);
                    }}
                    isEditable={isEditable}
                  />
                </Form.Field>
              </div>
              <div style={{ width: "33%", paddingLeft: "1%" }}>
                <Form.Field
                  error={
                    _.isString(borehole.data.drilling_date) &&
                    borehole.data.drilling_date !== "" &&
                    !moment(borehole.data.drilling_date).isValid()
                  }
                  required>
                  <label>
                    <TranslationText id="drilling_end_date" />
                  </label>
                  <DateField
                    date={borehole.data.drilling_date}
                    onChange={selected => {
                      updateChange("drilling_date", selected, false);
                    }}
                    isEditable={isEditable}
                  />
                </Form.Field>
              </div>
            </Form.Group>
            <Form.Group widths="equal">
              {/* strange bug in Edge fixed with placing
            a hidden input */}
              <Form.Field
                style={{
                  display: "none",
                }}>
                <label>
                  <TranslationText id="drill_diameter" />
                </label>
                <Input
                  spellCheck="false"
                  type="number"
                  value={
                    _.isNil(borehole.data.custom.drill_diameter)
                      ? ""
                      : borehole.data.custom.drill_diameter
                  }
                  readOnly={!isEditable}
                />
              </Form.Field>
              <Form.Field required>
                <label>
                  <TranslationText id="drill_diameter" />
                </label>
                <NumericFormat
                  onChange={e => {
                    updateNumber(
                      "custom.drill_diameter",
                      e.target.value === ""
                        ? null
                        : parseIfString(e.target.value),
                    );
                  }}
                  spellCheck="false"
                  value={(() => {
                    const r = _.isNil(borehole.data.custom.drill_diameter)
                      ? ""
                      : borehole.data.custom.drill_diameter;
                    return r;
                  })()}
                  thousandSeparator="'"
                  readOnly={!isEditable}
                />
              </Form.Field>
              <Form.Field required>
                <label>
                  <TranslationText firstUpperCase id="boreholestatus" />
                </label>
                <DomainDropdown
                  onSelected={selected => {
                    updateChange("borehole_status", selected.id, false);
                  }}
                  schema="borehole_status"
                  selected={borehole.data.borehole_status}
                  readOnly={!isEditable}
                />
              </Form.Field>
            </Form.Group>
            <Form.Group widths="equal">
              <Form.Field required>
                <label>
                  <TranslationText firstUpperCase id="inclination" />
                </label>
                <Input
                  autoCapitalize="off"
                  autoComplete="off"
                  autoCorrect="off"
                  onChange={e => {
                    updateNumber(
                      "inclination",
                      e.target.value === "" ? null : e.target.value,
                    );
                  }}
                  spellCheck="false"
                  value={
                    _.isNil(borehole.data.inclination)
                      ? ""
                      : borehole.data.inclination
                  }
                  readOnly={!isEditable}
                />
              </Form.Field>
              <Form.Field required>
                <label>
                  <TranslationText firstUpperCase id="inclination_direction" />
                </label>
                <Input
                  autoCapitalize="off"
                  autoComplete="off"
                  autoCorrect="off"
                  onChange={e => {
                    updateNumber(
                      "inclination_direction",
                      e.target.value === "" ? null : e.target.value,
                    );
                  }}
                  spellCheck="false"
                  value={
                    _.isNil(borehole.data.inclination_direction)
                      ? ""
                      : borehole.data.inclination_direction
                  }
                  readOnly={!isEditable}
                />
              </Form.Field>
              <Form.Field required>
                <label>
                  <TranslationText firstUpperCase id="qt_bore_inc_dir" />
                </label>
                <DomainDropdown
                  onSelected={selected => {
                    updateChange("inclination_precision", selected.id, false);
                  }}
                  schema="inclination_precision"
                  selected={borehole.data.inclination_precision}
                  readOnly={!isEditable}
                />
              </Form.Field>
            </Form.Group>
          </Form>
        </div>
        <div
          style={{
            flex: "1 1 100%",
            minWidth: "200px",
            paddingLeft: "1em",
          }}>
          <Form autoComplete="off" error size={size}>
            <Form.Field>
              <TranslationText id="remarks" />
              <TextArea
                onChange={(e, data) => {
                  updateChange("custom.remarks", e.target.value);
                }}
                rows={14}
                value={borehole.data.custom.remarks}
                readOnly={!isEditable}
              />
            </Form.Field>
          </Form>
        </div>
      </div>
    </Segment>
  );
};

export default BoreholeGeneralSegment;
