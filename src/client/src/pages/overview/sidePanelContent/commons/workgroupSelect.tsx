import { useEffect } from "react";
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
  const formMethods = useForm({
    defaultValues: {
      workgroup: null,
    },
  });
  const { editableWorkgroups, currentWorkgroupId, setCurrentWorkgroupId } = useUserWorkgroups();

  useEffect(() => {
    return () => {
      setCurrentWorkgroupId(null);
    };
  }, [formMethods, setCurrentWorkgroupId]);

  if (!editableWorkgroups || editableWorkgroups.length === 0) {
    return <WorkgroupBox>{t("disabled")}</WorkgroupBox>;
  }

  if (editableWorkgroups.length === 1) {
    setCurrentWorkgroupId(editableWorkgroups[0].id);
    return <WorkgroupBox>{editableWorkgroups[0].name}</WorkgroupBox>;
  }

  const options = editableWorkgroups.map(wg => ({
    key: wg.id,
    name: wg.name,
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
