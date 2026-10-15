import { useContext, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useLocation } from "react-router";
import { ErrorResponse } from "../../api/errorClasses.ts";
import { AlertContext } from "../../components/alert/alertContext.tsx";
import { GoogleAnalytics } from "../../components/GoogleAnalytics.tsx";
import { LayoutBox, MainContentBox, SidebarBox } from "../../components/styledComponents.ts";
import { AnalyticsContext, AnalyticsContextProps } from "../../term/analyticsContext.tsx";
import MainSideNav from "./layout/mainSideNav.tsx";
import { MapView } from "./layout/mapView.tsx";
import { SideDrawer } from "./layout/sideDrawer.tsx";
import { DrawerContentTypes } from "./overviewPageInterfaces.ts";
import { CustomLayersPanel } from "./sidePanelContent/customLayers/customLayersPanel.tsx";
import { FilterComponent } from "./sidePanelContent/filter/filterComponent.tsx";
import { ImportPanel } from "./sidePanelContent/importer/importPanel.tsx";
import NewBoreholePanel from "./sidePanelContent/newBoreholePanel.tsx";

export const OverviewPage = () => {
  const location = useLocation();
  const [sideDrawerPathname, setSideDrawerPathname] = useState<string | null>(null);
  // Close the side drawer when the route changes: it stays open only on the route it was opened on.
  const sideDrawerOpen = sideDrawerPathname === location.pathname;
  const [sideDrawerContent, setSideDrawerContent] = useState(DrawerContentTypes.Filters);
  const [errorsResponse, setErrorsResponse] = useState<ErrorResponse | null>(null);
  const [errorDialogOpen, setErrorDialogOpen] = useState<boolean>(false);
  const { analyticsId } = useContext<AnalyticsContextProps>(AnalyticsContext);

  const { showAlert } = useContext(AlertContext);
  const formMethods = useForm({ mode: "all", shouldUnregister: false });

  const toggleSideDrawer = (open: boolean) => {
    setSideDrawerPathname(open ? location.pathname : null);
  };

  const sideDrawerComponentMap = {
    import: (
      <ImportPanel
        toggleDrawer={toggleSideDrawer}
        setErrorsResponse={setErrorsResponse}
        setErrorDialogOpen={setErrorDialogOpen}
      />
    ),
    filters: (
      <FormProvider {...formMethods}>
        <FilterComponent toggleDrawer={toggleSideDrawer} formMethods={formMethods} />
      </FormProvider>
    ),
    newBorehole: <NewBoreholePanel toggleDrawer={toggleSideDrawer} />,
    customLayers: <CustomLayersPanel toggleDrawer={toggleSideDrawer} />,
  };

  return (
    <>
      <LayoutBox>
        <SidebarBox>
          <MainSideNav
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
      {analyticsId && <GoogleAnalytics id={analyticsId} />}
    </>
  );
};
