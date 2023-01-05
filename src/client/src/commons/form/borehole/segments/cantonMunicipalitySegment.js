import React from "react";
import TranslationText from "../../translationText";

import { Form, Segment, Input, Icon } from "semantic-ui-react";

const CantonMunicipalitySegment = props => {
  const { size, country, canton, municipality } = props;

  return (
    <Segment>
      <Form
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        size={size}
        spellCheck="false">
        <Form.Group widths="equal">
          <Form.Field>
            <label>
              <TranslationText id="country" />
              &nbsp;
              <Icon name="map marker" />
            </label>
            <Input value={country ?? ""} />
          </Form.Field>
          <Form.Field>
            <label>
              <TranslationText id="canton" />
              &nbsp;
              <Icon name="map marker" />
            </label>
            <Input value={canton ?? ""} />
          </Form.Field>
          <Form.Field>
            <label>
              <TranslationText id="city" />
              &nbsp;
              <Icon name="map marker" />
            </label>
            <Input value={municipality ?? ""} />
          </Form.Field>
        </Form.Group>
      </Form>
    </Segment>
  );
};

export default CantonMunicipalitySegment;
