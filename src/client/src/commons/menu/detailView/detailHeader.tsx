import { useEffect, useState } from "react";
import { Chip, IconButton, Stack, Typography } from "@mui/material";
import { theme } from "../../../AppTheme";
import ArrowLeftIcon from "../../../../public/icons/arrow_left.svg?react";
import CheckmarkIcon from "../../../../public/icons/checkmark.svg?react";
import { useHistory, useLocation } from "react-router-dom";
import { DeleteButton, EditButton, EndEditButton } from "../../../components/buttons/buttons";
import { ConfirmDeleteModal } from "./confirmDeleteModal";
import { useDispatch, useSelector } from "react-redux";
import { Borehole, ReduxRootState } from "../../../ReduxStateInterfaces";
import { lockBorehole, unlockBorehole } from "../../../api-lib";
import { useTranslation } from "react-i18next";

const DetailHeader = () => {
  const [editingEnabled, setEditingEnabled] = useState(false);
  const [editableByCurrentUser, setEditableByCurrentUser] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const borehole: Borehole = useSelector((state: ReduxRootState) => state.core_borehole);
  const user = useSelector((state: ReduxRootState) => state.core_user);
  const history = useHistory();
  const location = useLocation();
  const dispatch = useDispatch();
  const { t } = useTranslation();

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

  const handleClose = () => {
    setConfirmDelete(false);
  };

  useEffect(() => {
    setEditingEnabled(borehole.data.lock !== null);
  }, [borehole.data.lock]);

  useEffect(() => {
    const isStatusPage = location.pathname.endsWith("status");
    const isBoreholeWorkflowFinished = borehole?.data.workflow?.finished !== null;

    if (
      (borehole.data.lock !== null && borehole.data.lock.id !== user.data.id) ||
      (isBoreholeWorkflowFinished && !isStatusPage)
    ) {
      setEditableByCurrentUser(false);
      return;
    }
    const matchingWorkgroup = user.data.workgroups.find(workgroup => workgroup.id === borehole.data.workgroup?.id);
    if (matchingWorkgroup && Object.prototype.hasOwnProperty.call(matchingWorkgroup, "roles")) {
      setEditableByCurrentUser(matchingWorkgroup.roles.includes(borehole.data.role));
    }
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
            <ConfirmDeleteModal
              onClose={handleClose}
              open={confirmDelete}
              trigger={
                <div style={{ marginRight: "13px" }}>
                  <DeleteButton label="deleteBorehole" onClick={() => setConfirmDelete(true)} />
                </div>
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
