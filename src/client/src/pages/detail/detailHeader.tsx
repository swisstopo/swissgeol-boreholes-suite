import { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { Chip, Stack, Typography } from "@mui/material";
import { ArrowDownToLine, Check, Trash2, X } from "lucide-react";
import { BoreholeV2, useBoreholeEditable, useBoreholeMutations, useReloadBoreholes } from "../../api/borehole.ts";
import { useCurrentUser } from "../../api/user.ts";
import { useAuth } from "../../auth/useBdmsAuth.tsx";
import {
  DeleteButton,
  EditButton,
  EndEditButton,
  ExportButton,
  ReturnButton,
} from "../../components/buttons/buttons.tsx";
import { ExportDialog } from "../../components/export/exportDialog.tsx";
import { PromptContext } from "../../components/prompt/promptContext.tsx";
import { DetailHeaderStack } from "../../components/styledComponents.ts";
import { useBoreholesNavigate } from "../../hooks/useBoreholesNavigate.tsx";
import { useDevMode } from "../../hooks/useDevMode.tsx";
import { useApiErrorAlert } from "../../hooks/useShowAlertOnError.tsx";
import { useRequiredParams } from "../../hooks/useRequiredParams.ts";
import { formatDate } from "../../utils.ts";
import { EditStateContext } from "./editStateContext.tsx";
import { SaveContext, SaveContextProps } from "./saveContext.tsx";
import { StatusBadges } from "./statusBadges.tsx";

interface DetailHeaderProps {
  borehole: BoreholeV2;
}

const DetailHeader = ({ borehole }: DetailHeaderProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const { id } = useRequiredParams<{ id: string }>();
  const { navigateTo } = useBoreholesNavigate();
  const { runsDevMode } = useDevMode();
  const { data: currentUser } = useCurrentUser();
  const { data: editableByCurrentUser } = useBoreholeEditable(parseInt(id));
  const { t } = useTranslation();
  const { showPrompt } = useContext(PromptContext);
  const { editingEnabled, setEditingEnabled } = useContext(EditStateContext);
  const { hasChanges, triggerReset } = useContext<SaveContextProps>(SaveContext);
  const auth = useAuth();
  const {
    update: { mutate: updateBorehole },
    delete: { mutate: deleteBorehole },
  } = useBoreholeMutations();
  const reloadBoreholes = useReloadBoreholes();
  const showApiErrorAlert = useApiErrorAlert();

  const toggleEditing = (editing: boolean) => {
    if (!currentUser) return;
    if (!editing) {
      updateBorehole(
        { ...borehole, locked: null, lockedById: null },
        {
          onSuccess: () => {
            reloadBoreholes();
          },
          onError: error => {
            showApiErrorAlert(error);
          },
        },
      );
    } else {
      updateBorehole(
        { ...borehole, locked: new Date().toISOString(), lockedById: currentUser.id },
        {
          onSuccess: () => {
            reloadBoreholes();
          },
          onError: error => {
            showApiErrorAlert(error);
          },
        },
      );
    }
    setEditingEnabled(editing);
  };

  const startEditing = () => {
    toggleEditing(true);
  };

  const stopEditing = () => {
    toggleEditing(false);
  };

  const resetFormAndStopEditing = () => {
    triggerReset();
    stopEditing();
  };

  const stopEditingWithUnsavedChanges = () => {
    showPrompt("messageDiscardUnsavedChanges", [
      {
        label: "cancel",
        icon: <X />,
        variant: "outlined",
      },
      {
        label: "discardchanges",
        icon: <Trash2 />,
        variant: "contained",
        action: resetFormAndStopEditing,
      },
    ]);
  };

  const startExportWithUnsavedChanges = () => {
    showPrompt("messageUnsavedChangesAtExport", [
      {
        label: "cancel",
        icon: <X />,
        variant: "outlined",
      },
      {
        label: "export",
        icon: <ArrowDownToLine />,
        variant: "contained",
        action: () => setIsExporting(true),
      },
    ]);
  };

  const handleDelete = () => {
    deleteBorehole(borehole.id);
    navigateTo({ path: "/" });
  };

  const handleReturnClick = () => {
    if (editingEnabled) {
      if (hasChanges) {
        stopEditingWithUnsavedChanges();
      } else {
        stopEditing();
      }
    }
    navigateTo({ path: "/" });
  };

  if (!borehole) return;
  // get unfinished or latest workflow
  const workflows = borehole?.workflows.sort((a, b) => new Date(b.finished).getTime() - new Date(a.finished).getTime());
  const currentWorkflow = workflows?.find(workflow => workflow.finished == null) || workflows[0];
  const statusLabel = t(`status${currentWorkflow?.role.toLowerCase()}`);
  const statusColor = currentWorkflow?.finished != null ? "success" : "warning";
  const statusIcon = currentWorkflow?.finished != null ? <Check /> : <div />;

  const statusChips = runsDevMode ? (
    <StatusBadges workflow={borehole.workflow} />
  ) : (
    <Chip data-cy="workflow-status-chip" label={statusLabel} color={statusColor} icon={statusIcon} />
  );

  return (
    <DetailHeaderStack direction="row" alignItems="center">
      <Stack direction="row" sx={{ flex: "1 1 100%" }} alignItems={"center"} gap={3}>
        <ReturnButton onClick={handleReturnClick} />
        <Stack>
          <Typography variant="h2"> {borehole?.name}</Typography>
          {!auth.anonymousModeEnabled && (
            <Typography variant={"subtitle2"}>
              {t("lastUpdated")}: {formatDate(borehole?.updated)} {t("by")} {borehole?.updatedBy?.name}
            </Typography>
          )}
        </Stack>
        {statusChips}
      </Stack>
      <Stack direction="row" data-cy="detail-header" gap={2}>
        <ExportButton
          label="export"
          onClick={hasChanges ? startExportWithUnsavedChanges : () => setIsExporting(true)}
        />
        {editableByCurrentUser && (
          <>
            {editingEnabled ? (
              <>
                <DeleteButton
                  label="deleteBorehole"
                  onClick={() =>
                    showPrompt(t("deleteBoreholesMessage", { count: 1 }), [
                      {
                        label: "cancel",
                      },
                      {
                        label: "delete",
                        icon: <Trash2 />,
                        variant: "contained",
                        action: () => {
                          handleDelete();
                        },
                      },
                    ])
                  }
                />
                <EndEditButton onClick={hasChanges ? stopEditingWithUnsavedChanges : stopEditing} />
              </>
            ) : (
              <EditButton onClick={startEditing} />
            )}
          </>
        )}
      </Stack>
      <ExportDialog
        isExporting={isExporting}
        setIsExporting={setIsExporting}
        selectionModel={[borehole.id]}
        fileName={borehole.name?.replace(/\s/g, "_") ?? "export"}
      />
    </DetailHeaderStack>
  );
};

export default DetailHeader;
