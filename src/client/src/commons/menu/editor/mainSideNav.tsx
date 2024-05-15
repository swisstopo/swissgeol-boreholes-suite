import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { IconButton, Stack } from "@mui/material";
import ActionsModal from "./actions/actionsModal";
import { ImportErrorModal } from "./menuComponents/importErrorModal";
import Filter from "../../../../public/icons/filter.svg?react";
import AddIcon from "../../../../public/icons/add.svg?react";
import UploadIcon from "../../../../public/icons/upload.svg?react";
import SettingsIcon from "../../../../public/icons/settings.svg?react";
import HelpIcon from "../../../../public/icons/help.svg?react";
import { theme } from "../../../AppTheme";
import { styled } from "@mui/system";
import { ProfilePopup } from "../profilePopup";
import { ErrorResponse, MainSideNavProps } from "./menuComponents/menuComponentInterfaces";
import { ReduxRootState, User, Workgroup } from "../../../ReduxStateInterfaces";

const StyledIconButton = styled(IconButton)({
  padding: "10px",
  marginBottom: "25px",
  color: theme.palette.primary.main,
  "&:hover": {
    backgroundColor: theme.palette.background.lightgrey,
  },
  borderRadius: "10px",
});

const selectedButtonStyle = {
  color: theme.palette.primary.contrastText,
  backgroundColor: theme.palette.buttonSelected + " !important",
};

const MainSideNav = ({ toggleDrawer, drawerOpen }: MainSideNavProps) => {
  const history = useHistory();
  const menuRef = useRef(null);
  const [creating, setCreating] = useState<boolean>(false);
  const [enabledWorkgroups, setEnabledWorkgroups] = useState<Workgroup[]>([]);
  const [modal, setModal] = useState<boolean>(false);
  const [upload, setUpload] = useState<boolean>(false);
  const [validationErrorModal, setValidationErrorModal] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<Blob[] | null>(null);
  const [selectedBoreholeAttachments, setSelectedBoreholeAttachments] = useState<Blob[] | null>(null);
  const [selectedLithologyFile, setSelectedLithologyFile] = useState<Blob[] | null>(null);
  const [workgroup, setWorkgroup] = useState<number | null>(null);
  const [errorsResponse, setErrorsResponse] = useState<ErrorResponse | null>(null);
  // Redux state
  const user: User = useSelector((state: ReduxRootState) => state.core_user);
  // Redux actions
  const dispatch = useDispatch();
  const refresh = () => {
    dispatch({ type: "SEARCH_EDITOR_FILTER_REFRESH" });
  };

  useEffect(() => {
    const wgs = user.data.workgroups.filter(w => w.disabled === null && w.supplier === false);
    setEnabledWorkgroups(wgs);
    setWorkgroup(wgs.length > 0 ? wgs[0].id : null);
  }, [user.data.workgroups]);

  const handleToggleFilter = () => {
    toggleDrawer(!drawerOpen);
  };

  return (
    <Stack
      direction="column"
      sx={{
        boxShadow: theme.palette.boxShadow + " 2px 6px 6px 0px",
        width: "80px",
        height: "100%",
        position: "relative",
      }}>
      <Stack
        direction="column"
        ref={menuRef}
        sx={{
          padding: "1em",
          flex: "1 1 100%",
        }}>
        <StyledIconButton
          data-cy="show-filter-button"
          onClick={handleToggleFilter}
          sx={drawerOpen ? selectedButtonStyle : {}}>
          <Filter />
        </StyledIconButton>
        <StyledIconButton
          data-cy="new-borehole-button"
          onClick={() => {
            setModal(true);
            setUpload(false);
          }}
          disabled={user.data.roles.indexOf("EDIT") === -1}>
          <AddIcon />
        </StyledIconButton>
        <StyledIconButton
          data-cy="import-borehole-button"
          onClick={() => {
            setModal(true);
            setUpload(true);
          }}
          disabled={user.data.roles.indexOf("EDIT") === -1}>
          <UploadIcon />
        </StyledIconButton>
      </Stack>
      <Stack
        direction="column"
        sx={{
          padding: "1em",
        }}>
        <StyledIconButton data-cy="settings-button" onClick={() => history.push(`/setting`)}>
          <SettingsIcon />
        </StyledIconButton>
        <StyledIconButton>
          <ProfilePopup user={user.data} />
        </StyledIconButton>
        <StyledIconButton>
          <HelpIcon onClick={() => window.open(`/help`)} />
        </StyledIconButton>
      </Stack>
      <ActionsModal
        creating={creating}
        setCreating={setCreating}
        setModal={setModal}
        setUpload={setUpload}
        setErrorsResponse={setErrorsResponse}
        setValidationErrorModal={setValidationErrorModal}
        refresh={refresh}
        setSelectedFile={setSelectedFile}
        setSelectedLithologyFile={setSelectedLithologyFile}
        setWorkgroup={setWorkgroup}
        enabledWorkgroups={enabledWorkgroups}
        setSelectedBoreholeAttachments={setSelectedBoreholeAttachments}
        workgroup={workgroup}
        selectedFile={selectedFile}
        selectedBoreholeAttachments={selectedBoreholeAttachments}
        modal={modal}
        upload={upload}
        selectedLithologyFile={selectedLithologyFile}
      />
      <ImportErrorModal
        setValidationErrorModal={setValidationErrorModal}
        validationErrorModal={validationErrorModal}
        errorResponse={errorsResponse}
      />
    </Stack>
  );
};

export default MainSideNav;
