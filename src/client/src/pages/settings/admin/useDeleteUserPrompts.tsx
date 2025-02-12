import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { Trash2, X } from "lucide-react";
import { User } from "../../../api/apiInterfaces.ts";
import { deleteUser } from "../../../api/user.ts";
import { PromptContext } from "../../../components/prompt/promptContext.tsx";
import { useApiRequest } from "../../../hooks/useApiRequest.ts";

export const useDeleteUserPrompts = (
  setSelectedUser: (user: User | null) => void,
  users: User[],
  setUsers: (users: User[]) => void,
) => {
  const history = useHistory();
  const { t } = useTranslation();
  const { showPrompt } = useContext(PromptContext);
  const { callApiWithRollback } = useApiRequest();

  const deleteUserWithRollback = async (user: User) => {
    // Define rollback function to revert the state if the API call fails
    const rollback = () => {
      setSelectedUser({ ...user });
      history.push("/setting/user/" + user.id);
    };

    // Optimistically update the users table
    setUsers(users.filter(u => u.id !== user.id));
    history.push("/setting#users");

    await callApiWithRollback(deleteUser, [user.id], rollback);
  };

  const showNotDeletablePrompt = (user: User) => {
    let notDeletableMessage = `${t("msgDisablingUser")}.`;
    if (!user?.isDisabled) {
      notDeletableMessage += ` ${t("msgReenablingTip")}.`;
    }
    showPrompt(notDeletableMessage, [
      {
        label: t("cancel"),
        icon: <X />,
      },
    ]);
  };

  const showDeletablePrompt = (user: User) => {
    let deletableMessage = `${t("deleteUserMessage")}`;
    if (!user?.isDisabled) {
      deletableMessage += ` ${t("msgReenablingTip")}.`;
    }
    showPrompt(deletableMessage, [
      {
        label: t("cancel"),
        icon: <X />,
      },
      {
        label: t("delete"),
        icon: <Trash2 />,
        variant: "contained",
        action: () => {
          deleteUserWithRollback(user);
        },
      },
    ]);
  };

  const showDeleteWarning = (user: User) => {
    if (user?.deletable) {
      showDeletablePrompt(user);
    } else {
      showNotDeletablePrompt(user);
    }
  };

  return { showDeleteWarning };
};
