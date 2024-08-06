import { useContext, useEffect, useState } from "react";
import { useLocation, withRouter } from "react-router-dom";
import MainSideNav from "./layout/mainSideNav.tsx";
import MapView from "./layout/mapView.jsx";
import { SideDrawer } from "./layout/sideDrawer.tsx";
import FilterComponent from "../../commons/search/filterComponent.jsx";
import NewBoreholePanel from "../../commons/menu/mainView/sidePanelContent/newBoreholePanel.tsx";
import { DrawerContentTypes } from "./overviewPageInterfaces.ts";
import { AlertContext } from "../../components/alert/alertContext.tsx";
import CustomLayersPanel from "../../commons/menu/mainView/sidePanelContent/customLayers/customLayersPanel.jsx";
import { LayoutBox, MainContentBox, SidebarBox } from "../../components/styledComponents.js";

const OverviewPage = props => {
  const [sort, setSort] = useState(null);
  const [sideDrawerOpen, setSideDrawerOpen] = useState(false);
  const [bottomDrawerOpen, setBottomDrawerOpen] = useState(false);
  const location = useLocation();
  const [workgroup, setWorkgroup] = useState(0);
  const [enabledWorkgroups, setEnabledWorkgroups] = useState([]);
  const [sideDrawerContent, setSideDrawerContent] = useState(DrawerContentTypes.Filters);
  const { showAlert } = useContext(AlertContext);

  const toggleSideDrawer = open => {
    setSideDrawerOpen(open);
  };

  const toggleBottomDrawer = open => {
    setBottomDrawerOpen(open);
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
          {...props}
          sort={sort}
          setSort={setSort}
          toggleBottomDrawer={toggleBottomDrawer}
          bottomDrawerOpen={bottomDrawerOpen}
          displayErrorMessage={message => {
            showAlert(message, "error");
          }}
        />
      </MainContentBox>
    </LayoutBox>
  );
};

const EditorComponentWithRouter = withRouter(OverviewPage);
export default EditorComponentWithRouter;
