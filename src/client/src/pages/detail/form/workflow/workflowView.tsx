import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { CircularProgress } from "@mui/material";
import {
  LocalDate,
  SgcWorkflowChangeEventDetail,
  SgcWorkflowCustomEvent,
  SgcWorkflowSelectionChangeEventDetails,
  SgcWorkflowSelectionEntry,
  SimpleUser,
} from "@swisstopo/swissgeol-ui-core";
import { SgcWorkflow } from "@swisstopo/swissgeol-ui-core-react";
import { useBorehole } from "../../../../api/borehole.ts";
import { useCurrentUser, useUsers } from "../../../../api/user.ts";
import { FullPageCentered } from "../../../../components/styledComponents.ts";
import { useRequiredParams } from "../../../../hooks/useRequiredParams.ts";
import { useUserRoleForBorehole } from "../../../../hooks/useUserRoleForBorehole.ts";
import { EditStateContext } from "../../editStateContext.tsx";
import { useWorkflow, useWorkflowMutation, WorkflowChange, WorkflowChangeRequest } from "./workflow.ts";

export const WorkflowView = () => {
  const { id: boreholeId } = useRequiredParams<{ id: string }>();
  const { data: workflow, isLoading } = useWorkflow(parseInt(boreholeId));
  const { data: currentUser, isLoading: isCurrentUserLoading } = useCurrentUser();
  const { editingEnabled } = useContext(EditStateContext);
  const { data: users } = useUsers();
  const { data: borehole } = useBorehole(parseInt(boreholeId));
  const { t } = useTranslation();
  const { canUserEditBorehole, mapMaxRole } = useUserRoleForBorehole();
  const {
    update: { mutate: updateWorkflow },
  } = useWorkflowMutation();

  const makeSelectionEntries = (): SgcWorkflowSelectionEntry<string>[] => {
    const field = (name: string) => ({
      field: name,
      name: () => t(name),
    });
    return [
      {
        name: () => t("borehole"),
        fields: [field("general"), field("section")],
      },
      {
        name: () => t("stratigraphy"),
        fields: [field("chronostratigraphy"), field("lithology"), field("lithostratigraphy")],
      },
      {
        name: () => t("completion"),
        fields: [field("casing"), field("instrumentation"), field("backfill")],
      },
      {
        name: () => t("hydrogeology"),
        fields: [field("waterIngress"), field("groundwater"), field("fieldMeasurement"), field("hydrotest")],
      },
      {
        name: () => t("attachments"),
        fields: [field("profiles"), field("photos"), field("documents")],
      },
    ];
  };

  if (isLoading || isCurrentUserLoading)
    return (
      <FullPageCentered>
        <CircularProgress />
      </FullPageCentered>
    );

  if (!workflow || !currentUser) return;

  const getUsersWithEditPrivilege = (): SimpleUser[] => {
    if (!users) return [];
    return users
      .filter(user => canUserEditBorehole(user, borehole))
      .map(user => ({
        ...user,
        role: mapMaxRole(user.workgroupRoles?.map(wgr => wgr.role)),
      }));
  };

  const handleWorkflowChange = (changeEvent: SgcWorkflowCustomEvent<SgcWorkflowChangeEventDetail>) => {
    const changes: WorkflowChange = changeEvent.detail.changes;
    const workflowChangeRequest: WorkflowChangeRequest = {
      boreholeId: boreholeId,
      comment: changes.comment,
      newAssigneeId: changes.toAssignee ? Number(changes.toAssignee.id) : undefined,
      newStatus: changes.toStatus,
    };
    updateWorkflow(workflowChangeRequest);
  };

  return (
    <SgcWorkflow
      workflow={{
        ...workflow,
        changes: workflow.changes.map(change => ({
          ...change,
          createdAt: LocalDate.fromDate(new Date(String(change.createdAt))),
        })),
      }}
      review={workflow.reviewedTabs}
      item={"Borehole"}
      approval={workflow.publishedTabs}
      availableAssignees={getUsersWithEditPrivilege()}
      isReadOnly={!editingEnabled}
      selection={makeSelectionEntries()}
      canChangeStatus={canUserEditBorehole(currentUser, borehole)}
      onSgcWorkflowReviewChange={(e: SgcWorkflowCustomEvent<SgcWorkflowSelectionChangeEventDetails>) =>
        console.log("On review change", e.detail)
      }
      onSgcWorkflowApprovalChange={(e: SgcWorkflowCustomEvent<SgcWorkflowSelectionChangeEventDetails>) =>
        console.log("On approval change", e.detail)
      }
      onSgcWorkflowChange={(e: SgcWorkflowCustomEvent<SgcWorkflowChangeEventDetail>) => handleWorkflowChange(e)}
      onSgcWorkflowPublish={(e: SgcWorkflowCustomEvent<SgcWorkflowChangeEventDetail>) => handleWorkflowChange(e)}
    />
  );
};
