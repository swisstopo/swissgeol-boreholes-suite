import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { Chip, IconButton, Stack, Typography } from "@mui/material";
import { Check, ChevronLeft, Trash2, X } from "lucide-react";
import { deleteBorehole, lockBorehole, unlockBorehole } from "../../api-lib";
import { User } from "../../api/apiInterfaces.ts";
import { BoreholeV2 } from "../../api/borehole.ts";
import { theme } from "../../AppTheme.ts";
import { useAuth } from "../../auth/useBdmsAuth.tsx";
import { DeleteButton, EditButton, EndEditButton } from "../../components/buttons/buttons.tsx";
import DateText from "../../components/legacyComponents/dateText";
import { PromptContext } from "../../components/prompt/promptContext.tsx";

interface DetailHeaderProps {
  editingEnabled: boolean;
  setEditingEnabled: (editingEnabled: boolean) => void;
  editableByCurrentUser: boolean;
  borehole: BoreholeV2;
  updatedBy: User;
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
  updatedBy,
}: DetailHeaderProps) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { showPrompt } = useContext(PromptContext);
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

  return (
    <Stack
      direction="row"
      alignItems="center"
      sx={{
        borderBottom: "1px solid " + theme.palette.boxShadow,
        height: "84px",
        padding: "16px",
      }}>
      <Stack direction="row" sx={{ flex: "1 1 100%" }} alignItems={"center"}>
        <IconButton
          color="primary"
          data-cy="backButton"
          onClick={() => {
            {
              isFormDirty ? stopEditingWithUnsavedChanges() : stopEditing();
              history.push("/");
            }
          }}
          sx={{
            width: "36px",
            height: "36px",
            marginRight: "18px",
            borderRadius: "2px",
          }}>
          <ChevronLeft />
        </IconButton>
        <Typography variant="h2"> {borehole?.alternateName}</Typography>
        <Chip
          sx={{ marginLeft: "18px" }}
          label={t(`status${borehole?.workflows[borehole?.workflows.length - 1]?.role.toLowerCase()}`)}
          color={borehole?.workflows[borehole?.workflows.length - 1]?.finished != null ? "success" : "warning"}
          icon={borehole?.workflows[borehole?.workflows.length - 1]?.finished != null ? <Check /> : <div />}
        />
        {!auth.anonymousModeEnabled && (
          <Typography variant="body1" sx={{ marginLeft: "18px" }}>
            {t("updateDate")}: <DateText date={borehole?.updated} /> <br />
            {t("updatedBy")}: {updatedBy?.name}
          </Typography>
        )}
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
            <EditButton onClick={startEditing} />
          ))}
      </Stack>
    </Stack>
  );
};

export default DetailHeader;
