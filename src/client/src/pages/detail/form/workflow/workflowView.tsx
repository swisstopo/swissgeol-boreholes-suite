import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { Box, CircularProgress } from "@mui/material";
import {
  LocalDate,
  SgcWorkflowChangeEventDetail,
  SgcWorkflowCustomEvent,
  SgcWorkflowSelectionChangeEventDetails,
  SgcWorkflowSelectionEntry,
  SimpleUser,
} from "@swissgeol/ui-core";
import { SgcWorkflow } from "@swissgeol/ui-core-react";
import { useBorehole } from "../../../../api/borehole.ts";
import { useCurrentUser, useUsers } from "../../../../api/user.ts";
import { FullPageCentered } from "../../../../components/styledComponents.ts";
import { useRequiredParams } from "../../../../hooks/useRequiredParams.ts";
import { useUserRoleForBorehole } from "../../../../hooks/useUserRoleForBorehole.ts";
import { EditStateContext } from "../../editStateContext.tsx";
import {
  TabStatusChangeRequest,
  TabType,
  useWorkflow,
  useWorkflowMutation,
  WorkflowChange,
  WorkflowChangeRequest,
} from "./workflow.ts";

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
    updateWorkflow: { mutate: updateWorkflow },
    updateTabStatus: { mutate: updateTabStatus },
  } = useWorkflowMutation();

  const makeSelectionEntries = (): SgcWorkflowSelectionEntry<string>[] => {
    const field = (name: string) => ({
      field: name,
      name: () => t(name),
    });
    return [
      {
        name: () => t("borehole"),
        fields: [field("location"), field("section"), field("geometry")],
      },
      {
        name: () => t("stratigraphy"),
        fields: [field("lithology"), field("lithostratigraphy"), field("chronostratigraphy")],
      },
      {
        name: () => t("completion"),
        fields: [field("casing"), field("instrumentation"), field("backfill")],
      },
      {
        name: () => t("hydrogeology"),
        fields: [
          field("waterIngress"),
          field("groundwaterLevelMeasurement"),
          field("fieldMeasurement"),
          field("hydrotest"),
        ],
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

  if (!workflow || !currentUser) return null;

  const getUsersWithEditPrivilege = (): SimpleUser[] => {
    if (!users) return [];
    return users
      .filter(user => canUserEditBorehole(user, borehole))
      ?.map(user => ({
        ...user,
        role: mapMaxRole(user.workgroupRoles?.map(wgr => wgr.role)),
      }));
  };

  const handleWorkflowChange = (changeEvent: SgcWorkflowCustomEvent<SgcWorkflowChangeEventDetail>) => {
    const changes: WorkflowChange = changeEvent.detail.changes;
    const assigneeId = changes.toAssignee?.id ?? changes.toAssignee?.id;
    const workflowChangeRequest: WorkflowChangeRequest = {
      boreholeId: boreholeId,
      comment: changes.comment,
      newAssigneeId: assigneeId != undefined ? Number(assigneeId) : undefined,
      newStatus: changes.toStatus,
    };
    updateWorkflow(workflowChangeRequest);
  };

  const handleTabStatusUpdate = (
    changeEvent: SgcWorkflowCustomEvent<SgcWorkflowSelectionChangeEventDetails>,
    tab: TabType,
  ) => {
    const tabStatusChangeRequest: TabStatusChangeRequest = {
      boreholeId: boreholeId,
      tab: tab,
      changes: changeEvent.detail.changes,
    };
    updateTabStatus(tabStatusChangeRequest);
  };

  return (
    <Box sx={{ minHeight: "100dvh" }}>
      <SgcWorkflow
        workflow={{
          ...workflow,
          changes: workflow.changes?.map(change => ({
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
          handleTabStatusUpdate(e, TabType.Reviewed)
        }
        onSgcWorkflowApprovalChange={(e: SgcWorkflowCustomEvent<SgcWorkflowSelectionChangeEventDetails>) =>
          handleTabStatusUpdate(e, TabType.Published)
        }
        onSgcWorkflowChange={(e: SgcWorkflowCustomEvent<SgcWorkflowChangeEventDetail>) => handleWorkflowChange(e)}
        onSgcWorkflowPublish={(e: SgcWorkflowCustomEvent<SgcWorkflowChangeEventDetail>) => handleWorkflowChange(e)}
      />
    </Box>
  );
};
