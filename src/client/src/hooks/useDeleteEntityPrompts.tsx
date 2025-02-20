import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { Trash2, X } from "lucide-react";
import { User, Workgroup } from "../api/apiInterfaces.ts";
import { deleteUser } from "../api/user.ts";
import { deleteWorkgroup } from "../api/workgroup.ts";
import { PromptContext } from "../components/prompt/promptContext.tsx";
import { useApiRequest } from "./useApiRequest.ts";

export const useDeleteEntityPrompts = <T extends User | Workgroup>(
  deleteEntity: (id: number) => Promise<void>,
  setSelectedEntity: (entity: T | null) => void,
  entities: T[],
  setEntities: (entities: T[]) => void,
) => {
  const history = useHistory();
  const { t } = useTranslation();
  const { showPrompt } = useContext(PromptContext);
  const { callApiWithRollback } = useApiRequest();

  // Type guard for User
  function isUser(entity: User | Workgroup): entity is User {
    return "subjectId" in entity;
  }

  // Type guard for Workgroup
  function isWorkgroup(entity: User | Workgroup): entity is Workgroup {
    return "boreholeCount" in entity;
  }

  const getNotDeletableMessage = (entity: User | Workgroup) => {
    const entityName = isUser(entity) ? "User" : "Workgroup";
    const msgDisablingTranlationString = `msgDisabling${entityName}`;
    const msgReenablingTranslationString = `msgReenabling${entityName}Tip`;
    let notDeletableMessage = `${t(msgDisablingTranlationString)}.`;
    if (!entity?.isDisabled) {
      notDeletableMessage += ` ${t(msgReenablingTranslationString)}.`;
    }
    return notDeletableMessage;
  };

  const getDeletableMessage = (entity: User | Workgroup) => {
    const entityName = isUser(entity) ? "User" : "Workgroup";
    const msgDeleteEntityTranlationString = `msgDelete${entityName}`;
    const msgReenablingTranslationString = `msgReenabling${entityName}Tip`;
    let deletableMessage = `${t(msgDeleteEntityTranlationString)}.`;
    if (!entity?.isDisabled) {
      deletableMessage += ` ${t(msgReenablingTranslationString)}.`;
    }
    return deletableMessage;
  };

  const deleteEntityWithRollback = async (entity: User | Workgroup) => {
    const rollback = () => {
      setSelectedEntity({ ...entity } as T);
      const getReturnUrl = () => {
        if (isUser(entity)) {
          return `/setting/user/${entity.id}`;
        } else if (isWorkgroup(entity)) {
          return `/setting/workgroup/${entity.id}`;
        } else return `/setting`;
      };
      history.push(getReturnUrl());
    };

    setEntities(entities.filter(e => e.id !== entity.id));
    history.push(`/setting#${entity.name}s`);

    await callApiWithRollback(deleteEntity, [entity.id], rollback);
  };

  const isEntityDeletable = (entity: User | Workgroup) => {
    if (isWorkgroup(entity)) {
      return entity.boreholeCount === 0;
    }
    if (isUser(entity)) {
      return entity.deletable;
    }
  };

  const showNotDeletablePrompt = (entity: User | Workgroup) => {
    showPrompt(getNotDeletableMessage(entity), [
      {
        label: t("cancel"),
        icon: <X />,
      },
    ]);
  };

  const showDeletablePrompt = (entity: User | Workgroup) => {
    showPrompt(getDeletableMessage(entity), [
      {
        label: t("cancel"),
        icon: <X />,
      },
      {
        label: t("delete"),
        icon: <Trash2 />,
        variant: "contained",
        action: () => {
          deleteEntityWithRollback(entity);
        },
      },
    ]);
  };

  const showDeleteEntityWarning = (entity: User | Workgroup) => {
    if (isEntityDeletable(entity)) {
      showDeletablePrompt(entity);
    } else {
      showNotDeletablePrompt(entity);
    }
  };

  return { showDeleteEntityWarning };
};

export const useDeleteWorkgroupPrompts = (
  setSelectedWorkgroup: (arg: Workgroup | null) => void,
  workgroups: Workgroup[],
  setWorkgroups: (arg: Workgroup[]) => void,
) => {
  const { showDeleteEntityWarning: showDeleteWorkgroupWarning } = useDeleteEntityPrompts(
    deleteWorkgroup,
    setSelectedWorkgroup,
    workgroups,
    setWorkgroups,
  );

  return { showDeleteWorkgroupWarning };
};

export const useDeleteUserPrompts = (
  setSelectedUser: (arg: User | null) => void,
  users: User[],
  setUsers: (arg: User[]) => void,
) => {
  const { showDeleteEntityWarning: showDeleteUserWarning } = useDeleteEntityPrompts(
    deleteUser,
    setSelectedUser,
    users,
    setUsers,
  );
  return { showDeleteUserWarning };
};
