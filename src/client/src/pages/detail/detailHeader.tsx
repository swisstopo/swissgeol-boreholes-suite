import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { Chip, IconButton, Stack, Typography } from "@mui/material";
import { Check, ChevronLeft, Trash2, X } from "lucide-react";
import { deleteBorehole, lockBorehole, unlockBorehole } from "../../api-lib";
import { BoreholeV2 } from "../../api/borehole.ts";
import { theme } from "../../AppTheme.ts";
import { DeleteButton, EditButton, EndEditButton } from "../../components/buttons/buttons.tsx";
import { PromptContext } from "../../components/prompt/promptContext.tsx";

interface DetailHeaderProps {
  editingEnabled: boolean;
  setEditingEnabled: (editingEnabled: boolean) => void;
  editableByCurrentUser: boolean;
  borehole: BoreholeV2;
  isFormDirty: boolean;
  triggerReset: () => void;
}

const DetailHeader = ({
  editingEnabled,
  setEditingEnabled,
  editableByCurrentUser,
  isFormDirty,
  triggerReset,
  borehole,
}: DetailHeaderProps) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { showPrompt } = useContext(PromptContext);

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

  const resetFormAndStopEditing = () => {
    triggerReset();
    toggleEditing(false);
  };

  const stopEditing = () => {
    if (isFormDirty) {
      showPrompt(t("messageDiscardUnsavedChanges"), [
        {
          label: t("cancel"),
          icon: <X />,
          variant: "outlined",
        },
        {
          label: t("discardChanges"),
          icon: <Trash2 />,
          variant: "contained",
          action: resetFormAndStopEditing,
        },
      ]);
    } else {
      toggleEditing(false);
    }
  };

  const handleDelete = async () => {
    await deleteBorehole(borehole.id);
    history.push("/");
  };

  return (
    <Stack
      direction="row"
      alignItems="center"
      sx={{
        borderBottom: "1px solid " + theme.palette.boxShadow,
        height: "84px",
        padding: "16px",
      }}>
      <Stack direction="row" sx={{ flex: "1 1 100%" }}>
        <IconButton
          color="primary"
          data-cy="backButton"
          onClick={() => {
            stopEditing();
            history.push("/");
          }}
          sx={{
            width: "36px",
            height: "36px",
            marginRight: "18px",
            borderRadius: "2px",
          }}>
          <ChevronLeft />
        </IconButton>
        <Typography variant="h2"> {borehole?.originalName}</Typography>
        <Chip
          sx={{ marginLeft: "18px" }}
          label={t(`status${borehole?.workflow?.role.toLowerCase()}`)}
          color={borehole?.workflow?.finished != null ? "success" : "warning"}
          icon={borehole?.workflow?.finished != null ? <Check /> : <div />}
        />
      </Stack>
      <Stack direction="row" gap={2}>
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
              <EndEditButton onClick={stopEditing} />
            </>
          ) : (
            <EditButton onClick={startEditing} />
          ))}
      </Stack>
    </Stack>
  );
};

export default DetailHeader;
