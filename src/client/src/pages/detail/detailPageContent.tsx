import { RefObject, useContext } from "react";
import { useSelector } from "react-redux";
import { Redirect, Route, Switch, useParams } from "react-router-dom";
import { Box } from "@mui/material";
import { ReduxRootState } from "../../api-lib/ReduxStateInterfaces.ts";
import { BoreholeV2 } from "../../api/borehole.ts";
import { theme } from "../../AppTheme";
import { AlertContext } from "../../components/alert/alertContext";
import { Attachments } from "./attachments/attachments.tsx";
import { BoreholePanel } from "./form/borehole/boreholePanel.tsx";
import { BoreholeFormInputs } from "./form/borehole/boreholePanelInterfaces.ts";
import Completion from "./form/completion/completion.jsx";
import { FieldMeasurement } from "./form/hydrogeology/fieldMeasurement/fieldMeasurement.tsx";
import GroundwaterLevelMeasurement from "./form/hydrogeology/groundwaterLevelMeasurement/groundwaterLevelMeasurement.tsx";
import Hydrotest from "./form/hydrogeology/hydrotest/hydrotest.tsx";
import WaterIngress from "./form/hydrogeology/waterIngress/waterIngress.tsx";
import { LocationPanel } from "./form/location/locationPanel.tsx";
import { LocationFormInputs } from "./form/location/locationPanelInterfaces.tsx";
import ChronostratigraphyPanel from "./form/stratigraphy/chronostratigraphy/chronostratigraphyPanel.jsx";
import Lithology from "./form/stratigraphy/lithology";
import LithostratigraphyPanel from "./form/stratigraphy/lithostratigraphy/lithostratigraphyPanel.jsx";
import WorkflowForm from "./form/workflow/workflowForm.jsx";

interface DetailPageContentProps {
  locationPanelRef: RefObject<{ submit: () => void; reset: () => void }>;
  boreholePanelRef: RefObject<{ submit: () => void; reset: () => void }>;
  onLocationFormSubmit: (data: LocationFormInputs) => void;
  onBoreholeFormSubmit: (data: BoreholeFormInputs) => void;
  borehole: BoreholeV2;
  panelOpen: boolean;
}

export const DetailPageContent = ({
  locationPanelRef,
  boreholePanelRef,
  onLocationFormSubmit,
  onBoreholeFormSubmit,
  borehole,
  panelOpen,
}: DetailPageContentProps) => {
  const { showAlert } = useContext(AlertContext);
  const { id } = useParams<{ id: string }>();
  const legacyBorehole = useSelector((state: ReduxRootState) => state.core_borehole);

  if (legacyBorehole.error !== null) {
    showAlert(legacyBorehole.error, "error");
  }

  const boreholeLoaded = borehole && legacyBorehole;

  return (
    <>
      {boreholeLoaded && (
        <Box
          sx={{
            height: "100%",
            display: "flex",
            flex: "1 1 100%",
            flexDirection: "column",
            px: {
              xs: 2,
              sm: panelOpen ? 2 : 6,
              md: panelOpen ? 2 : 11,
              lg: panelOpen ? 4 : 11,
            },
            py: 5,
            overflowY: "auto",
            backgroundColor: theme.palette.background.lightgrey,
          }}>
          <Switch>
            <Route
              exact
              path={"/:id/location"}
              render={() => (
                <LocationPanel
                  ref={locationPanelRef}
                  onSubmit={onLocationFormSubmit}
                  borehole={borehole}
                  labelingPanelOpen={panelOpen}
                />
              )}
            />
            <Route
              exact
              path={"/:id/borehole"}
              render={() => (
                <BoreholePanel ref={boreholePanelRef} borehole={borehole} onSubmit={onBoreholeFormSubmit} />
              )}
            />
            <Route exact path={"/:id/stratigraphy/lithology"} render={() => <Lithology />} />
            <Route exact path={"/:id/stratigraphy/chronostratigraphy"} render={() => <ChronostratigraphyPanel />} />
            <Route exact path={"/:id/stratigraphy/lithostratigraphy"} render={() => <LithostratigraphyPanel />} />
            <Route
              path={"/:id/stratigraphy"}
              render={() => {
                return (
                  <Redirect
                    to={{
                      pathname: `/${id}/stratigraphy/lithology`,
                    }}
                  />
                );
              }}
            />
            <Route exact path={"/:id/attachments"} render={() => <Attachments />} />
            <Route exact path={"/:id/hydrogeology/wateringress"} render={() => <WaterIngress />} />
            <Route
              exact
              path={"/:id/hydrogeology/groundwaterlevelmeasurement"}
              render={() => <GroundwaterLevelMeasurement />}
            />
            <Route exact path={"/:id/hydrogeology/fieldmeasurement"} render={() => <FieldMeasurement />} />
            <Route exact path={"/:id/hydrogeology/hydrotest"} render={() => <Hydrotest />} />
            <Route
              path={"/:id/hydrogeology"}
              render={() => {
                return (
                  <Redirect
                    to={{
                      pathname: `/${id}/hydrogeology/wateringress`,
                    }}
                  />
                );
              }}
            />
            <Route path={"/:boreholeId/completion/:completionId"} render={() => <Completion />} />
            <Route path={"/:boreholeId/completion"} render={() => <Completion />} />
            <Route exact path={"/:id/status"} render={() => <WorkflowForm id={parseInt(id, 10)} />} />
            <Route
              path={"/:id"}
              render={() => {
                return (
                  <Redirect
                    to={{
                      pathname: `/${id}/location`,
                    }}
                  />
                );
              }}
            />
          </Switch>
        </Box>
      )}
    </>
  );
};
