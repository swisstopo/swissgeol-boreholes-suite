import _ from "lodash";

import DomainDropdown from "../../domain/dropdown/domainDropdown";
import TranslationText from "../../translationText";
import { Form, Input, Segment, TextArea } from "semantic-ui-react";

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
              <Form.Field error={borehole.data.borehole_type === null} required>
                <label>
                  <TranslationText id="borehole_type" />
                </label>
                <DomainDropdown
                  onSelected={selected => {
                    updateChange("borehole_type", selected.id, false);
                  }}
                  schema="borehole_type"
                  selected={borehole.data.borehole_type}
                  readOnly={!isEditable}
                />
              </Form.Field>
              <Form.Field required>
                <label>
                  <TranslationText id="purpose" />
                </label>
                <DomainDropdown
                  onSelected={selected => {
                    updateChange("extended.purpose", selected.id, false);
                  }}
                  schema="extended.purpose"
                  selected={borehole.data.extended.purpose}
                  readOnly={!isEditable}
                />
              </Form.Field>
              <Form.Field required>
                <label>
                  <TranslationText firstUpperCase id="boreholestatus" />
                </label>
                <DomainDropdown
                  onSelected={selected => {
                    updateChange("extended.status", selected.id, false);
                  }}
                  schema="extended.status"
                  selected={borehole.data.extended.status}
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
                    updateNumber("inclination", e.target.value === "" ? null : e.target.value);
                  }}
                  spellCheck="false"
                  value={_.isNil(borehole.data.inclination) ? "" : borehole.data.inclination}
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
                    updateNumber("inclination_direction", e.target.value === "" ? null : e.target.value);
                  }}
                  spellCheck="false"
                  value={_.isNil(borehole.data.inclination_direction) ? "" : borehole.data.inclination_direction}
                  readOnly={!isEditable}
                />
              </Form.Field>
              <Form.Field required>
                <label>
                  <TranslationText firstUpperCase id="qt_bore_inc_dir" />
                </label>
                <DomainDropdown
                  onSelected={selected => {
                    updateChange("custom.qt_bore_inc_dir", selected.id, false);
                  }}
                  schema="custom.qt_bore_inc_dir"
                  selected={borehole.data.custom.qt_bore_inc_dir}
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
                onChange={e => {
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
