import React from "react";
import TranslationText from "../../translationText";
import { Form, Input, Segment, Message } from "semantic-ui-react";

const NameSegment = props => {
  const {
    size,
    borehole,
    originalNameCheck,
    originalNameFetch,
    alternateNameCheck,
    alternateNameFetch,
    updateChange,
    check,
  } = props;
  return (
    <Segment>
      <Form autoComplete="off" error size={size}>
        <Form.Group widths="equal">
          <Form.Field
            error={
              borehole.data.extended.original_name === "" ||
              (originalNameCheck === false && originalNameFetch === false)
            }
            required>
            <label>
              <TranslationText id="original_name" />
            </label>
            <Input
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              icon={
                originalNameCheck === true && originalNameFetch === false
                  ? "check"
                  : "delete"
              }
              iconPosition="left"
              loading={originalNameFetch}
              onChange={e => {
                check("extended.original_name", e.target.value);
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
        {originalNameCheck === false && originalNameFetch === false ? (
          <Message
            content={
              <div>
                <TranslationText id="original_name" />
                {", "}
                <TranslationText id="duplicate" />
              </div>
            }
            error
            size={size}
          />
        ) : null}
        <Form.Group widths="equal">
          <Form.Field>
            <label>
              <TranslationText id="alternate_name" />
            </label>
            <Input
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              icon={
                alternateNameCheck === true && alternateNameFetch === false
                  ? "check"
                  : "delete"
              }
              iconPosition="left"
              loading={alternateNameFetch}
              onChange={e => {
                check("custom.alternate_name", e.target.value);
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
