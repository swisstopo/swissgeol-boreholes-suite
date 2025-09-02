import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Box } from "@mui/material/";
import { styled } from "@mui/material/styles";
import { theme } from "../../../../AppTheme.ts";
import { FormContainer, FormSelect } from "../../../../components/form/form.ts";
import { useUserWorkgroups } from "../../UserWorkgroupsContext.tsx";
import { WorkgroupSelectProps } from "./actionsInterfaces.ts";

const WorkgroupBox = styled(Box)({
  paddingTop: theme.spacing(2),
});

const WorkgroupSelect = ({ sx }: WorkgroupSelectProps) => {
  const { t } = useTranslation();
  const formMethods = useForm();
  const { enabledWorkgroups, currentWorkgroupId, setCurrentWorkgroupId } = useUserWorkgroups();

  if (!enabledWorkgroups || enabledWorkgroups.length === 0) {
    return <WorkgroupBox>{t("disabled")}</WorkgroupBox>;
  }

  if (enabledWorkgroups.length === 1) {
    return <WorkgroupBox>{enabledWorkgroups[0].workgroup}</WorkgroupBox>;
  }

  const options = enabledWorkgroups.map(wg => ({
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
            selected={currentWorkgroupId}
            readonly={false}
            values={options}
            onUpdate={value => setCurrentWorkgroupId((value as number) ?? null)}
          />
        </FormContainer>
      </FormProvider>
    </WorkgroupBox>
  );
};
export default WorkgroupSelect;
