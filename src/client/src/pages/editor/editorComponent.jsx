import { useContext, useEffect, useState } from "react";
import { Route, Switch, useLocation, withRouter } from "react-router-dom";
import BoreholeForm from "../../commons/form/borehole/boreholeForm";
import MainSideNav from "../../commons/menu/mainView/mainSideNav.tsx";
import DetailSideNav from "../../commons/menu/detailView/detailSideNav.jsx";
import HeaderComponent from "../../commons/menu/headerComponent";
import MapView from "../../commons/menu/mainView/mapView.jsx";
import { SideDrawer } from "../../commons/menu/mainView/sideDrawer.tsx";
import { Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import { theme } from "../../AppTheme";
import FilterComponent from "../../commons/search/editor/filterComponent.jsx";
import NewBoreholePanel from "../../commons/menu/mainView/sidePanelContent/newBoreholePanel.tsx";
import { DrawerContentTypes } from "./editorComponentInterfaces.ts";
import { AlertContext } from "../../components/alert/alertContext.tsx";
import CustomLayersPanel from "../../commons/menu/mainView/sidePanelContent/customLayers/customLayersPanel.jsx";
import DetailHeader from "../../commons/menu/detailView/detailHeader.tsx";

const AppBox = styled(Box)({
  display: "flex",
  flexDirection: "column",
  height: "100%",
});

const LayoutBox = styled(Box)({ flex: "1 1 100%", display: "flex", flexDirection: "row", overflow: "hidden" });

const SidebarBox = styled(Box)(() => ({
  flexShrink: 0,
  borderRight: "1px solid " + theme.palette.boxShadow,
  position: "relative",
}));

const WorkflowBox = styled(Box)(() => ({
  width: "300px",
  boxShadow: theme.palette.boxShadow + " -2px 6px 6px 0px",
  padding: "1em",
}));

const MainContentBox = styled(Box)({
  flex: "1 1 0%",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  position: "relative",
});

const EditorComponent = props => {
  const [sort, setSort] = useState(null);
  const [sideDrawerOpen, setSideDrawerOpen] = useState(false);
  const [bottomDrawerOpen, setBottomDrawerOpen] = useState(false);
  const location = useLocation();
  const [workgroup, setWorkgroup] = useState(0);
  const [enabledWorkgroups, setEnabledWorkgroups] = useState([]);
  const [sideDrawerContent, setSideDrawerContent] = useState(DrawerContentTypes.Filters);
  const alertContext = useContext(AlertContext);

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
        setEnabledWorkgroups={setEnabledWorkgroups}
      />
    ),
    customLayers: <CustomLayersPanel toggleDrawer={toggleSideDrawer} />,
  };

  useEffect(() => {
    // Close the side drawer when the route changes
    setSideDrawerOpen(false);
  }, [location.pathname]);

  return (
    <AppBox>
      <HeaderComponent />
      <Route exact={false} path={"/:id"} render={() => <DetailHeader />} />
      <LayoutBox>
        <SidebarBox>
          <Switch>
            <Route
              exact
              path={"/"}
              render={() => (
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
              )}
            />
            <Route component={DetailSideNav} path="/:id" />
          </Switch>
        </SidebarBox>
        <SideDrawer drawerOpen={sideDrawerOpen} drawerContent={sideDrawerComponentMap[sideDrawerContent]} />
        <MainContentBox>
          <Switch>
            <Route
              exact
              path={"/"}
              render={() => (
                <MapView
                  {...props}
                  sort={sort}
                  setSort={setSort}
                  toggleBottomDrawer={toggleBottomDrawer}
                  bottomDrawerOpen={bottomDrawerOpen}
                  displayErrorMessage={alertContext.error}
                />
              )}
            />
            <Route exact={false} path={"/:id"} render={() => <BoreholeForm />} />
          </Switch>
        </MainContentBox>
      </LayoutBox>
    </AppBox>
  );
};

const EditorComponentWithRouter = withRouter(EditorComponent);
export default EditorComponentWithRouter;
