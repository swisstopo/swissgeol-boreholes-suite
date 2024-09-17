import DomainDropdown from "../../../../components/legacyComponents/domain/dropdown/domainDropdown.jsx";
import { Form, Segment, TextArea } from "semantic-ui-react";
import { useTranslation } from "react-i18next";
import { capitalizeFirstLetter } from "../../../../utils";

const BoreholeGeneralSegment = props => {
  const { borehole, updateChange, isEditable } = props;
  const { t } = useTranslation();

  return (
    <Segment>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
        }}>
        <div
          style={{
            flex: "1 1 0",
          }}>
          <Form autoComplete="off" error>
            <Form.Group widths="equal">
              {/* drilling type in Borehole */}
              <Form.Field error={borehole.data.borehole_type === null} required>
                <label>{t("borehole_type")}</label>
                <DomainDropdown
                  onSelected={selected => {
                    updateChange("borehole_type", selected.id, false);
                  }}
                  schema="borehole_type"
                  selected={borehole.data.borehole_type}
                  readOnly={!isEditable}
                />
              </Form.Field>
            </Form.Group>
            <Form.Group widths="equal">
              <Form.Field required>
                <label>{t("purpose")}</label>
                <DomainDropdown
                  onSelected={selected => {
                    updateChange("extended.purpose", selected.id, false);
                  }}
                  schema="extended.purpose"
                  selected={borehole.data.extended.purpose}
                  readOnly={!isEditable}
                />
              </Form.Field>
            </Form.Group>
            <Form.Group widths="equal">
              <Form.Field required>
                <label>{capitalizeFirstLetter(t("boreholestatus"))}</label>
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
          </Form>
        </div>
        <div
          style={{
            flex: "1 1 0",
            paddingLeft: "1em",
          }}>
          <Form autoComplete="off" error>
            <Form.Field>
              {t("remarks")}
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
