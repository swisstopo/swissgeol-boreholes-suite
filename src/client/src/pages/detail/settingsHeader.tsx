import { FC, MouseEvent, useContext } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { Chip, Stack, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { Trash2, X } from "lucide-react";
import { User } from "../../api/apiInterfaces.ts";
import { deleteUser, updateUser } from "../../api/user.ts";
import { DeleteButton, ReturnButton } from "../../components/buttons/buttons.tsx";
import { PromptContext } from "../../components/prompt/promptContext.tsx";
import { DetailHeaderStack } from "../../components/styledComponents.ts";
import { useApiRequest } from "../../hooks/useApiRequest.ts";
import { capitalizeFirstLetter } from "../../utils.ts";
import { SettingsHeaderContext } from "../settings/admin/settingsHeaderContext.tsx";

interface SettingsHeaderProps {
  selectedUser: User | null;
  setSelectedUser: (user: User | null) => void;
  users: User[];
  setUsers: (users: User[]) => void;
}

export const SettingsHeader: FC<SettingsHeaderProps> = ({ selectedUser, setSelectedUser, users, setUsers }) => {
  const history = useHistory();
  const { t } = useTranslation();
  const { showPrompt } = useContext(PromptContext);
  const { headerTitle } = useContext(SettingsHeaderContext);
  const { callApiWithRollback } = useApiRequest();

  const deleteUserWithRollback = async () => {
    // Define rollback function to revert the state if the API call fails
    const rollback = () => {
      setSelectedUser({ ...selectedUser! });
      history.push("/setting/user/" + selectedUser?.id);
    };

    // Optimistically update the users table
    setUsers({ ...users.filter(u => u.id != selectedUser?.id) });
    history.push("/setting#users");

    await callApiWithRollback(deleteUser, [selectedUser?.id], rollback);
  };

  const updateUserActiveStateWithRollback = async (isDisabled: boolean) => {
    // Define rollback function to revert the state if the API call fails
    const rollback = () => setSelectedUser({ ...selectedUser! });

    // Optimistically update the user in the state
    const updatedUser = {
      ...selectedUser!,
      isDisabled: isDisabled,
      ...(isDisabled && { disabledAt: new Date() }),
    };
    setSelectedUser({ ...updatedUser });

    await callApiWithRollback(updateUser, [updatedUser], rollback);
  };

  const handleInactiveToggleChange = (isDisabled: boolean) => {
    if (selectedUser) {
      updateUserActiveStateWithRollback(isDisabled);
    }
  };

  function showNotDeletablePrompt() {
    let noteDeletableMessage = `${t("msgDisablingUser")}.`;
    if (!selectedUser?.isDisabled) {
      noteDeletableMessage += ` ${t("msgReenablingTip")}.`;
    }
    showPrompt(noteDeletableMessage, [
      {
        label: t("cancel"),
        icon: <X />,
      },
    ]);
  }

  function showDeleteWarningPrompt() {
    showPrompt(t("deleteUserMessage"), [
      {
        label: t("cancel"),
        icon: <X />,
      },
      {
        label: t("delete"),
        icon: <Trash2 />,
        variant: "contained",
        action: () => {
          deleteUserWithRollback();
        },
      },
    ]);
  }

  const handleDeleteUser = () => {
    if (!selectedUser?.deletable) {
      showNotDeletablePrompt();
    } else {
      showDeleteWarningPrompt();
    }
  };

  return (
    <DetailHeaderStack direction="row" alignItems="center" data-cy="settings-header">
      <Stack direction="row" sx={{ flex: "1 1 100%" }} alignItems={"center"} gap={1}>
        <ReturnButton
          onClick={() => {
            headerTitle === "settings" ? history.push("/") : history.push("/setting");
          }}
        />
        <Typography variant="h2"> {capitalizeFirstLetter(t(headerTitle))}</Typography>
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
            <ToggleButton sx={{ m: "6px" }} value={true}>
              {t("inactive")}
            </ToggleButton>
            <ToggleButton sx={{ m: "6px" }} value={false}>
              {t("active")}
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      )}
    </DetailHeaderStack>
  );
};
