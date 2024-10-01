import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Card, FormControl, FormControlLabel, RadioGroup } from "@mui/material";
import { Form } from "semantic-ui-react";
import { Borehole, User } from "../../../../api-lib/ReduxStateInterfaces.ts";
import { FormContainer, FormInput, FormSelect, FormValueType } from "../../../../components/form/form.ts";
import { FormDomainSelect } from "../../../../components/form/formDomainSelect.tsx";
import TranslationText from "../../../../components/legacyComponents/translationText.jsx";
import { FormSegmentBox } from "../../../../components/styledComponents";
import { DisabledRadio } from "../styledComponents.jsx";

interface RestrictionSegmentProps {
  borehole: Borehole;
  user: User;
}

const RestrictionSegment = ({ borehole, updateChange, user }: RestrictionSegmentProps) => {
  const { t } = useTranslation();
  const formMethods = useForm({
    mode: "all",
  });

  const restriction = formMethods.watch("restriction");

  const isEditable =
    borehole?.data.role === "EDIT" && borehole?.data.lock !== null && borehole?.data.lock?.id === user?.data.id;

  return (
    <FormProvider {...formMethods}>
      <Card>
        <FormSegmentBox>
          <FormContainer direction="row">
            <FormDomainSelect
              fieldName={"restriction"}
              label={"restriction"}
              schemaName={"restriction"}
              readonly={!isEditable}
              selected={borehole.data.restriction}
              onUpdate={e => {
                if (e !== 20111003) {
                  formMethods.setValue("restriction_until", null);
                }
                updateChange("restriction", e ?? null, false);
              }}
            />

            <FormInput
              fieldName="restriction_until"
              label="restriction_until"
              disabled={restriction !== 20111003}
              readonly={!isEditable || restriction !== 20111003}
              value={borehole.data.restriction_until}
              type={FormValueType.Date}
              onUpdate={selected => {
                updateChange("restriction_until", selected, false);
              }}
            />

            <FormSelect
              required
              fieldName={"national_interest"}
              label="national_interest"
              selected={borehole.data.national_interest}
              values={[
                { key: 1, name: t("yes") },
                { key: 0, name: t("no") },
                { key: 2, name: t("np") },
              ]}
              onUpdate={e => {
                const value = e === 1 ? true : e === 0 ? false : null;
                updateChange("national_interest", value, false);
              }}
            />

            <Form.Field required>
              <label>{t("national_interest")}</label>
              <FormControl className="radio-group">
                <RadioGroup
                  row
                  value={
                    borehole.data.national_interest === true
                      ? "TRUE"
                      : borehole.data.national_interest === false
                        ? "FALSE"
                        : "NULL"
                  }
                  onChange={e => {
                    const value = e.target.value === "TRUE" ? true : e.target.value === "FALSE" ? false : null;
                    updateChange("national_interest", value, false);
                  }}>
                  <FormControlLabel
                    value="TRUE"
                    control={<DisabledRadio isEditable={!isEditable} />}
                    label={<TranslationText id={"yes"} />}
                  />
                  <FormControlLabel
                    value="FALSE"
                    control={<DisabledRadio isEditable={!isEditable} />}
                    label={<TranslationText id={"no"} />}
                  />
                  <FormControlLabel
                    value="NULL"
                    control={<DisabledRadio isEditable={!isEditable} />}
                    label={<TranslationText id={"np"} />}
                  />
                </RadioGroup>
              </FormControl>
            </Form.Field>
          </FormContainer>
        </FormSegmentBox>
      </Card>
    </FormProvider>
  );
};

export default RestrictionSegment;
