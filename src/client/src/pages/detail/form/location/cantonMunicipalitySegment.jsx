import { Form, Icon, Input, Segment } from "semantic-ui-react";
import { useTranslation } from "react-i18next";

const CantonMunicipalitySegment = props => {
  const { size, country, canton, municipality, isEditable } = props;
  const { t } = useTranslation();

  return (
    <Segment>
      <Form autoCapitalize="off" autoComplete="off" autoCorrect="off" size={size} spellCheck="false">
        <Form.Group widths="equal">
          <Form.Field>
            <label>
              {t("country")}
              &nbsp;
              <Icon name="map marker" />
            </label>
            <Input data-cy="country" value={country ?? ""} readOnly={!isEditable} />
          </Form.Field>
          <Form.Field>
            <label>
              {t("canton")}
              &nbsp;
              <Icon name="map marker" />
            </label>
            <Input data-cy="canton" value={canton ?? ""} readOnly={!isEditable} />
          </Form.Field>
          <Form.Field>
            <label>
              {t("city")}
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
