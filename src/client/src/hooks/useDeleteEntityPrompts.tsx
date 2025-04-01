import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { Trash2, X } from "lucide-react";
import { UseMutateFunction, useQueryClient } from "@tanstack/react-query";
import { User, Workgroup } from "../api/apiInterfaces.ts";
import { usersQueryKey, useUserMutations } from "../api/user.ts";
import { useWorkgroupMutations, workgroupQueryKey } from "../api/workgroup.ts";
import { PromptContext } from "../components/prompt/promptContext.tsx";

export const useDeleteEntityPrompts = (
  deleteEntity: UseMutateFunction<unknown, unknown, number>,
  entityQueryKey: string,
) => {
  const history = useHistory();
  const { t } = useTranslation();
  const { showPrompt } = useContext(PromptContext);
  const queryClient = useQueryClient();

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
    queryClient.invalidateQueries({
      queryKey: [entityQueryKey],
    });

    if (isUser(entity)) {
      history.push(`/setting#users`);
    } else if (isWorkgroup(entity)) {
      history.push(`/setting#workgroups`);
    } else return `/setting`;

    deleteEntity(entity.id);
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

  const showDeleteEntityWarning = (entity?: User | Workgroup | null) => {
    if (!entity) return;
    if (isEntityDeletable(entity)) {
      showDeletablePrompt(entity);
    } else {
      showNotDeletablePrompt(entity);
    }
  };

  return { showDeleteEntityWarning };
};

export const useDeleteWorkgroupPrompts = () => {
  const {
    delete: { mutate: deleteWorkgroup },
  } = useWorkgroupMutations();

  const { showDeleteEntityWarning: showDeleteWorkgroupWarning } = useDeleteEntityPrompts(
    deleteWorkgroup,
    workgroupQueryKey,
  );

  return { showDeleteWorkgroupWarning };
};

export const useDeleteUserPrompts = () => {
  const {
    delete: { mutate: deleteUser },
  } = useUserMutations();
  const { showDeleteEntityWarning: showDeleteUserWarning } = useDeleteEntityPrompts(deleteUser, usersQueryKey);
  return { showDeleteUserWarning };
};
