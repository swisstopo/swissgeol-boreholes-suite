import TranslationText from "../../translationText";

import { Form, Segment, Input, Icon } from "semantic-ui-react";

const CantonMunicipalitySegment = props => {
  const { size, country, canton, municipality, isEditable } = props;

  return (
    <Segment>
      <Form autoCapitalize="off" autoComplete="off" autoCorrect="off" size={size} spellCheck="false">
        <Form.Group widths="equal">
          <Form.Field>
            <label>
              <TranslationText id="country" />
              &nbsp;
              <Icon name="map marker" />
            </label>
            <Input data-cy="country" value={country ?? ""} readOnly={!isEditable} />
          </Form.Field>
          <Form.Field>
            <label>
              <TranslationText id="canton" />
              &nbsp;
              <Icon name="map marker" />
            </label>
            <Input data-cy="canton" value={canton ?? ""} readOnly={!isEditable} />
          </Form.Field>
          <Form.Field>
            <label>
              <TranslationText id="city" />
              &nbsp;
              <Icon name="map marker" />
            </label>
            <Input data-cy="municipality" value={municipality ?? ""} readOnly={!isEditable} />
          </Form.Field>
        </Form.Group>
      </Form>
    </Segment>
  );
};

export default CantonMunicipalitySegment;
