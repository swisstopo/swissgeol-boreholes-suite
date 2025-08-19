import { useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Box, CircularProgress } from "@mui/material";
import {
  GenericWorkflowSelection,
  LocalDate,
  Role,
  SgcWorkflowChangeEventDetail,
  SgcWorkflowCustomEvent,
  SgcWorkflowSelectionChangeEventDetails,
  SgcWorkflowSelectionEntry,
} from "@swissgeol/ui-core";
import { SgcWorkflow } from "@swissgeol/ui-core-react";
import { Role as LegacyRole } from "../../../../api/apiInterfaces.ts";
import { useBorehole, useBoreholeEditable } from "../../../../api/borehole.ts";
import { useCurrentUser, useEditorUsersOnWorkgroup } from "../../../../api/user.ts";
import { AlertContext } from "../../../../components/alert/alertContext.tsx";
import { restrictionCode, restrictionUntilCode } from "../../../../components/codelist.ts";
import { FullPageCentered } from "../../../../components/styledComponents.ts";
import { useBoreholesNavigate } from "../../../../hooks/useBoreholesNavigate.tsx";
import { useRequiredParams } from "../../../../hooks/useRequiredParams.ts";
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
  const { data: borehole } = useBorehole(parseInt(boreholeId));
  const { data: workflow, isLoading } = useWorkflow(parseInt(boreholeId));
  const { data: currentUser, isLoading: isCurrentUserLoading } = useCurrentUser();
  const { t } = useTranslation();
  const { data: editableByCurrentUser } = useBoreholeEditable(parseInt(boreholeId));
  const { data: editorUsersForWorkgroup } = useEditorUsersOnWorkgroup(borehole.workgroup?.id ?? 0);
  const { navigateTo } = useBoreholesNavigate();
  const { showAlert } = useContext(AlertContext);

  const {
    updateWorkflow: { mutate: updateWorkflow },
    updateTabStatus: { mutate: updateTabStatus },
  } = useWorkflowMutation();

  useEffect(() => {
    if (editableByCurrentUser === false) {
      showAlert(t("boreholeStatusChangedNoMorePermissions"), "success");
      navigateTo({ path: "/" + boreholeId + "/location" });
    }
  }, [editableByCurrentUser, showAlert, navigateTo, t, boreholeId]);

  const makeSelectionEntries = (): SgcWorkflowSelectionEntry<string>[] => {
    const field = (name: string) => ({
      field: name,
      name: () => t(name),
    });
    return [
      {
        name: () => t("borehole"),
        fields: [field("location"), field("general"), field("sections"), field("geometry")],
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

  const mapMaxRole = (roles?: LegacyRole[]): Role => {
    if (!roles || roles.length === 0) return Role.Reader;
    if (roles.includes(LegacyRole.Publisher)) return Role.Publisher;
    if (roles.includes(LegacyRole.Validator)) return Role.Reviewer;
    if (roles.includes(LegacyRole.Controller)) return Role.Reviewer;
    if (roles.includes(LegacyRole.Editor)) return Role.Editor;
    return Role.Reader;
  };

  if (isLoading || isCurrentUserLoading)
    return (
      <FullPageCentered>
        <CircularProgress />
      </FullPageCentered>
    );

  const availableAssignees = editorUsersForWorkgroup?.map(user => ({
    ...user,
    role: mapMaxRole(user.workgroupRoles?.map(wgr => wgr.role)),
  }));

  if (!workflow || !currentUser || !availableAssignees) return null;

  const handleWorkflowChange = (changeEvent: SgcWorkflowCustomEvent<SgcWorkflowChangeEventDetail>) => {
    const changes: WorkflowChange = changeEvent.detail.changes;
    const assigneeId = changes.toAssignee?.id;
    const workflowChangeRequest: WorkflowChangeRequest = {
      boreholeId: parseInt(boreholeId, 10),
      comment: changes.comment,
      newAssigneeId: assigneeId != undefined ? Number(assigneeId) : undefined,
      hasRequestedChanges: changes.hasRequestedChanges,
      newStatus: changes.toStatus,
    };
    updateWorkflow(workflowChangeRequest);
  };

  const revokePublicationIfReviewTabChanges = (changes: Partial<GenericWorkflowSelection>) => {
    if (!changes || Object.entries(changes).length <= 0) return;

    // Filter out entries that were set to false (reviews that were revoked)
    const revokedReviews = Object.entries(changes)
      .filter(([, value]) => value === false)
      .reduce(
        (acc, [field, value]) => {
          acc[field] = value as boolean;
          return acc;
        },
        {} as Record<string, boolean>,
      );

    // If any reviews were revoked, also remove those entries from published tabs
    if (Object.keys(revokedReviews).length > 0) {
      const resetTabStatusChangeRequest: TabStatusChangeRequest = {
        boreholeId: parseInt(boreholeId, 10),
        tab: TabType.Published,
        changes: revokedReviews,
      };
      updateTabStatus(resetTabStatusChangeRequest);
    }
  };

  const handleTabStatusUpdate = (
    changeEvent: SgcWorkflowCustomEvent<SgcWorkflowSelectionChangeEventDetails>,
    tab: TabType,
  ) => {
    const tabStatusChangeRequest: TabStatusChangeRequest = {
      boreholeId: parseInt(boreholeId, 10),
      tab: tab,
      changes: changeEvent.detail.changes,
    };
    updateTabStatus(tabStatusChangeRequest);

    // Reset publication tab if review is revoked.
    if (tab === TabType.Reviewed) {
      revokePublicationIfReviewTabChanges(changeEvent.detail.changes);
    }
  };

  return (
    <Box sx={{ minHeight: "100dvh" }}>
      <SgcWorkflow
        key={JSON.stringify(workflow)}
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
        isReadOnly={false}
        availableAssignees={availableAssignees}
        selection={makeSelectionEntries()}
        canChangeStatus={editableByCurrentUser}
        isRestricted={borehole.restrictionId === restrictionCode || borehole.restrictionId === restrictionUntilCode}
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
