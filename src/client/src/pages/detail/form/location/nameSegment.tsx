import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Form, Input } from "semantic-ui-react";
import { Borehole, User } from "../../../../api-lib/ReduxStateInterfaces.ts";
import { FormSegmentBox } from "../../../../components/styledComponents";

interface NameSegmentProps {
  borehole: Borehole;
  updateChange: (key: string, value: string) => void;
  user: User;
}

const NameSegment = ({ borehole, updateChange, user }: NameSegmentProps) => {
  const [alternateName, setAlternateName] = useState("");
  const { t } = useTranslation();

  const isEditable =
    borehole?.data.role === "EDIT" && borehole?.data.lock !== null && borehole?.data.lock?.id === user?.data.id;

  useEffect(() => {
    setAlternateName(borehole.data.custom.alternate_name || borehole.data.extended.original_name);
  }, [borehole.data]);

  return (
    <FormSegmentBox>
      <Form autoComplete="off" error>
        <Form.Group widths="equal">
          <Form.Field error={borehole.data.extended.original_name === ""} required>
            <label>{t("original_name")}</label>
            <Input
              data-cy="original-name"
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              onChange={e => {
                setAlternateName(e.target.value);
                updateChange("extended.original_name", e.target.value);
                updateChange("custom.alternate_name", e.target.value);
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
              data-cy="alternate-name"
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              onChange={e => {
                setAlternateName(e.target.value);
                updateChange("custom.alternate_name", e.target.value);
              }}
              spellCheck="false"
              value={alternateName}
              readOnly={!isEditable}
            />
          </Form.Field>
        </Form.Group>
      </Form>
    </FormSegmentBox>
  );
};

export default NameSegment;
