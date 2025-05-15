import { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Chip, Stack, Typography } from "@mui/material";
import { ArrowDownToLine, Check, Trash2, X } from "lucide-react";
import { deleteBorehole, lockBorehole, unlockBorehole } from "../../api-lib";
import { BoreholeV2 } from "../../api/borehole.ts";
import { useAuth } from "../../auth/useBdmsAuth.tsx";
import {
  DeleteButton,
  EditButton,
  EndEditButton,
  ExportButton,
  ReturnButton,
} from "../../components/buttons/buttons.tsx";
import { DateText } from "../../components/dateText.tsx";
import { ExportDialog } from "../../components/export/exportDialog.tsx";
import { PromptContext } from "../../components/prompt/promptContext.tsx";
import { DetailHeaderStack } from "../../components/styledComponents.ts";
import { DetailContext, DetailContextProps } from "./detailContext.tsx";
import { SaveContext, SaveContextProps } from "./saveContext.tsx";

interface DetailHeaderProps {
  editableByCurrentUser: boolean;
  borehole: BoreholeV2;
}

const DetailHeader = ({ editableByCurrentUser, borehole }: DetailHeaderProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const { showPrompt } = useContext(PromptContext);
  const { editingEnabled, setEditingEnabled } = useContext<DetailContextProps>(DetailContext);
  const { hasChanges, triggerReset } = useContext<SaveContextProps>(SaveContext);
  const auth = useAuth();

  const toggleEditing = (editing: boolean) => {
    if (!editing) {
      // @ts-expect-error legacy API methods will not be typed, as they are going to be removed
      dispatch(unlockBorehole(borehole.id));
    } else {
      // @ts-expect-error legacy API methods will not be typed, as they are going to be removed
      dispatch(lockBorehole(borehole.id));
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

  const handleDelete = async () => {
    await deleteBorehole(borehole.id);
    navigate("/");
  };

  const handleReturnClick = () => {
    if (editingEnabled) {
      if (hasChanges) {
        stopEditingWithUnsavedChanges();
      } else {
        stopEditing();
      }
    }
    navigate("/");
  };

  // get unfinished or latest workflow
  const workflows = borehole?.workflows.sort((a, b) => new Date(b.finished).getTime() - new Date(a.finished).getTime());
  const currentWorkflow = workflows?.find(workflow => workflow.finished == null) || workflows[0];
  const hasDevFlag = searchParams.get("dev") === "true";
  const statusLabel = hasDevFlag
    ? t(`statuses.${borehole.workflow?.status}`)
    : t(`status${currentWorkflow.role.toLowerCase()}`);

  return (
    <DetailHeaderStack direction="row" alignItems="center">
      <Stack direction="row" sx={{ flex: "1 1 100%" }} alignItems={"center"} gap={3}>
        <ReturnButton onClick={handleReturnClick} />
        <Stack>
          <Typography variant="h2"> {borehole?.name}</Typography>
          {!auth.anonymousModeEnabled && (
            <Typography variant={"subtitle2"}>
              {t("lastUpdated")}: <DateText date={borehole?.updated} /> {t("by")} {borehole?.updatedBy?.name}
            </Typography>
          )}
        </Stack>
        {workflows && (
          <Chip
            data-cy="workflow-status-chip"
            label={statusLabel}
            color={currentWorkflow.finished != null ? "success" : "warning"}
            icon={currentWorkflow.finished != null ? <Check /> : <div />}
          />
        )}
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
