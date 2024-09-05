import { useContext } from "react";
import { Chip, IconButton, Stack, Typography } from "@mui/material";
import { theme } from "../../AppTheme.ts";
import { useHistory } from "react-router-dom";
import { DeleteButton, EditButton, EndEditButton } from "../../components/buttons/buttons.tsx";
import { useDispatch, useSelector } from "react-redux";
import { Borehole, ReduxRootState } from "../../api-lib/ReduxStateInterfaces.ts";
import { deleteBorehole, lockBorehole, unlockBorehole } from "../../api-lib";
import { useTranslation } from "react-i18next";
import { PromptContext } from "../../components/prompt/promptContext.tsx";
import { Check, ChevronLeft, Trash2 } from "lucide-react";

interface DetailHeaderProps {
  editingEnabled: boolean;
  setEditingEnabled: (editingEnabled: boolean) => void;
  editableByCurrentUser: boolean;
}

const DetailHeader = ({ editingEnabled, setEditingEnabled, editableByCurrentUser }: DetailHeaderProps) => {
  const borehole: Borehole = useSelector((state: ReduxRootState) => state.core_borehole);
  const user = useSelector((state: ReduxRootState) => state.core_user);
  const history = useHistory();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { showPrompt } = useContext(PromptContext);

  const toggleEditing = (editingEnabled: boolean) => {
    setEditingEnabled(editingEnabled);
    if (borehole.data.lock !== null && borehole.data.lock.id === user.data.id) {
      dispatch(unlockBorehole(borehole.data.id));
    } else if (borehole.data.lock === null) {
      dispatch(lockBorehole(borehole.data.id));
    }
  };

  const startEditing = () => {
    toggleEditing(true);
  };

  const stopEditing = () => {
    toggleEditing(false);
  };

  const handleDelete = async () => {
    await deleteBorehole(borehole.data.id);
    history.push("/");
  };

  if (borehole.isFetching) {
    return;
  }

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
        <Typography variant="h2"> {borehole?.data.extended.original_name}</Typography>
        <Chip
          sx={{ marginLeft: "18px" }}
          label={t(`status${borehole?.data.workflow?.role.toLowerCase()}`)}
          color={borehole?.data.workflow?.finished != null ? "success" : "warning"}
          icon={borehole?.data.workflow?.finished != null ? <Check /> : <div />}
        />
      </Stack>
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
            <EndEditButton onClick={stopEditing} sx={{ marginLeft: "5px" }} />
          </>
        ) : (
          <EditButton onClick={startEditing} />
        ))}
    </Stack>
  );
};

export default DetailHeader;
