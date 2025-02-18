import { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "react-query";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
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
import { ExportDialog } from "../../components/export/exportDialog.tsx";
import DateText from "../../components/legacyComponents/dateText";
import { PromptContext } from "../../components/prompt/promptContext.tsx";
import { DetailHeaderStack } from "../../components/styledComponents.ts";
import { useFormDirtyStore } from "./formDirtyStore.ts";

interface DetailHeaderProps {
  editableByCurrentUser: boolean;
  borehole: BoreholeV2;
  triggerReset: () => void;
  editingEnabled?: boolean;
}

const DetailHeader = ({ editableByCurrentUser, triggerReset, borehole, editingEnabled }: DetailHeaderProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const history = useHistory();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { showPrompt } = useContext(PromptContext);
  const isFormDirty = useFormDirtyStore(state => state.isFormDirty);
  const auth = useAuth();
  const queryClient = useQueryClient();

  const toggleEditing = async (editing: boolean) => {
    if (!editing) {
      await dispatch(unlockBorehole(borehole.id));
      await queryClient.invalidateQueries(["borehole", borehole.id]);
    } else {
      await dispatch(lockBorehole(borehole.id));
      await queryClient.invalidateQueries(["borehole", borehole.id]);
    }
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
    showPrompt(t("messageDiscardUnsavedChanges"), [
      {
        label: t("cancel"),
        icon: <X />,
        variant: "outlined",
      },
      {
        label: t("discardchanges"),
        icon: <Trash2 />,
        variant: "contained",
        action: resetFormAndStopEditing,
      },
    ]);
  };

  const startExportWithUnsavedChanges = () => {
    showPrompt(t("messageUnsavedChangesAtExport"), [
      {
        label: t("cancel"),
        icon: <X />,
        variant: "outlined",
      },
      {
        label: t("export"),
        icon: <ArrowDownToLine />,
        variant: "contained",
        action: () => setIsExporting(true),
      },
    ]);
  };

  const handleDelete = async () => {
    await deleteBorehole(borehole.id);
    history.push("/");
  };

  // get unfinished or latest workflow
  const workflows = borehole?.workflows.sort((a, b) => new Date(b.finished).getTime() - new Date(a.finished).getTime());
  const currentWorkflow = workflows?.find(workflow => workflow.finished == null) || workflows[0];

  return (
    <DetailHeaderStack direction="row" alignItems="center">
      <Stack direction="row" sx={{ flex: "1 1 100%" }} alignItems={"center"}>
        <ReturnButton
          onClick={() => {
            {
              editingEnabled && (isFormDirty ? stopEditingWithUnsavedChanges() : stopEditing());
              history.push("/");
            }
          }}
        />
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
            sx={{ marginLeft: "18px" }}
            label={t(`status${currentWorkflow.role.toLowerCase()}`)}
            color={currentWorkflow.finished != null ? "success" : "warning"}
            icon={currentWorkflow.finished != null ? <Check /> : <div />}
          />
        )}
      </Stack>
      <Stack direction="row" data-cy="detail-header" gap={2}>
        <ExportButton
          label="export"
          onClick={isFormDirty ? startExportWithUnsavedChanges : () => setIsExporting(true)}
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
                        label: t("cancel"),
                      },
                      {
                        label: t("delete"),
                        icon: <Trash2 />,
                        variant: "contained",
                        action: () => {
                          handleDelete();
                        },
                      },
                    ])
                  }
                />
                <EndEditButton onClick={isFormDirty ? stopEditingWithUnsavedChanges : stopEditing} />
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
