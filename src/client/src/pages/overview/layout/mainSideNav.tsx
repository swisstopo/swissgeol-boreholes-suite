import React, { useContext, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Badge, Stack } from "@mui/material";
import { Filter, Layers, Plus, Settings } from "lucide-react";
import HelpIcon from "../../../assets/icons/help.svg?react";
import UploadIcon from "../../../assets/icons/upload.svg?react";
import { useAuth } from "../../../auth/useBdmsAuth.tsx";
import { NavButton } from "../../../components/buttons/navButton.tsx";
import { useBoreholesNavigate } from "../../../hooks/useBoreholesNavigate.tsx";
import { DrawerContentTypes } from "../overviewPageInterfaces.ts";
import { ErrorResponse } from "../sidePanelContent/commons/actionsInterfaces.ts";
import { FilterContext } from "../sidePanelContent/filter/filterContext.tsx";
import { ImportErrorDialog } from "../sidePanelContent/importer/importErrorDialog.tsx";
import { useUserWorkgroups } from "../UserWorkgroupsContext.tsx";

export interface MainSideNavProps {
  toggleDrawer: (open: boolean) => void;
  drawerOpen: boolean;
  setSideDrawerContent: React.Dispatch<React.SetStateAction<DrawerContentTypes>>;
  sideDrawerContent: DrawerContentTypes;
  errorsResponse: ErrorResponse | null;
  errorDialogOpen: boolean;
  setErrorDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const MainSideNav = ({
  toggleDrawer,
  drawerOpen,
  setSideDrawerContent,
  sideDrawerContent,
  errorsResponse,
  errorDialogOpen,
  setErrorDialogOpen,
}: MainSideNavProps) => {
  const { navigateTo } = useBoreholesNavigate();
  const menuRef = useRef(null);
  const { t } = useTranslation();
  const auth = useAuth();
  const filterContext = useContext(FilterContext);
  const { enabledWorkgroups } = useUserWorkgroups();

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

  const handleToggleUpload = () => {
    handleDrawer(DrawerContentTypes.Import);
    setSideDrawerContent(DrawerContentTypes.Import);
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
  const isUploadPanelVisible = drawerOpen && sideDrawerContent === DrawerContentTypes.Import;
  const editingDisabled = enabledWorkgroups.length === 0;
  const activeFilterCount = filterContext.activeFilterLength + (filterContext.filterPolygon === null ? 0 : 1);

  return (
    <Stack
      direction="column"
      sx={{
        boxShadow: 3,
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
          icon={<Filter />}
          label={t("searchfilters")}
          selected={isFilterPanelVisible}
          onClick={handleToggleFilter}
        />
        {!auth.anonymousModeEnabled && (
          <>
            <NavButton
              data-cy="new-borehole-button"
              icon={<Plus />}
              label={t("add")}
              selected={isAddPanelVisible}
              disabled={editingDisabled}
              onClick={handleToggleAdd}
            />
            <NavButton
              data-cy="import-borehole-button"
              icon={<UploadIcon />}
              label={t("upload")}
              disabled={editingDisabled}
              selected={isUploadPanelVisible}
              onClick={handleToggleUpload}
            />
          </>
        )}
        <NavButton
          data-cy="layers-button"
          icon={<Layers />}
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
          icon={<Settings />}
          label={t("header_settings")}
          onClick={() => navigateTo({ path: `/setting` })}
        />
        {!auth.anonymousModeEnabled && (
          <NavButton
            data-cy="help-button"
            icon={<HelpIcon />}
            label={t("header_help")}
            onClick={() => window.open(`/help`)}
          />
        )}
      </Stack>
      <ImportErrorDialog open={errorDialogOpen} setOpen={setErrorDialogOpen} errorResponse={errorsResponse} />
    </Stack>
  );
};

export default MainSideNav;
