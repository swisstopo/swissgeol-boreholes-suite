import { useTranslation } from "react-i18next";
import { Form, Segment, TextArea } from "semantic-ui-react";
import DomainDropdown from "../../../../components/legacyComponents/domain/dropdown/domainDropdown.jsx";
import { capitalizeFirstLetter } from "../../../../utils";
import { Temp } from "./boreholePanelInterfaces.ts";

const BoreholeGeneralSegment = ({ borehole, updateChange, isEditable }: Temp) => {
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
              <Form.Field error={borehole.typeId === null} required>
                <label>{t("borehole_type")}</label>
                <DomainDropdown
                  onSelected={(selected: { id: number }) => {
                    updateChange("borehole_type", selected.id, false);
                  }}
                  schema="borehole_type"
                  selected={borehole.typeId}
                  readOnly={!isEditable}
                />
              </Form.Field>
            </Form.Group>
            <Form.Group widths="equal">
              <Form.Field required>
                <label>{t("purpose")}</label>
                <DomainDropdown
                  onSelected={(selected: { id: number }) => {
                    updateChange("extended.purpose", selected.id, false);
                  }}
                  schema="extended.purpose"
                  selected={borehole.purposeId}
                  readOnly={!isEditable}
                />
              </Form.Field>
            </Form.Group>
            <Form.Group widths="equal">
              <Form.Field required>
                <label>{capitalizeFirstLetter(t("boreholestatus"))}</label>
                <DomainDropdown
                  onSelected={(selected: { id: number }) => {
                    updateChange("extended.status", selected.id, false);
                  }}
                  schema="extended.status"
                  selected={borehole.statusId}
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
                value={borehole.remarks}
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
