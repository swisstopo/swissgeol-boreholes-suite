import { useContext, useEffect, useState } from "react";
import { Chip, IconButton, Stack, Typography } from "@mui/material";
import { theme } from "../../AppTheme.ts";
import ArrowLeftIcon from "../../assets/icons/arrow_left.svg?react";
import CheckmarkIcon from "../../assets/icons/checkmark.svg?react";
import TrashIcon from "../../assets/icons/trash.svg?react";
import { useHistory, useLocation } from "react-router-dom";
import { DeleteButton, EditButton, EndEditButton } from "../../components/buttons/buttons.tsx";
import { useDispatch, useSelector } from "react-redux";
import { Borehole, ReduxRootState } from "../../api-lib/ReduxStateInterfaces.ts";
import { deleteBorehole, lockBorehole, unlockBorehole } from "../../api-lib";
import { useTranslation } from "react-i18next";
import { PromptContext } from "../../components/prompt/promptContext.tsx";

const DetailHeader = () => {
  const [editingEnabled, setEditingEnabled] = useState(false);
  const [editableByCurrentUser, setEditableByCurrentUser] = useState(false);
  const borehole: Borehole = useSelector((state: ReduxRootState) => state.core_borehole);
  const user = useSelector((state: ReduxRootState) => state.core_user);
  const history = useHistory();
  const location = useLocation();
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

  useEffect(() => {
    setEditingEnabled(borehole.data.lock !== null);
  }, [borehole.data.lock]);

  useEffect(() => {
    if (borehole.data.lock !== null && borehole.data.lock.id !== user.data.id) {
      setEditableByCurrentUser(false);
      return;
    }

    const matchingWorkgroup =
      user.data.workgroups.find(workgroup => workgroup.id === borehole.data.workgroup?.id) ?? false;
    const userRoleMatches =
      matchingWorkgroup &&
      Object.prototype.hasOwnProperty.call(matchingWorkgroup, "roles") &&
      matchingWorkgroup.roles.includes(borehole.data.role);
    const isStatusPage = location.pathname.endsWith("/status");
    const isBoreholeInEditWorkflow = borehole?.data.workflow?.role === "EDIT";

    setEditableByCurrentUser(userRoleMatches && (isStatusPage || isBoreholeInEditWorkflow));
  }, [editingEnabled, user, borehole, location]);

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
          data-cy="backButton"
          onClick={() => {
            history.push("/");
          }}
          sx={{
            backgroundColor: theme.palette.primary.main,
            color: "white",
            width: "36px",
            height: "36px",
            marginRight: "18px",
            borderRadius: "2px",
            "&:hover": {
              opacity: 0.7,
              backgroundColor: theme.palette.primary.main,
            },
          }}>
          <ArrowLeftIcon />
        </IconButton>
        <Typography variant="h2"> {borehole?.data.extended.original_name}</Typography>
        <Chip
          sx={{ marginLeft: "18px" }}
          label={t(`status${borehole?.data.workflow?.role.toLowerCase()}`)}
          color={borehole?.data.workflow?.finished != null ? "success" : "warning"}
          icon={borehole?.data.workflow?.finished != null ? <CheckmarkIcon /> : <div />}
        />
      </Stack>
      {editableByCurrentUser && (
        <>
          {editingEnabled && (
            <DeleteButton
              label="deleteBorehole"
              onClick={() =>
                showPrompt(t("deleteBoreholeMessage"), [
                  {
                    label: t("cancel"),
                  },
                  {
                    label: t("delete"),
                    icon: <TrashIcon />,
                    variant: "contained",
                    action: () => {
                      handleDelete();
                    },
                  },
                ])
              }
            />
          )}
          {editingEnabled ? <EndEditButton onClick={stopEditing} /> : <EditButton onClick={startEditing} />}
        </>
      )}
    </Stack>
  );
};

export default DetailHeader;
