import { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Workgroup } from "../../api-lib/ReduxStateInterfaces.ts";
import { AlertContext } from "../../components/alert/alertContext.tsx";
import { LayoutBox, MainContentBox, SidebarBox } from "../../components/styledComponents.ts";
import MainSideNav from "./layout/mainSideNav.tsx";
import { MapView } from "./layout/mapView.tsx";
import { SideDrawer } from "./layout/sideDrawer.tsx";
import { DrawerContentTypes } from "./overviewPageInterfaces.ts";
import { ErrorResponse } from "./sidePanelContent/commons/actionsInterfaces.ts";
import CustomLayersPanel from "./sidePanelContent/customLayers/customLayersPanel.jsx";
import FilterComponent from "./sidePanelContent/filter/filterComponent.jsx";
import ImportPanel from "./sidePanelContent/importer/importPanel.tsx";
import NewBoreholePanel from "./sidePanelContent/newBoreholePanel.tsx";

export const OverviewPage = () => {
  const [sideDrawerOpen, setSideDrawerOpen] = useState(false);
  const location = useLocation();
  const [workgroupId, setWorkgroupId] = useState("");
  const [enabledWorkgroups, setEnabledWorkgroups] = useState<Workgroup[]>([]);
  const [sideDrawerContent, setSideDrawerContent] = useState(DrawerContentTypes.Filters);
  const [errorsResponse, setErrorsResponse] = useState<ErrorResponse | null>(null);
  const [errorDialogOpen, setErrorDialogOpen] = useState<boolean>(false);

  const { showAlert } = useContext(AlertContext);

  const toggleSideDrawer = (open: boolean) => {
    setSideDrawerOpen(open);
  };

  const sideDrawerComponentMap = {
    filters: <FilterComponent toggleDrawer={toggleSideDrawer} />,
    newBorehole: (
      <NewBoreholePanel
        toggleDrawer={toggleSideDrawer}
        workgroupId={workgroupId}
        setWorkgroupId={setWorkgroupId}
        enabledWorkgroups={enabledWorkgroups}
      />
    ),
    customLayers: <CustomLayersPanel toggleDrawer={toggleSideDrawer} />,
    import: (
      <ImportPanel
        toggleDrawer={toggleSideDrawer}
        workgroupId={workgroupId}
        setWorkgroupId={setWorkgroupId}
        enabledWorkgroups={enabledWorkgroups}
        setErrorsResponse={setErrorsResponse}
        setErrorDialogOpen={setErrorDialogOpen}
      />
    ),
  };

  useEffect(() => {
    // Close the side drawer when the route changes
    setSideDrawerOpen(false);
  }, [location.pathname]);

  return (
    <LayoutBox>
      <SidebarBox>
        <MainSideNav
          setWorkgroupId={setWorkgroupId}
          setEnabledWorkgroups={setEnabledWorkgroups}
          toggleDrawer={toggleSideDrawer}
          drawerOpen={sideDrawerOpen}
          setSideDrawerContent={setSideDrawerContent}
          sideDrawerContent={sideDrawerContent}
          errorsResponse={errorsResponse}
          errorDialogOpen={errorDialogOpen}
          setErrorDialogOpen={setErrorDialogOpen}
        />
      </SidebarBox>
      <SideDrawer drawerOpen={sideDrawerOpen} drawerContent={sideDrawerComponentMap[sideDrawerContent]} />
      <MainContentBox>
        <MapView
          displayErrorMessage={message => {
            showAlert(message, "error");
          }}
        />
      </MainContentBox>
    </LayoutBox>
  );
};
