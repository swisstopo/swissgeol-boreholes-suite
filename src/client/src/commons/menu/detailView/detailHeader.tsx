import { IconButton, Stack, Typography } from "@mui/material";
import { theme } from "../../../AppTheme";
import ArrowLeftIcon from "../../../../public/icons/arrow_left.svg?react";
import { useContext, useEffect, useState } from "react";
import { BoreholeDetailContext } from "../../../components/form/boreholeDetailContext";
import { useHistory } from "react-router-dom";
import { DeleteButton, EditButton, EndEditButton } from "../../../components/buttons/buttons";
import { ConfirmDeleteModal } from "./confirmDeleteModal";
import { useDispatch, useSelector } from "react-redux";
import { Borehole, ReduxRootState } from "../../../ReduxStateInterfaces";
import { lockBorehole, unlockBorehole } from "../../../api-lib";

const DetailHeader = () => {
  const [editingEnabled, setEditingEnabled] = useState(false);
  const [editableByCurrentUser, setEditableByCurrentUser] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const boreholeDetailContext = useContext(BoreholeDetailContext);
  const borehole: Borehole = useSelector((state: ReduxRootState) => state.core_borehole);
  const user = useSelector((state: ReduxRootState) => state.core_user);
  const history = useHistory();
  const dispatch = useDispatch();

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
    const matchingWorkgroup = user.data.workgroups.find(workgroup => workgroup.id === borehole.data.workgroup?.id);
    if (matchingWorkgroup && Object.prototype.hasOwnProperty.call(matchingWorkgroup, "roles")) {
      setEditableByCurrentUser(matchingWorkgroup.roles.includes(borehole.data.role));
    }
  }, [editingEnabled, user, borehole]);

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
        <Typography variant="h2"> {boreholeDetailContext.currentBorehole?.data.extended.original_name}</Typography>
      </Stack>
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
      {editableByCurrentUser &&
        (editingEnabled ? <EndEditButton onClick={stopEditing} /> : <EditButton onClick={startEditing} />)}
    </Stack>
  );
};

export default DetailHeader;
