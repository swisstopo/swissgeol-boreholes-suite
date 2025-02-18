import { FC, MouseEvent, useContext } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { Chip, Stack, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { updateUser } from "../../api/user.ts";
import { updateWorkgroup } from "../../api/workgroup.ts";
import { DeleteButton, ReturnButton } from "../../components/buttons/buttons.tsx";
import { DetailHeaderStack } from "../../components/styledComponents.ts";
import { useApiRequest } from "../../hooks/useApiRequest.ts";
import { useDeleteUserPrompts, useDeleteWorkgroupPrompts } from "../../hooks/useDeleteEntityPrompts.tsx";
import { capitalizeFirstLetter } from "../../utils.ts";
import { UserAdministrationContext } from "./admin/userAdministrationContext.tsx";
import { WorkgroupAdministrationContext } from "./admin/workgroupAdministrationContext.tsx";

export const SettingsHeader: FC = () => {
  const history = useHistory();
  const { t } = useTranslation();
  const { callApiWithRollback } = useApiRequest();
  const { users, setUsers, selectedUser, setSelectedUser } = useContext(UserAdministrationContext);
  const { workgroups, setWorkgroups, selectedWorkgroup, setSelectedWorkgroup } =
    useContext(WorkgroupAdministrationContext);
  const { showDeleteUserWarning } = useDeleteUserPrompts(setSelectedUser, users, setUsers);
  const { showDeleteWorkgroupWarning } = useDeleteWorkgroupPrompts(setSelectedWorkgroup, workgroups, setWorkgroups);

  const selectedEntity = selectedUser ? selectedUser : selectedWorkgroup;

  const updateUserActiveStateWithRollback = async (isDisabled: boolean) => {
    // Define rollback function to revert the state if the API call fails
    const rollback = () => setSelectedUser({ ...selectedUser! });

    // Optimistically update the user in the state
    const updatedUser = {
      ...selectedUser!,
      isDisabled: isDisabled,
      disabledAt: isDisabled ? new Date() : undefined,
    };
    setSelectedUser({ ...updatedUser });

    await callApiWithRollback(updateUser, [updatedUser], rollback);
  };

  const updateWorkgroupActiveStateWithRollback = async (isDisabled: boolean) => {
    // Define rollback function to revert the state if the API call fails
    const rollback = () => setSelectedWorkgroup({ ...selectedWorkgroup! });

    // Optimistically update the user in the state
    const updatedWorkgroup = {
      ...selectedWorkgroup!,
      isDisabled: isDisabled,
      disabledAt: isDisabled ? new Date() : undefined,
    };
    setSelectedWorkgroup({ ...updatedWorkgroup });

    await callApiWithRollback(updateWorkgroup, [updatedWorkgroup], rollback);
  };

  const handleInactiveToggleChange = (isDisabled: boolean) => {
    if (selectedUser) {
      updateUserActiveStateWithRollback(isDisabled);
    }
    if (selectedWorkgroup) {
      updateWorkgroupActiveStateWithRollback(isDisabled);
    }
  };

  const handleDeleteUser = () => {
    if (!selectedUser) return;
    showDeleteUserWarning(selectedUser);
  };

  const handleDeleteWorkgroup = () => {
    if (!selectedWorkgroup) return;
    showDeleteWorkgroupWarning(selectedWorkgroup);
  };

  const getTitle = () => {
    if (selectedUser) return capitalizeFirstLetter(t(selectedUser.name));
    else if (selectedWorkgroup) return capitalizeFirstLetter(t(selectedWorkgroup.name));
    else return t("header_settings");
  };

  const getChip = () => {
    if (selectedUser) return <Chip color={"secondary"} label={t("user")} />;
    else if (selectedWorkgroup) return <Chip color={"secondary"} label={t("workgroup")} />;
    else return null;
  };

  const getReturnRoute = () => {
    if (selectedUser) return "/setting#users";
    else if (selectedWorkgroup) return "/setting#workgroups";
    else return "/";
  };

  const getInactiveToggle = () => {
    if (!selectedEntity) return null;
    return (
      <ToggleButtonGroup
        value={selectedEntity.isDisabled}
        exclusive
        onChange={(event: MouseEvent<HTMLElement>, isDisabled: boolean) => {
          handleInactiveToggleChange(isDisabled);
        }}
        sx={{ boxShadow: "none", backgroundColor: "#F1F3F5" }}>
        <ToggleButton sx={{ m: "6px" }} value={true} data-cy="inactivate-user-button">
          {t("inactive")}
        </ToggleButton>
        <ToggleButton sx={{ m: "6px" }} value={false} data-cy="activate-user-button">
          {t("active")}
        </ToggleButton>
      </ToggleButtonGroup>
    );
  };

  const getDeleteButton = () => {
    if (!selectedEntity) return null;
    if (selectedUser) return <DeleteButton label={"deleteUser"} onClick={handleDeleteUser} />;
    if (selectedWorkgroup) return <DeleteButton label={"deleteWorkgroup"} onClick={handleDeleteWorkgroup} />;
  };

  return (
    <DetailHeaderStack direction="row" alignItems="center" data-cy="settings-header">
      <Stack direction="row" sx={{ flex: "1 1 100%" }} alignItems={"center"} gap={3}>
        <ReturnButton
          onClick={() => {
            history.push(getReturnRoute());
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
