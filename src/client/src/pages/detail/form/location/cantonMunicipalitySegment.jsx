import { useTranslation } from "react-i18next";
import { Form, Icon, Input } from "semantic-ui-react";
import { FormSegmentBox } from "../../../../components/styledComponents";

const CantonMunicipalitySegment = props => {
  const { country, canton, municipality, isEditable } = props;
  const { t } = useTranslation();

  return (
    <FormSegmentBox>
      <Form autoCapitalize="off" autoComplete="off" autoCorrect="off" spellCheck="false">
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
    </FormSegmentBox>
  );
};

export default CantonMunicipalitySegment;
