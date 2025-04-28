import { RefObject, useContext } from "react";
import { useSelector } from "react-redux";
import { Navigate, Route, Routes } from "react-router-dom";
import { Box } from "@mui/material";
import { ReduxRootState } from "../../api-lib/ReduxStateInterfaces.ts";
import { BoreholeV2 } from "../../api/borehole.ts";
import { theme } from "../../AppTheme";
import { AlertContext } from "../../components/alert/alertContext";
import { useRequiredParams } from "../../hooks/useRequiredParams.ts";
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
  locationPanelRef: RefObject<{ submit: () => void; reset: () => void } | null>;
  boreholePanelRef: RefObject<{ submit: () => void; reset: () => void } | null>;
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
  const { id } = useRequiredParams<{ id: string }>();
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
          <Routes>
            <Route
              path="location"
              element={
                <LocationPanel
                  ref={locationPanelRef}
                  onSubmit={onLocationFormSubmit}
                  borehole={borehole}
                  labelingPanelOpen={panelOpen}
                />
              }
            />
            <Route
              path="borehole"
              element={<BoreholePanel ref={boreholePanelRef} borehole={borehole} onSubmit={onBoreholeFormSubmit} />}
            />
            <Route path="stratigraphy/lithology" element={<Lithology />} />
            <Route path="stratigraphy/chronostratigraphy" element={<ChronostratigraphyPanel />} />
            <Route path="stratigraphy/lithostratigraphy" element={<LithostratigraphyPanel />} />
            <Route path="stratigraphy" element={<Navigate to="stratigraphy/lithology" replace />} />
            <Route path="attachments" element={<Attachments />} />
            <Route path="hydrogeology/wateringress" element={<WaterIngress />} />
            <Route path="hydrogeology/groundwaterlevelmeasurement" element={<GroundwaterLevelMeasurement />} />
            <Route path="hydrogeology/fieldmeasurement" element={<FieldMeasurement />} />
            <Route path="hydrogeology/hydrotest" element={<Hydrotest />} />
            <Route path="hydrogeology" element={<Navigate to="hydrogeology/wateringress" replace />} />
            <Route path="completion/:completionId" element={<Completion />} />
            <Route path="completion" element={<Completion />} />
            <Route path="status" element={<WorkflowForm id={parseInt(id)} />} />
            <Route path="" element={<Navigate to="location" replace />} />
          </Routes>
        </Box>
      )}
    </>
  );
};
