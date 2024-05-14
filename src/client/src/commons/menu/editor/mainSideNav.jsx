import { useState, useEffect, useRef } from "react";
import { connect } from "react-redux";
import { useHistory } from "react-router-dom";
import { Stack, IconButton } from "@mui/material";
import ActionsModal from "./actions/actionsModal";
import { ImportErrorModal } from "./menuComponents/importErrorModal";
import Filter from "../../../../public/icons/filter.svg?react";
import AddIcon from "../../../../public/icons/add.svg?react";
import UploadIcon from "../../../../public/icons/upload.svg?react";
import SettingsIcon from "../../../../public/icons/settings.svg?react";
import HelpIcon from "../../../../public/icons/help.svg?react";
import { theme } from "../../../AppTheme";
import { styled } from "@mui/system";
import { ProfilePopup } from "../profilePopup.tsx";

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

const MainSideNav = props => {
  const history = useHistory();
  const menuRef = useRef(null);
  const [creating, setCreating] = useState(false);
  const [enabledWorkgroups, setEnabledWorkgroups] = useState([]);
  const [modal, setModal] = useState(false);
  const [upload, setUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedBoreholeAttachments, setSelectedBoreholeAttachments] = useState(null);
  const [selectedLithologyFile, setSelectedLithologyFile] = useState(null);
  const [workgroup, setWorkgroup] = useState(null);
  const [validationErrorModal, setValidationErrorModal] = useState(false);
  const [errorsResponse, setErrorsResponse] = useState(null);

  useEffect(() => {
    const wgs = props.user.data.workgroups.filter(w => w.disabled === null && w.supplier === false);
    setEnabledWorkgroups(wgs);
    setWorkgroup(wgs.length > 0 ? wgs[0].id : null);
  }, [props.user.data.workgroups]);

  const handleToggleFilter = () => {
    props.toggleDrawer(!props.drawerOpen);
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
          sx={props.drawerOpen && selectedButtonStyle}>
          <Filter />
        </StyledIconButton>
        <StyledIconButton
          data-cy="new-borehole-button"
          onClick={() => {
            setModal(true);
            setUpload(false);
          }}
          disabled={props.user.data.roles.indexOf("EDIT") === -1}>
          <AddIcon />
        </StyledIconButton>
        <StyledIconButton
          data-cy="import-borehole-button"
          onClick={() => {
            setModal(true);
            setUpload(true);
          }}
          disabled={props.user.data.roles.indexOf("EDIT") === -1}>
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
          <ProfilePopup user={props.user.data} />
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
        refresh={props.refresh}
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

const mapStateToProps = state => {
  return {
    search: state.search,
    editor: state.editor,
    borehole: state.core_borehole,
    boreholes: state.core_borehole_editor_list,
    setting: state.setting,
    user: state.core_user,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    dispatch: dispatch,
    boreholeSelected: borehole => {
      dispatch({
        path: "/borehole",
        type: "CLEAR",
      });
      dispatch({
        type: "EDITOR_BOREHOLE_SELECTED",
        selected: borehole,
      });
    },
    refresh: () => {
      dispatch({
        type: "SEARCH_EDITOR_FILTER_REFRESH",
      });
    },
    reset: () => {
      dispatch({
        type: "SEARCH_EDITOR_FILTER_RESET",
      });
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MainSideNav);
