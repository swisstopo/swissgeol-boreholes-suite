import { useEffect, useState } from "react";
import { Route, Switch, useLocation, withRouter } from "react-router-dom";
import BoreholeForm from "../../commons/form/borehole/boreholeForm";
import MainSideNav from "../../commons/menu/editor/mainSideNav.tsx";
import DetailSideNav from "../../commons/menu/editor/detailSideNav";
import HeaderComponent from "../../commons/menu/headerComponent";
import WorkflowForm from "../../commons/form/workflow/workflowForm";
import MapView from "../../commons/menu/editor/mapView";
import { SideDrawer } from "../../commons/menu/editor/sideDrawer.tsx";
import { Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import { theme } from "../../AppTheme";
import SearchEditorComponent from "../../commons/search/editor/searchEditorComponent.jsx";

const AppBox = styled(Box)({
  display: "flex",
  flexDirection: "column",
  height: "100%",
});

const LayoutBox = styled(Box)({ flex: "1 1 100%", display: "flex", flexDirection: "row", overflow: "hidden" });

const SidebarBox = styled(Box)(({ theme }) => ({
  flexShrink: 0,
  borderRight: "1px solid " + theme.palette.boxShadow,
  position: "relative",
}));

const WorkflowBox = styled(Box)(({ theme }) => ({
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

  const toggleSideDrawer = open => {
    setSideDrawerOpen(open);
  };

  const toggleBottomDrawer = open => {
    setBottomDrawerOpen(open);
  };

  useEffect(() => {
    // Close the side drawer when the route changes
    setSideDrawerOpen(false);
  }, [location.pathname]);

  return (
    <AppBox>
      <HeaderComponent />
      <LayoutBox>
        <SidebarBox theme={theme}>
          <Switch>
            <Route
              exact
              path={"/"}
              render={() => <MainSideNav toggleDrawer={toggleSideDrawer} drawerOpen={sideDrawerOpen} />}
            />
            <Route component={DetailSideNav} path="/:id" />
          </Switch>
        </SidebarBox>
        <SideDrawer drawerOpen={sideDrawerOpen} drawerWidth={240} drawerContent={<SearchEditorComponent />} />
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
                />
              )}
            />
            <Route exact={false} path={"/:id"} render={() => <BoreholeForm />} />
          </Switch>
        </MainContentBox>
        <Switch>
          <Route
            component={({ match }) => (
              <WorkflowBox theme={theme}>
                <WorkflowForm id={parseInt(match.params.id, 10)} />
              </WorkflowBox>
            )}
            path={"/:id"}
          />
        </Switch>
      </LayoutBox>
    </AppBox>
  );
};

const EditorComponentWithRouter = withRouter(EditorComponent);
export default EditorComponentWithRouter;
