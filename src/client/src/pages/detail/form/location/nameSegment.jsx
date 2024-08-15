import { Form, Input, Segment } from "semantic-ui-react";
import { useTranslation } from "react-i18next";

const NameSegment = props => {
  const { size, borehole, updateChange, user } = props;
  const { t } = useTranslation();

  const isEditable =
    borehole?.data.role === "EDIT" && borehole?.data.lock !== null && borehole?.data.lock?.id === user?.data.id;

  return (
    <Segment>
      <Form autoComplete="off" error size={size}>
        <Form.Group widths="equal">
          <Form.Field error={borehole.data.extended.original_name === ""} required>
            <label>{t("original_name")}</label>
            <Input
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              onChange={e => {
                updateChange("extended.original_name", e.target.value);
              }}
              spellCheck="false"
              value={borehole.data.extended.original_name ?? ""}
              readOnly={!isEditable}
            />
          </Form.Field>
          <Form.Field>
            <label>{t("project_name")}</label>
            <Input
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              onChange={e => {
                updateChange("custom.project_name", e.target.value);
              }}
              spellCheck="false"
              value={borehole.data.custom.project_name ?? ""}
              readOnly={!isEditable}
            />
          </Form.Field>
        </Form.Group>
        <Form.Group widths="equal">
          <Form.Field>
            <label>{t("alternate_name")}</label>
            <Input
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              onChange={e => {
                updateChange("custom.alternate_name", e.target.value);
              }}
              spellCheck="false"
              value={borehole.data.custom.alternate_name ?? ""}
              readOnly={!isEditable}
            />
          </Form.Field>
        </Form.Group>
      </Form>
    </Segment>
  );
};

export default NameSegment;
