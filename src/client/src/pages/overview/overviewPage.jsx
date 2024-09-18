import { useContext, useEffect, useState } from "react";
import { useLocation, withRouter } from "react-router-dom";
import MainSideNav from "./layout/mainSideNav.tsx";
import { MapView } from "./layout/mapView.tsx";
import { SideDrawer } from "./layout/sideDrawer.tsx";
import FilterComponent from "./sidePanelContent/filter/filterComponent.jsx";
import NewBoreholePanel from "./sidePanelContent/newBoreholePanel.tsx";
import { DrawerContentTypes } from "./overviewPageInterfaces.ts";
import { AlertContext } from "../../components/alert/alertContext.tsx";
import CustomLayersPanel from "./sidePanelContent/customLayers/customLayersPanel.jsx";
import { LayoutBox, MainContentBox, SidebarBox } from "../../components/styledComponents.ts";

const OverviewPage = () => {
  const [sideDrawerOpen, setSideDrawerOpen] = useState(false);
  const location = useLocation();
  const [workgroupId, setWorkgroupId] = useState(0);
  const [enabledWorkgroups, setEnabledWorkgroups] = useState([]);
  const [sideDrawerContent, setSideDrawerContent] = useState(DrawerContentTypes.Filters);
  const { showAlert } = useContext(AlertContext);

  const toggleSideDrawer = open => {
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
  };

  useEffect(() => {
    // Close the side drawer when the route changes
    setSideDrawerOpen(false);
  }, [location.pathname]);

  return (
    <LayoutBox>
      <SidebarBox>
        <MainSideNav
          workgroupId={workgroupId}
          setWorkgroupId={setWorkgroupId}
          enabledWorkgroups={enabledWorkgroups}
          setEnabledWorkgroups={setEnabledWorkgroups}
          toggleDrawer={toggleSideDrawer}
          drawerOpen={sideDrawerOpen}
          setSideDrawerContent={setSideDrawerContent}
          sideDrawerContent={sideDrawerContent}
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

const OverviewPageWithRouter = withRouter(OverviewPage);
export default OverviewPageWithRouter;
