import { useContext, useEffect, useState } from "react";
import { useLocation, withRouter } from "react-router-dom";
import { AlertContext } from "../../components/alert/alertContext.tsx";
import { LayoutBox, MainContentBox, SidebarBox } from "../../components/styledComponents.ts";
import MainSideNav from "./layout/mainSideNav.tsx";
import { MapView } from "./layout/mapView.tsx";
import { SideDrawer } from "./layout/sideDrawer.tsx";
import { DrawerContentTypes } from "./overviewPageInterfaces.ts";
import CustomLayersPanel from "./sidePanelContent/customLayers/customLayersPanel.jsx";
import FilterComponent from "./sidePanelContent/filter/filterComponent.jsx";
import NewBoreholePanel from "./sidePanelContent/newBoreholePanel.tsx";

const OverviewPage = () => {
  const [sideDrawerOpen, setSideDrawerOpen] = useState(false);
  const location = useLocation();
  const [workgroup, setWorkgroup] = useState(0);
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
        workgroup={workgroup}
        setWorkgroup={setWorkgroup}
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
          workgroup={workgroup}
          setWorkgroup={setWorkgroup}
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
