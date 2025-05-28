import { FC, MouseEvent } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { Chip, Stack, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { useSelectedUser, useUserMutations } from "../../api/user.ts";
import { useSelectedWorkgroup, useWorkgroupMutations } from "../../api/workgroup.ts";
import { DeleteButton, ReturnButton } from "../../components/buttons/buttons.tsx";
import { DetailHeaderStack } from "../../components/styledComponents.ts";
import { useDeleteUserPrompts, useDeleteWorkgroupPrompts } from "../../hooks/useDeleteEntityPrompts.tsx";
import { capitalizeFirstLetter } from "../../utils.ts";

export const SettingsHeader: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { showDeleteUserWarning } = useDeleteUserPrompts();
  const { showDeleteWorkgroupWarning } = useDeleteWorkgroupPrompts();
  const {
    update: { mutate: updateUser },
  } = useUserMutations();

  const {
    update: { mutate: updateWorkgroup },
  } = useWorkgroupMutations();

  const userId = location.pathname.split("user/")[1];
  const workgroupId = location.pathname.split("workgroup/")[1];

  const { data: selectedUser } = useSelectedUser(parseInt(userId));
  const { data: selectedWorkgroup } = useSelectedWorkgroup(parseInt(workgroupId));

  const updateUserActiveStateWithRollback = async (isDisabled: boolean) => {
    const updatedUser = {
      ...selectedUser!,
      isDisabled: isDisabled,
      disabledAt: isDisabled ? new Date() : undefined,
    };
    updateUser(updatedUser);
  };

  const updateWorkgroupActiveStateWithRollback = async (isDisabled: boolean) => {
    const updatedWorkgroup = {
      ...selectedWorkgroup!,
      isDisabled: isDisabled,
      disabledAt: isDisabled ? new Date() : undefined,
    };
    updateWorkgroup(updatedWorkgroup);
  };

  const handleInactiveToggleChange = (isDisabled: boolean) => {
    if (userId) {
      updateUserActiveStateWithRollback(isDisabled);
    }
    if (workgroupId) {
      updateWorkgroupActiveStateWithRollback(isDisabled);
    }
  };

  const handleDeleteUser = () => {
    showDeleteUserWarning(selectedUser);
  };

  const handleDeleteWorkgroup = () => {
    showDeleteWorkgroupWarning(selectedWorkgroup);
  };

  const getTitle = () => {
    if (selectedUser) return capitalizeFirstLetter(t(selectedUser?.name));
    else if (selectedWorkgroup) return capitalizeFirstLetter(t(selectedWorkgroup.name));
    else return t("header_settings");
  };

  const getChip = () => {
    if (userId) return <Chip color={"secondary"} label={t("user")} />;
    else if (workgroupId) return <Chip color={"secondary"} label={t("workgroup")} />;
    else return null;
  };

  const getReturnRoute = () => {
    if (userId) return "/setting#users";
    else if (workgroupId) return "/setting#workgroups";
    else return "/";
  };

  const getInactiveToggle = () => {
    const selectedEntity = selectedUser ?? selectedWorkgroup;
    if (!selectedEntity) return null;
    return (
      <ToggleButtonGroup
        value={selectedEntity.isDisabled}
        exclusive
        onChange={(event: MouseEvent<HTMLElement>, isDisabled: boolean) => {
          handleInactiveToggleChange(isDisabled);
        }}
        sx={{ boxShadow: "none", backgroundColor: "#F1F3F5" }}>
        <ToggleButton sx={{ m: "6px" }} value={true} data-cy="inactivate-button">
          {t("inactive")}
        </ToggleButton>
        <ToggleButton sx={{ m: "6px" }} value={false} data-cy="activate-button">
          {t("active")}
        </ToggleButton>
      </ToggleButtonGroup>
    );
  };

  const getDeleteButton = () => {
    if (userId) return <DeleteButton label={"deleteUser"} onClick={handleDeleteUser} />;
    if (workgroupId) return <DeleteButton label={"deleteWorkgroup"} onClick={handleDeleteWorkgroup} />;
  };

  return (
    <DetailHeaderStack direction="row" alignItems="center" data-cy="settings-header">
      <Stack direction="row" sx={{ flex: "1 1 100%" }} alignItems={"center"} gap={3}>
        <ReturnButton
          onClick={() => {
            navigate(getReturnRoute());
          }}
        />
        <Typography variant="h2">{getTitle()}</Typography>
        {getChip()}
      </Stack>
      <Stack direction="row" alignItems={"center"} gap={2}>
        {getInactiveToggle()}
        {getDeleteButton()}
      </Stack>
    </DetailHeaderStack>
  );
};
