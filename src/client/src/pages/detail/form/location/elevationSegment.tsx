import React, { FC } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Card } from "@mui/material";
import { CardContent } from "@mui/material/";
import { Borehole, User } from "../../../../api-lib/ReduxStateInterfaces.ts";
import { useDomains } from "../../../../api/fetchApiV2";
import { FormContainer, FormInput, FormValueType } from "../../../../components/form/form.ts";
import { FormDomainSelect } from "../../../../components/form/formDomainSelect.tsx";
import { Codelist } from "../../../../components/legacyComponents/domain/domainInterface.ts";
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
  const { data: domains } = useDomains();

  const formMethods = useForm({
    mode: "all",
  });
  // --- Derived states ---
  const isEditable: boolean =
    borehole?.data.role === "EDIT" && borehole?.data.lock !== null && borehole?.data.lock?.id === user?.data.id;

  return (
    <FormSegmentBox>
      <FormProvider {...formMethods}>
        <Card>
          <CardContent sx={{ pt: 4, px: 3 }}>
            <FormContainer>
              <FormContainer direction="row">
                <FormInput
                  fieldName={"elevation_z"}
                  label="elevation_z"
                  value={borehole.data.elevation_z ?? ""}
                  type={FormValueType.Text}
                  readonly={!isEditable}
                  withThousandSeparator={true}
                  onUpdate={e => updateNumber("elevation_z", e === "" ? null : parseFloatWithThousandsSeparator(e))}
                />
                <FormDomainSelect
                  fieldName={"elevation_precision"}
                  label={"elevation_precision"}
                  schemaName={"elevation_precision"}
                  readonly={!isEditable}
                  selected={borehole.data.elevation_precision}
                  onUpdate={e => {
                    updateChange("elevation_precision", e ?? null, false);
                  }}
                />
              </FormContainer>
              <FormContainer direction="row">
                <FormInput
                  fieldName={"reference_elevation"}
                  label="reference_elevation"
                  value={borehole.data.reference_elevation ?? ""}
                  type={FormValueType.Text}
                  readonly={!isEditable}
                  withThousandSeparator={true}
                  onUpdate={e =>
                    updateNumber("reference_elevation", e === "" ? null : parseFloatWithThousandsSeparator(e))
                  }
                />
                <FormDomainSelect
                  fieldName={"qt_reference_elevation"}
                  label={"reference_elevation_qt"}
                  readonly={!isEditable}
                  schemaName={"elevation_precision"}
                  selected={borehole.data.qt_reference_elevation}
                  onUpdate={e => {
                    updateChange("qt_reference_elevation", e ?? null, false);
                  }}
                />
              </FormContainer>
              <FormContainer direction="row">
                <FormDomainSelect
                  fieldName={"reference_elevation_type"}
                  label={"reference_elevation_type"}
                  readonly={!isEditable}
                  schemaName={"reference_elevation_type"}
                  selected={borehole.data.reference_elevation_type}
                  onUpdate={e => {
                    updateChange("reference_elevation_type", e ?? null, false);
                  }}
                />
                <FormInput
                  readonly={true}
                  fieldName={`height_reference_system`}
                  label="height_reference_system"
                  value={domains?.find((d: Codelist) => d.id === borehole.data.height_reference_system)?.code}
                  type={FormValueType.Text}
                />
              </FormContainer>
            </FormContainer>
          </CardContent>
        </Card>
      </FormProvider>
    </FormSegmentBox>
  );
};

export default ElevationSegment;
