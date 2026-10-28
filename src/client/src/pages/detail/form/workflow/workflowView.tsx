import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { Navigate } from "react-router";
import { Box, CircularProgress } from "@mui/material";
import {
  GenericWorkflowSelection,
  LocalDate,
  SgcWorkflowChangeEventDetail,
  SgcWorkflowCustomEvent,
  SgcWorkflowSelectionChangeEventDetails,
  SgcWorkflowSelectionEntry,
  WorkflowStatus,
} from "@swissgeol/ui-core";
import { SgcWorkflow } from "@swissgeol/ui-core-react";
import { useBorehole, useBoreholeManageable } from "../../../../api/borehole.ts";
import { useCurrentUser, useEditorUsersOnWorkgroup } from "../../../../api/user.ts";
import { useAuth } from "../../../../auth/useBoreholesAuth.tsx";
import { AlertContext } from "../../../../components/alert/alertContext.tsx";
import { restrictionFreeCode } from "../../../../components/codelist.ts";
import { FullPageCentered } from "../../../../components/styledComponents.ts";
import { useBoreholeDataAvailability } from "../../../../hooks/useBoreholeDataAvailability.ts";
import { useRequiredId } from "../../../../hooks/useRequiredId.ts";
import { EditStateContext } from "../../editStateContext.tsx";
import {
  TabStatusChangeRequest,
  TabType,
  useWorkflow,
  useWorkflowMutation,
  WorkflowChange,
  WorkflowChangeRequest,
} from "./workflow.ts";
import { canPublishInWorkgroup, canViewWorkflow, getWorkflowRoleInWorkgroup } from "./workflowRole.ts";

export const WorkflowView = () => {
  const boreholeId = useRequiredId();
  const { data: borehole } = useBorehole(boreholeId);
  const { data: workflow, isLoading } = useWorkflow(boreholeId);
  const { data: currentUser, isLoading: isCurrentUserLoading } = useCurrentUser();
  const { t } = useTranslation();
  const { data: canManage, refetch: refetchCanManage } = useBoreholeManageable(boreholeId);
  const auth = useAuth();
  const { setEditingEnabled } = useContext(EditStateContext);
  const workgroupId = borehole?.workgroup?.id ?? 0;
  const { data: editorUsersForWorkgroup } = useEditorUsersOnWorkgroup(workgroupId);
  const { showAlert } = useContext(AlertContext);
  const {
    hasStratigraphy,
    hasSections,
    hasGeometry,
    hasCompletion,
    hasObservation,
    hasWaterIngress,
    hasGroundwaterLevelMeasurement,
    hasHydroTest,
    hasFieldMeasurement,
    hasAttachments,
    hasProfiles,
    hasPhotos,
    hasDocuments,
    hasCasings,
    hasBackfills,
    hasInstrumentations,
    hasLithology,
    hasLithostratigraphy,
    hasChronostratigraphy,
    hasLogRuns,
    hasIdentifiers,
  } = useBoreholeDataAvailability(borehole);

  const {
    updateWorkflow: { mutate: updateWorkflow },
    updateTabStatus: { mutate: updateTabStatus },
  } = useWorkflowMutation();

  // The page turns read-only when the user's own status change takes away the manage permission.
  // Losing it for other reasons, such as another user locking the borehole, is not announced here.
  const alertIfManagePermissionLost = async () => {
    // Joins the refetch that the mutation's invalidation already started instead of cancelling it.
    const { data: canStillManage } = await refetchCanManage({ cancelRefetch: false });
    if (canStillManage === false) {
      showAlert(t("boreholeStatusChangedNoMorePermissions"), "success");
    }
  };

  if (auth.anonymousModeEnabled) return <Navigate to={`/${boreholeId}/location`} replace />;

  const makeSelectionEntries = (): SgcWorkflowSelectionEntry<string>[] => {
    const field = (name: string, isDisabled: boolean = false, label: string = name) => ({
      field: name,
      isDisabled: isDisabled,
      name: () => t(label),
    });
    return [
      {
        name: () => t("borehole"),
        fields: [
          field("location"),
          field("identifiers", !hasIdentifiers, "ids"),
          field("general"),
          field("sections", !hasSections),
          field("geometry", !hasGeometry),
        ],
      },
      {
        name: () => t("stratigraphy"),
        isDisabled: !hasStratigraphy,
        fields: [
          field("lithology", !hasLithology),
          field("lithostratigraphy", !hasLithostratigraphy),
          field("chronostratigraphy", !hasChronostratigraphy),
        ],
      },
      {
        name: () => t("completion"),
        isDisabled: !hasCompletion,
        fields: [
          field("casing", !hasCasings),
          field("instrumentation", !hasInstrumentations),
          field("backfill", !hasBackfills),
        ],
      },
      {
        name: () => t("hydrogeology"),
        isDisabled: !hasObservation,
        fields: [
          field("waterIngress", !hasWaterIngress),
          field("groundwaterLevelMeasurement", !hasGroundwaterLevelMeasurement),
          field("fieldMeasurement", !hasFieldMeasurement),
          field("hydrotest", !hasHydroTest),
        ],
      },
      {
        name: () => t("log"),
        isDisabled: !hasLogRuns,
        fields: [field("log", !hasLogRuns, "logRuns")],
      },
      {
        name: () => t("attachments"),
        isDisabled: !hasAttachments,
        fields: [field("profiles", !hasProfiles), field("photos", !hasPhotos), field("documents", !hasDocuments)],
      },
    ];
  };

  if (isLoading || isCurrentUserLoading)
    return (
      <FullPageCentered>
        <CircularProgress />
      </FullPageCentered>
    );

  if (!workflow || !currentUser || !borehole) return null;

  if (!canViewWorkflow(currentUser, workgroupId)) return <Navigate to={`/${boreholeId}/location`} replace />;

  const availableAssignees = editorUsersForWorkgroup?.map(user => ({
    ...user,
    firstName: user.firstName ?? "",
    lastName: user.lastName ?? "",
    role: getWorkflowRoleInWorkgroup(user.workgroupRoles, workgroupId),
  }));

  if (!availableAssignees) return null;

  const handleWorkflowChange = (changeEvent: SgcWorkflowCustomEvent<SgcWorkflowChangeEventDetail>) => {
    const changes: WorkflowChange = changeEvent.detail.changes;
    const assigneeId = changes.toAssignee?.id;
    const workflowChangeRequest: WorkflowChangeRequest = {
      boreholeId: boreholeId,
      comment: changes.comment,
      newAssigneeId: assigneeId == undefined ? undefined : Number(assigneeId),
      hasRequestedChanges: changes.hasRequestedChanges,
      newStatus: changes.toStatus,
    };
    updateWorkflow(workflowChangeRequest, { onSuccess: () => void alertIfManagePermissionLost() });
    if (changes.toStatus === WorkflowStatus.Reviewed || changes.toStatus === WorkflowStatus.Published) {
      setEditingEnabled(false);
    }
  };

  const revokePublicationIfReviewTabChanges = (changes: Partial<GenericWorkflowSelection>) => {
    if (!changes || Object.entries(changes).length <= 0) return;

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
        boreholeId: boreholeId,
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
      boreholeId: boreholeId,
      tab: tab,
      changes: changeEvent.detail.changes,
    };
    updateTabStatus(tabStatusChangeRequest);

    if (tab === TabType.Reviewed) {
      revokePublicationIfReviewTabChanges(changeEvent.detail.changes);
    }
  };

  const isAnythingApproved = Object.values(workflow.publishedTabs).includes(true);
  const canPublish = canPublishInWorkgroup(currentUser, workgroupId);
  // Stays false while the permission is loading or failed to load, so the page is read-only by default.
  const canManageBorehole = canManage === true;

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
        // Hides the publish button and locks the review and approval checkboxes.
        isReadOnly={!canManageBorehole}
        availableAssignees={availableAssignees}
        selection={makeSelectionEntries()}
        canChangeStatus={canManageBorehole}
        // Only greys out the publish button, everything else stays usable.
        isRestricted={borehole?.restrictionId !== restrictionFreeCode || !isAnythingApproved || !canPublish}
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
