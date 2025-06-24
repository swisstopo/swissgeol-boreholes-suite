import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { Stack } from "@mui/material";
import {
  Role,
  SgcWorkflowChangeEventDetail,
  SgcWorkflowCustomEvent,
  SgcWorkflowSelectionChangeEventDetails,
  SgcWorkflowSelectionEntry,
  SimpleUser,
  WorkflowChange,
} from "@swisstopo/swissgeol-ui-core";
import { SgcWorkflow } from "@swisstopo/swissgeol-ui-core-react";
import { RolePriority } from "../../../../api/apiInterfaces.ts";
import { useBorehole } from "../../../../api/borehole.ts";
import { useUsers } from "../../../../api/user.ts";
import { useRequiredParams } from "../../../../hooks/useRequiredParams.ts";
import { EditStateContext } from "../../editStateContext.tsx";
import { useWorkflow, useWorkflowMutation, WorkflowChangeRequest } from "./workflow.ts";

const CoreRolePriority: Record<Role, number> = {
  Reader: 0,
  Editor: 1,
  Reviewer: 2,
  Publisher: 3,
};

export const WorkflowView = () => {
  const { id: boreholeId } = useRequiredParams<{ id: string }>();
  const { data: workflow } = useWorkflow(parseInt(boreholeId));
  const { editingEnabled } = useContext(EditStateContext);
  const { data: users } = useUsers();
  const { data: borehole } = useBorehole(parseInt(boreholeId));
  const { t } = useTranslation();
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
        fields: [field("profiles"), field("photo")],
      },
    ];
  };

  if (!workflow) return;

  const getUsersWithPrivilege = (role: Role): SimpleUser[] => {
    if (!users) return [];
    return users
      ?.map(user => ({
        ...user,
        role: Role.Reviewer, // todo fix this, it should be dynamic based on the role
      }))
      .filter(user => {
        const boreholeWorkgroupId = borehole?.workgroup?.id;
        const workgroupRoles = user.workgroupRoles?.filter(wg => wg.workgroupId === boreholeWorkgroupId);
        if (!workgroupRoles) return false;
        const maxPrivilege = Math.max(...workgroupRoles.map(r => RolePriority[r.role]));
        return maxPrivilege >= CoreRolePriority[role];
      });
  };

  const handleWorkflowChange = (changeEvent: SgcWorkflowCustomEvent<SgcWorkflowChangeEventDetail>) => {
    const changes: WorkflowChange = changeEvent.detail.changes;
    const workflowChangeRequest: WorkflowChangeRequest = {
      boreholeId: boreholeId,
      comment: changes.comment,
      newAssigneeId: Number(changes.toAssignee?.id),
      newStatus: changes.toStatus,
    };
    updateWorkflow(workflowChangeRequest);
  };

  return (
    <Stack gap={1.5} direction="row">
      <SgcWorkflow
        workflow={workflow}
        review={workflow.reviewedTabs}
        approval={workflow.publishedTabs}
        availableAssignees={getUsersWithPrivilege(Role.Reviewer).map(user => ({
          ...user,
          role: Role.Reviewer,
        }))}
        isReadOnly={!editingEnabled}
        selection={makeSelectionEntries()}
        onSgcWorkflowReviewChange={(e: SgcWorkflowCustomEvent<SgcWorkflowSelectionChangeEventDetails>) =>
          console.log("On review change", e.detail)
        }
        onSgcWorkflowApprovalChange={(e: SgcWorkflowCustomEvent<SgcWorkflowSelectionChangeEventDetails>) =>
          console.log("On approval change", e.detail)
        }
        onSgcWorkflowChange={(e: SgcWorkflowCustomEvent<SgcWorkflowChangeEventDetail>) => handleWorkflowChange(e)}
        onSgcWorkflowPublish={(e: SgcWorkflowCustomEvent<SgcWorkflowChangeEventDetail>) => handleWorkflowChange(e)}
      />
    </Stack>
  );
};
