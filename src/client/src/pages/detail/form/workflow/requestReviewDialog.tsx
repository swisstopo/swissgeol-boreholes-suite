import React, { FC } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from "@mui/material";
import { ChevronRight } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Role, RolePriority, User } from "../../../../api/apiInterfaces.ts";
import { useBorehole, useReloadBoreholes } from "../../../../api/borehole.ts";
import { useUsers } from "../../../../api/user.ts";
import { theme } from "../../../../AppTheme.ts";
import { CancelButton } from "../../../../components/buttons/buttons.tsx";
import { FormContainer, FormInput, FormSelect } from "../../../../components/form/form.ts";
import { useRequiredParams } from "../../../../hooks/useRequiredParams.ts";
import { capitalizeFirstLetter } from "../../../../utils.ts";
import { sendWorkflowChangeRequest, WorkflowChangeRequest, workflowQueryKey, WorkflowStatus } from "./workflow.ts";

interface RequestReviewDialogProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}
export const RequestReviewDialog: FC<RequestReviewDialogProps> = ({ open, setOpen }) => {
  const { t } = useTranslation();
  const { data: users } = useUsers();
  const { id } = useRequiredParams<{ id: string }>();
  const formMethods = useForm({ mode: "all" });
  const { data: borehole } = useBorehole(parseInt(id));
  const queryClient = useQueryClient();
  const reloadBoreholes = useReloadBoreholes();

  const getUsersWithPrivilege = (role: Role): User[] => {
    if (!users) return [];
    return users?.filter(user => {
      const boreholeWorkgroupId = borehole?.workgroup?.id;
      const workgroupRoles = user.workgroupRoles?.filter(wg => wg.workgroupId === boreholeWorkgroupId);
      if (!workgroupRoles) return false;
      const maxPrivilege = Math.max(...workgroupRoles.map(r => RolePriority[r.role]));
      return maxPrivilege >= RolePriority[role];
    });
  };

  const submitForm = async () => {
    setOpen(false);
    const formData = formMethods.getValues();
    const workflowChangeRequest: WorkflowChangeRequest = {
      boreholeId: id,
      comment: formData.comment,
      newAssigneeId: formData.newAssigneeId,
      newStatus: WorkflowStatus.InReview,
    };
    formMethods.reset();
    await sendWorkflowChangeRequest(workflowChangeRequest);
    queryClient.invalidateQueries({ queryKey: [workflowQueryKey] });
    reloadBoreholes();
  };

  const cancel = () => {
    setOpen(false);
    formMethods.reset();
  };

  return (
    <Dialog open={open}>
      <Stack sx={{ minWidth: "420px" }}>
        <DialogTitle>
          <Typography variant="h2">{t("forward")}</Typography>
        </DialogTitle>
        <DialogContent>
          <FormProvider {...formMethods}>
            <FormContainer sx={{ pt: theme.spacing(3) }}>
              <FormSelect
                fieldName="newAssigneeId"
                label="recipient"
                required={true}
                values={getUsersWithPrivilege(Role.Controller).map(user => {
                  return {
                    key: user.id,
                    value: user.id,
                    name: [capitalizeFirstLetter(user.firstName), capitalizeFirstLetter(user.lastName)]
                      .filter(Boolean)
                      .join(" "),
                  };
                })}
              />
              <FormInput fieldName="comment" label={"comment"} multiline={true} rows={4} />
            </FormContainer>
          </FormProvider>
        </DialogContent>
        <DialogActions>
          <Stack direction="row" justifyContent="flex-end" spacing={2}>
            <CancelButton onClick={cancel} />
            <Button
              variant="contained"
              data-cy={"request-review-dialog-button"}
              endIcon={<ChevronRight />}
              disabled={!formMethods.formState.isValid}
              onClick={submitForm}>
              {t("requestReview")}
            </Button>
          </Stack>
        </DialogActions>
      </Stack>
    </Dialog>
  );
};
