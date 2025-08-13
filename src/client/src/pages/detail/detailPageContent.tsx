import { Navigate, Route, Routes } from "react-router-dom";
import { Box } from "@mui/material";
import { BoreholeV2 } from "../../api/borehole.ts";
import { theme } from "../../AppTheme";
import { useDevMode } from "../../hooks/useDevMode.tsx";
import { Attachments } from "./attachments/attachments.tsx";
import { BoreholePanel } from "./form/borehole/boreholePanel.tsx";
import Completion from "./form/completion/completion.jsx";
import { FieldMeasurement } from "./form/hydrogeology/fieldMeasurement/fieldMeasurement.tsx";
import GroundwaterLevelMeasurement from "./form/hydrogeology/groundwaterLevelMeasurement/groundwaterLevelMeasurement.tsx";
import Hydrotest from "./form/hydrogeology/hydrotest/hydrotest.tsx";
import WaterIngress from "./form/hydrogeology/waterIngress/waterIngress.tsx";
import { LocationPanel } from "./form/location/locationPanel.tsx";
import { LegacyStratigraphyPanel } from "./form/stratigraphy/legacyStratigraphyPanel.tsx";
import { StratigraphyPanel } from "./form/stratigraphy/stratigraphyPanel.tsx";
import { WorkflowView } from "./form/workflow/workflowView.tsx";

interface DetailPageContentProps {
  borehole: BoreholeV2;
  panelOpen: boolean;
}

export const DetailPageContent = ({ borehole, panelOpen }: DetailPageContentProps) => {
  const { runsDevMode } = useDevMode();
  return (
    <>
      {borehole && (
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
            <Route path="location" element={<LocationPanel borehole={borehole} labelingPanelOpen={panelOpen} />} />
            <Route path="borehole" element={<BoreholePanel borehole={borehole} />} />
            <Route
              path="stratigraphy/:stratigraphyId"
              element={runsDevMode ? <StratigraphyPanel /> : <LegacyStratigraphyPanel />}
            />
            <Route path="stratigraphy" element={runsDevMode ? <StratigraphyPanel /> : <LegacyStratigraphyPanel />} />
            <Route path="attachments" element={<Attachments />} />
            <Route path="hydrogeology/wateringress" element={<WaterIngress />} />
            <Route path="hydrogeology/groundwaterlevelmeasurement" element={<GroundwaterLevelMeasurement />} />
            <Route path="hydrogeology/fieldmeasurement" element={<FieldMeasurement />} />
            <Route path="hydrogeology/hydrotest" element={<Hydrotest />} />
            <Route path="hydrogeology" element={<Navigate to="hydrogeology/wateringress" replace />} />
            <Route path="completion/:completionId" element={<Completion />} />
            <Route path="completion" element={<Completion />} />
            <Route path="status" element={<WorkflowView />} />
            <Route path="" element={<Navigate to="location" replace />} />
          </Routes>
        </Box>
      )}
    </>
  );
};
