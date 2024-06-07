import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { IconButton, Stack } from "@mui/material";
import { ImportErrorModal } from "./menuComponents/importErrorModal";
import Filter from "../../../../public/icons/filter.svg?react";
import AddIcon from "../../../../public/icons/add.svg?react";
import UploadIcon from "../../../../public/icons/upload.svg?react";
import SettingsIcon from "../../../../public/icons/settings.svg?react";
import HelpIcon from "../../../../public/icons/help.svg?react";
import LayersIcon from "../../../../public/icons/layers.svg?react";
import { theme } from "../../../AppTheme";
import { styled } from "@mui/system";
import ImportModal from "./actions/importModal";
import { DrawerContentTypes } from "../../../pages/editor/editorComponentInterfaces";
import { ErrorResponse, MainSideNavProps } from "./menuComponents/menuComponentInterfaces";
import { ReduxRootState, User } from "../../../ReduxStateInterfaces";

const StyledIconButton = styled(IconButton)({
  padding: "10px",
  marginBottom: "25px",
  color: theme.palette.neutral.contrastText,
  "&:hover": {
    backgroundColor: theme.palette.background.lightgrey,
  },
  borderRadius: "10px",
});

const selectedButtonStyle = {
  color: theme.palette.primary.contrastText,
  backgroundColor: theme.palette.background.menuItemActive + " !important",
};

const MainSideNav = ({
  toggleDrawer,
  drawerOpen,
  workgroup,
  setWorkgroup,
  enabledWorkgroups,
  setEnabledWorkgroups,
  setSideDrawerContent,
  sideDrawerContent,
}: MainSideNavProps) => {
  const history = useHistory();
  const menuRef = useRef(null);
  const [creating, setCreating] = useState<boolean>(false);
  const [modal, setModal] = useState<boolean>(false);
  const [upload, setUpload] = useState<boolean>(false);
  const [validationErrorModal, setValidationErrorModal] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<Blob[] | null>(null);
  const [selectedBoreholeAttachments, setSelectedBoreholeAttachments] = useState<Blob[] | null>(null);
  const [selectedLithologyFile, setSelectedLithologyFile] = useState<Blob[] | null>(null);
  const [errorsResponse, setErrorsResponse] = useState<ErrorResponse | null>(null);
  // Redux state
  const user: User = useSelector((state: ReduxRootState) => state.core_user);
  // Redux actions
  const dispatch = useDispatch();
  const refresh = () => {
    dispatch({ type: "SEARCH_EDITOR_FILTER_REFRESH" });
  };

  useEffect(() => {
    const wgs = user.data.workgroups.filter(w => w.disabled === null && !w.supplier);
    setEnabledWorkgroups(wgs);
    setWorkgroup(wgs.length > 0 ? wgs[0].id : null);
  }, [setEnabledWorkgroups, setWorkgroup, user.data.workgroups]);

  const handleToggleFilter = () => {
    handleDrawer(DrawerContentTypes.Filters);
    setSideDrawerContent(DrawerContentTypes.Filters);
  };

  const handleToggleAdd = () => {
    handleDrawer(DrawerContentTypes.NewBorehole);
    setSideDrawerContent(DrawerContentTypes.NewBorehole);
  };

  const handleToggleLayers = () => {
    handleDrawer(DrawerContentTypes.CustomLayers);
    setSideDrawerContent(DrawerContentTypes.CustomLayers);
  };

  const handleDrawer = (buttonName: DrawerContentTypes) => {
    if (sideDrawerContent === buttonName) {
      toggleDrawer(!drawerOpen);
    } else {
      toggleDrawer(true);
    }
  };

  const isFilterPanelVisible = drawerOpen && sideDrawerContent === DrawerContentTypes.Filters;
  const isAddPanelVisible = drawerOpen && sideDrawerContent === DrawerContentTypes.NewBorehole;
  const isLayersPanelVisible = drawerOpen && sideDrawerContent === DrawerContentTypes.CustomLayers;

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
          sx={isFilterPanelVisible ? selectedButtonStyle : {}}>
          <Filter />
        </StyledIconButton>
        <StyledIconButton
          data-cy="new-borehole-button"
          onClick={handleToggleAdd}
          disabled={user.data.roles.indexOf("EDIT") === -1}
          sx={isAddPanelVisible ? selectedButtonStyle : {}}>
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
        <StyledIconButton
          data-cy="layers-button"
          onClick={handleToggleLayers}
          sx={isLayersPanelVisible ? selectedButtonStyle : {}}>
          <LayersIcon />
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
          <HelpIcon onClick={() => window.open(`/help`)} />
        </StyledIconButton>
      </Stack>
      <ImportModal
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
