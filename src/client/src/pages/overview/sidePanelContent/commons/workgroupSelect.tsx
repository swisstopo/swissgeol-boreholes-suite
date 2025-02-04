import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Box } from "@mui/material/";
import { styled } from "@mui/material/styles";
import { theme } from "../../../../AppTheme.ts";
import { FormContainer, FormSelect } from "../../../../components/form/form.ts";
import { WorkgroupSelectProps } from "./actionsInterfaces.ts";

const WorkgroupBox = styled(Box)({
  paddingTop: theme.spacing(2),
});

const WorkgroupSelect = ({ workgroupId, enabledWorkgroups, setWorkgroupId, sx }: WorkgroupSelectProps) => {
  const { t } = useTranslation();
  const formMethods = useForm();

  if (!enabledWorkgroups || enabledWorkgroups.length === 0) {
    return <WorkgroupBox>{t("disabled")}</WorkgroupBox>;
  }

  if (enabledWorkgroups.length === 1) {
    return <WorkgroupBox>{enabledWorkgroups[0].workgroup}</WorkgroupBox>;
  }

  const options = enabledWorkgroups
    .filter(w => w.roles.includes("EDIT"))
    .map(wg => ({
      key: wg.id,
      name: wg.workgroup,
    }));

  return (
    <WorkgroupBox sx={sx}>
      <FormProvider {...formMethods}>
        <FormContainer>
          <FormSelect
            fieldName={"workgroup"}
            label={"workgroup"}
            selected={workgroupId}
            readonly={false}
            values={options}
            onUpdate={value => setWorkgroupId((value as number) ?? null)}
          />
        </FormContainer>
      </FormProvider>
    </WorkgroupBox>
  );
};
export default WorkgroupSelect;
