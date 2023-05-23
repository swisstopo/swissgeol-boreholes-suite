import React from "react";
import TranslationText from "../../translationText";
import { Form, Input, Segment } from "semantic-ui-react";

const NameSegment = props => {
  const { size, borehole, updateChange } = props;
  return (
    <Segment>
      <Form autoComplete="off" error size={size}>
        <Form.Group widths="equal">
          <Form.Field
            error={borehole.data.extended.original_name === ""}
            required>
            <label>
              <TranslationText id="original_name" />
            </label>
            <Input
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              onChange={e => {
                updateChange("extended.original_name", e.target.value);
              }}
              spellCheck="false"
              value={borehole.data.extended.original_name ?? ""}
            />
          </Form.Field>
          <Form.Field>
            <label>
              <TranslationText id="project_name" />
            </label>
            <Input
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              onChange={e => {
                updateChange("custom.project_name", e.target.value);
              }}
              spellCheck="false"
              value={borehole.data.custom.project_name ?? ""}
            />
          </Form.Field>
        </Form.Group>
        <Form.Group widths="equal">
          <Form.Field>
            <label>
              <TranslationText id="alternate_name" />
            </label>
            <Input
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              onChange={e => {
                updateChange("custom.alternate_name", e.target.value);
              }}
              spellCheck="false"
              value={borehole.data.custom.alternate_name ?? ""}
            />
          </Form.Field>
        </Form.Group>
      </Form>
    </Segment>
  );
};

export default NameSegment;
