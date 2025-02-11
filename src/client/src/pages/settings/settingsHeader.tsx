import { FC, MouseEvent } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { Chip, Stack, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { User } from "../../api/apiInterfaces.ts";
import { updateUser } from "../../api/user.ts";
import { DeleteButton, ReturnButton } from "../../components/buttons/buttons.tsx";
import { DetailHeaderStack } from "../../components/styledComponents.ts";
import { useApiRequest } from "../../hooks/useApiRequest.ts";
import { capitalizeFirstLetter } from "../../utils.ts";
import { useDeleteUserPrompts } from "./admin/useDeleteUserPrompts.tsx";

interface SettingsHeaderProps {
  selectedUser: User | null;
  setSelectedUser: (user: User | null) => void;
  users: User[];
  setUsers: (users: User[]) => void;
}

export const SettingsHeader: FC<SettingsHeaderProps> = ({ selectedUser, setSelectedUser, users, setUsers }) => {
  const history = useHistory();
  const { t } = useTranslation();
  const { callApiWithRollback } = useApiRequest();
  const { showNotDeletablePrompt, showDeleteWarningPrompt } = useDeleteUserPrompts(setSelectedUser, users, setUsers);

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

  const handleInactiveToggleChange = (isDisabled: boolean) => {
    if (selectedUser) {
      updateUserActiveStateWithRollback(isDisabled);
    }
  };

  const handleDeleteUser = () => {
    if (!selectedUser) return;
    if (!selectedUser?.deletable) {
      showNotDeletablePrompt(selectedUser);
    } else {
      showDeleteWarningPrompt(selectedUser);
    }
  };

  return (
    <DetailHeaderStack direction="row" alignItems="center" data-cy="settings-header">
      <Stack direction="row" sx={{ flex: "1 1 100%" }} alignItems={"center"} gap={1}>
        <ReturnButton
          onClick={() => {
            selectedUser ? history.push("/setting") : history.push("/");
          }}
        />
        <Typography variant="h2">
          {selectedUser ? capitalizeFirstLetter(t(selectedUser.name)) : t("header_settings")}
        </Typography>
        {selectedUser && <Chip color={"secondary"} label={t("user")} />}
      </Stack>
      {selectedUser && (
        <Stack direction="row" alignItems={"center"} gap={2}>
          <DeleteButton label={"deleteUser"} onClick={handleDeleteUser} />
          <ToggleButtonGroup
            value={selectedUser.isDisabled}
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
        </Stack>
      )}
    </DetailHeaderStack>
  );
};
