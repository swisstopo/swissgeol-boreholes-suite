import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { Chip, Stack, Typography } from "@mui/material";
import { Check, Trash2, X } from "lucide-react";
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
import DateText from "../../components/legacyComponents/dateText";
import { PromptContext } from "../../components/prompt/promptContext.tsx";
import { DetailHeaderStack } from "../../components/styledComponents.ts";
import { useFormDirty } from "./FormDirtyContext.tsx";

interface DetailHeaderProps {
  editingEnabled: boolean;
  setEditingEnabled: (editingEnabled: boolean) => void;
  editableByCurrentUser: boolean;
  borehole: BoreholeV2;
  triggerReset: () => void;
}

const DetailHeader = ({
  editingEnabled,
  setEditingEnabled,
  editableByCurrentUser,
  triggerReset,
  borehole,
}: DetailHeaderProps) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { showPrompt } = useContext(PromptContext);
  const { isFormDirty } = useFormDirty();
  const auth = useAuth();

  const toggleEditing = (editing: boolean) => {
    if (!editing) {
      dispatch(unlockBorehole(borehole.id));
    } else {
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

  const handleDelete = async () => {
    await deleteBorehole(borehole.id);
    history.push("/");
  };

  const handleExport = () => {
    const jsonString = JSON.stringify(borehole, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const name_without_spaces = borehole.alternateName.replace(/\s/g, "_");
    link.download = `${name_without_spaces}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

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
          <Typography variant="h2"> {borehole?.alternateName}</Typography>
          {!auth.anonymousModeEnabled && (
            <Typography variant={"subtitle2"}>
              {t("lastUpdated")}: <DateText date={borehole?.updated} /> {t("by")} {borehole?.updatedBy?.name}
            </Typography>
          )}
        </Stack>
        <Chip
          sx={{ marginLeft: "18px" }}
          label={t(`status${borehole?.workflows[borehole?.workflows.length - 1]?.role.toLowerCase()}`)}
          color={borehole?.workflows[borehole?.workflows.length - 1]?.finished != null ? "success" : "warning"}
          icon={borehole?.workflows[borehole?.workflows.length - 1]?.finished != null ? <Check /> : <div />}
        />
      </Stack>
      <Stack direction="row" data-cy="detail-header" gap={2}>
        {editableByCurrentUser &&
          (editingEnabled ? (
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
            <>
              <ExportButton onClick={handleExport} />
              <EditButton onClick={startEditing} />
            </>
          ))}
      </Stack>
    </DetailHeaderStack>
  );
};

export default DetailHeader;
