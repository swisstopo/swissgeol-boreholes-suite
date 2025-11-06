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
  WorkflowStatus,
} from "@swissgeol/ui-core";
import { SgcWorkflow } from "@swissgeol/ui-core-react";
import { Role as LegacyRole } from "../../../../api/apiInterfaces.ts";
import { useBorehole, useBoreholeStatusEditable } from "../../../../api/borehole.ts";
import { useCurrentUser, useEditorUsersOnWorkgroup } from "../../../../api/user.ts";
import { AlertContext } from "../../../../components/alert/alertContext.tsx";
import { restrictionFreeCode } from "../../../../components/codelist.ts";
import { FullPageCentered } from "../../../../components/styledComponents.ts";
import { useBoreholeDataAvailability } from "../../../../hooks/useBoreholeDataAvailability.ts";
import { useBoreholesNavigate } from "../../../../hooks/useBoreholesNavigate.tsx";
import { useRequiredParams } from "../../../../hooks/useRequiredParams.ts";
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
  const { data: borehole } = useBorehole(parseInt(boreholeId));
  const { data: workflow, isLoading } = useWorkflow(parseInt(boreholeId));
  const { data: currentUser, isLoading: isCurrentUserLoading } = useCurrentUser();
  const { t } = useTranslation();
  const { data: canChangeStatus } = useBoreholeStatusEditable(parseInt(boreholeId));
  const { setEditingEnabled } = useContext(EditStateContext);
  const { data: editorUsersForWorkgroup } = useEditorUsersOnWorkgroup(borehole?.workgroup?.id ?? 0);
  const { navigateTo } = useBoreholesNavigate();
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
    hasBoreholeFiles,
    hasPhotos,
    hasDocuments,
    hasCasings,
    hasBackfills,
    hasInstrumentations,
    hasLithology,
    hasLithostratigraphy,
    hasChronostratigraphy,
    hasLogRuns,
  } = useBoreholeDataAvailability(borehole);

  const {
    updateWorkflow: { mutate: updateWorkflow },
    updateTabStatus: { mutate: updateTabStatus },
  } = useWorkflowMutation();

  useEffect(() => {
    if (canChangeStatus === false) {
      showAlert(t("boreholeStatusChangedNoMorePermissions"), "success");
      navigateTo({ path: "/" + boreholeId + "/location" });
    }
  }, [canChangeStatus, showAlert, navigateTo, t, boreholeId]);

  const makeSelectionEntries = (): SgcWorkflowSelectionEntry<string>[] => {
    const field = (name: string, isDisabled: boolean = false, label: string = name) => ({
      field: name,
      isDisabled: isDisabled,
      name: () => t(label),
    });
    return [
      {
        name: () => t("borehole"),
        fields: [field("location"), field("general"), field("sections", !hasSections), field("geometry", !hasGeometry)],
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
        fields: [field("profiles", !hasBoreholeFiles), field("photos", !hasPhotos), field("documents", !hasDocuments)],
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

    if (tab === TabType.Reviewed) {
      revokePublicationIfReviewTabChanges(changeEvent.detail.changes);
    }
  };

  const isAnythingApproved = Object.entries(workflow.publishedTabs).some(([, value]) => value === true);

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
        canChangeStatus={canChangeStatus}
        isRestricted={borehole?.restrictionId !== restrictionFreeCode || !isAnythingApproved}
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
