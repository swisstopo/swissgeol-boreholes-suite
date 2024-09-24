import { FC } from "react";
import { useTranslation } from "react-i18next";
import { NumericFormat } from "react-number-format";
import { Form } from "semantic-ui-react";

import { Borehole, User } from "../../../../api-lib/ReduxStateInterfaces.ts";
import DomainText from "../../../../components/legacyComponents/domain/domainText.jsx";
import DomainDropdown from "../../../../components/legacyComponents/domain/dropdown/domainDropdown.jsx";
import { parseFloatWithThousandsSeparator } from "../../../../components/legacyComponents/formUtils.js";
import { FormSegmentBox } from "../../../../components/styledComponents.ts";

interface ElevationSegmentProps {
  borehole: Borehole;
  user: User;
  updateChange: (
    fieldName: keyof Borehole["data"] | "location",
    value: string | number | null | (number | string | null)[],
    to?: boolean,
  ) => void;
  updateNumber: (fieldName: keyof Borehole["data"], value: number | null) => void;
}

const ElevationSegment: FC<ElevationSegmentProps> = ({ borehole, user, updateChange, updateNumber }) => {
  const { t } = useTranslation();

  // --- Derived states ---
  const isEditable: boolean =
    borehole?.data.role === "EDIT" && borehole?.data.lock !== null && borehole?.data.lock?.id === user?.data.id;

  return (
    <FormSegmentBox>
      <Form>
        <Form.Group widths="equal">
          <Form.Field error={borehole.data.elevation_z == null} required>
            <label>{t("elevation_z")}</label>
            <NumericFormat
              type="text"
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              onChange={e => {
                updateNumber(
                  "elevation_z",
                  e.target.value === "" ? null : parseFloatWithThousandsSeparator(e.target.value),
                );
              }}
              fixedDecimalScale
              spellCheck="false"
              value={borehole.data.elevation_z ?? ""}
              thousandSeparator="'"
              readOnly={!isEditable}
            />
          </Form.Field>
          <Form.Field required>
            <label>{t("elevation_precision")}</label>
            <DomainDropdown
              onSelected={(selected: { id: string }) => {
                updateChange("elevation_precision", selected.id, false);
              }}
              schema="elevation_precision"
              selected={borehole.data.elevation_precision}
              readOnly={!isEditable}
            />
          </Form.Field>
        </Form.Group>
        <Form.Group widths="equal">
          <Form.Field error={borehole.data.reference_elevation == null} required>
            <label>{t("reference_elevation")}</label>
            <NumericFormat
              autoCapitalize="off"
              type="text"
              autoComplete="off"
              autoCorrect="off"
              onChange={e => {
                updateNumber(
                  "reference_elevation",
                  e.target.value === "" ? null : parseFloatWithThousandsSeparator(e.target.value),
                );
              }}
              spellCheck="false"
              value={borehole.data.reference_elevation ?? ""}
              thousandSeparator="'"
              readOnly={!isEditable}
            />
          </Form.Field>
          <Form.Field required>
            <label>{t("reference_elevation_qt")}</label>
            <DomainDropdown
              onSelected={(selected: { id: string | number }) => {
                updateChange("qt_reference_elevation", selected.id, false);
              }}
              schema="elevation_precision"
              selected={borehole.data.qt_reference_elevation}
              readOnly={!isEditable}
            />
          </Form.Field>
        </Form.Group>
        <Form.Group widths="equal">
          <Form.Field error={borehole.data.reference_elevation_type === null} required>
            <label>{t("reference_elevation_type")}</label>
            <DomainDropdown
              onSelected={(selected: { id: string }) => {
                updateChange("reference_elevation_type", selected.id, false);
              }}
              schema="reference_elevation_type"
              selected={borehole.data.reference_elevation_type}
              readOnly={!isEditable}
            />
          </Form.Field>
          <Form.Field required>
            <label>{t("height_reference_system")}</label>
            <div
              style={{
                height: "36px",
                display: "flex",
                alignItems: "center",
              }}>
              <div>
                <DomainText id={borehole.data.height_reference_system} schema="height_reference_system" />
              </div>
            </div>
          </Form.Field>
        </Form.Group>
      </Form>
    </FormSegmentBox>
  );
};

export default ElevationSegment;
