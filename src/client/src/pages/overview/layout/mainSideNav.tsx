import { useContext, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { Badge, Stack } from "@mui/material";
import { ImportErrorModal } from "../../../commons/menu/mainView/menuComponents/importErrorModal.tsx";
import FilterIcon from "../../../assets/icons/filter.svg?react";
import AddIcon from "../../../assets/icons/add.svg?react";
import UploadIcon from "../../../assets/icons/upload.svg?react";
import SettingsIcon from "../../../assets/icons/settings.svg?react";
import HelpIcon from "../../../assets/icons/help.svg?react";
import LayersIcon from "../../../assets/icons/layers.svg?react";
import { theme } from "../../../AppTheme.ts";
import ImportModal from "../../../commons/menu/mainView/actions/importModal.tsx";
import { DrawerContentTypes } from "../overviewPageInterfaces.ts";
import { ErrorResponse, MainSideNavProps } from "../../../commons/filter/menuItemsInterfaces.ts";
import { ReduxRootState, User } from "../../../api-lib/ReduxStateInterfaces.ts";
import { FilterContext } from "../../../components/filter/filterContext.tsx";
import { useTranslation } from "react-i18next";
import { NavButton } from "../../../components/buttons/navButton.tsx";

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
  const { t } = useTranslation();
  const [creating, setCreating] = useState<boolean>(false);
  const [modal, setModal] = useState<boolean>(false);
  const [upload, setUpload] = useState<boolean>(false);
  const [validationErrorModal, setValidationErrorModal] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<Blob[] | null>(null);
  const [selectedBoreholeAttachments, setSelectedBoreholeAttachments] = useState<Blob[] | null>(null);
  const [selectedLithologyFile, setSelectedLithologyFile] = useState<Blob[] | null>(null);
  const [errorsResponse, setErrorsResponse] = useState<ErrorResponse | null>(null);
  const filterContext = useContext(FilterContext);

  // Redux state
  const user: User = useSelector((state: ReduxRootState) => state.core_user);
  // Redux actions
  const dispatch = useDispatch();
  const refresh = () => {
    dispatch({ type: "SEARCH_EDITOR_FILTER_REFRESH" });
  };

  useEffect(() => {
    const wgs = user.data.workgroups.filter(w => w.disabled === null && !w.supplier && w.roles.includes("EDIT"));
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
  const activeFilterCount = filterContext.activeFilterLength + (filterContext.filterPolygon === null ? 0 : 1);

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
        {activeFilterCount > 0 && <Badge sx={{ margin: "1px" }} badgeContent={activeFilterCount}></Badge>}
        <NavButton
          data-cy="show-filter-button"
          icon={<FilterIcon />}
          label={t("searchfilters")}
          selected={isFilterPanelVisible}
          onClick={handleToggleFilter}
        />
        <NavButton
          data-cy="new-borehole-button"
          icon={<AddIcon />}
          label={t("add")}
          selected={isAddPanelVisible}
          disabled={user.data.roles.indexOf("EDIT") === -1}
          onClick={handleToggleAdd}
        />
        <NavButton
          data-cy="import-borehole-button"
          icon={<UploadIcon />}
          label={t("upload")}
          disabled={user.data.roles.indexOf("EDIT") === -1}
          onClick={() => {
            toggleDrawer(false);
            setModal(true);
            setUpload(true);
          }}
        />
        <NavButton
          data-cy="layers-button"
          icon={<LayersIcon />}
          label={t("usersMap")}
          selected={isLayersPanelVisible}
          onClick={handleToggleLayers}
        />
      </Stack>
      <Stack
        direction="column"
        sx={{
          padding: "1em",
        }}>
        <NavButton
          data-cy="settings-button"
          icon={<SettingsIcon />}
          label={t("header_settings")}
          onClick={() => history.push(`/setting`)}
        />
        <NavButton
          data-cy="help-button"
          icon={<HelpIcon />}
          label={t("header_help")}
          onClick={() => window.open(`/help`)}
        />
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
