import { RefObject, useContext } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Redirect, Route, Switch, useParams } from "react-router-dom";
import { Box } from "@mui/material";
import { ReduxRootState } from "../../api-lib/ReduxStateInterfaces.ts";
import { BoreholeV2 } from "../../api/borehole.ts";
import { theme } from "../../AppTheme";
import { AlertContext } from "../../components/alert/alertContext";
import EditorBoreholeFilesTable from "./attachments/table/editorBoreholeFilesTable.tsx";
import { BoreholePanel } from "./form/borehole/boreholePanel.tsx";
import { BoreholeFormInputs } from "./form/borehole/boreholePanelInterfaces.ts";
import Completion from "./form/completion/completion.jsx";
import FieldMeasurement from "./form/hydrogeology/fieldMeasurement.jsx";
import GroundwaterLevelMeasurement from "./form/hydrogeology/groundwaterLevelMeasurement.tsx";
import Hydrotest from "./form/hydrogeology/hydrotest.jsx";
import WaterIngress from "./form/hydrogeology/waterIngress.jsx";
import { LocationPanel } from "./form/location/locationPanel.tsx";
import { LocationFormInputs } from "./form/location/locationPanelInterfaces.tsx";
import ChronostratigraphyPanel from "./form/stratigraphy/chronostratigraphy/chronostratigraphyPanel.jsx";
import Lithology from "./form/stratigraphy/lithology";
import LithostratigraphyPanel from "./form/stratigraphy/lithostratigraphy/lithostratigraphyPanel.jsx";
import WorkflowForm from "./form/workflow/workflowForm.jsx";

interface DetailPageContentProps {
  editingEnabled: boolean;
  editableByCurrentUser: boolean;
  locationPanelRef: RefObject<{ submit: () => void; reset: () => void }>;
  boreholePanelRef: RefObject<{ submit: () => void; reset: () => void }>;
  onLocationFormSubmit: (data: LocationFormInputs) => void;
  onBoreholeFormSubmit: (data: BoreholeFormInputs) => void;
  handleDirtyChange: (isDirty: boolean) => void;
  borehole: BoreholeV2;
  panelOpen: boolean;
}
type DetailPageParams = {
  id: string;
};

export const DetailPageContent = ({
  editingEnabled,
  editableByCurrentUser,
  locationPanelRef,
  boreholePanelRef,
  onLocationFormSubmit,
  onBoreholeFormSubmit,
  handleDirtyChange,
  borehole,
  panelOpen,
}: DetailPageContentProps) => {
  const { t } = useTranslation();
  const { showAlert } = useContext(AlertContext);
  const { id } = useParams<DetailPageParams>();
  const legacyBorehole = useSelector((state: ReduxRootState) => state.core_borehole);

  function checkLock() {
    if (legacyBorehole.data.role !== "EDIT") {
      return false;
    }
    if (!editingEnabled) {
      if (editableByCurrentUser) {
        showAlert(t("errorStartEditing"), "error");
      }
      return false;
    }
    return true;
  }

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
                  editingEnabled={editingEnabled}
                  onSubmit={onLocationFormSubmit}
                  borehole={borehole}
                  onDirtyChange={handleDirtyChange}
                  labelingPanelOpen={panelOpen}
                />
              )}
            />
            <Route
              exact
              path={"/:id/borehole"}
              render={() => (
                <BoreholePanel
                  ref={boreholePanelRef}
                  onSubmit={onBoreholeFormSubmit}
                  boreholeId={id}
                  borehole={borehole}
                  editingEnabled={editingEnabled}
                  onDirtyChange={handleDirtyChange}
                />
              )}
            />
            <Route exact path={"/:id/stratigraphy/lithology"} render={() => <Lithology checkLock={checkLock} />} />
            <Route
              exact
              path={"/:id/stratigraphy/chronostratigraphy"}
              render={() => <ChronostratigraphyPanel id={id} isEditable={editingEnabled} />}
            />
            <Route
              exact
              path={"/:id/stratigraphy/lithostratigraphy"}
              render={() => <LithostratigraphyPanel id={id} isEditable={editingEnabled} />}
            />
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
            <Route
              exact
              path={"/:id/attachments"}
              render={() => <EditorBoreholeFilesTable id={parseInt(id, 10)} unlocked={editingEnabled} />}
            />
            <Route
              exact
              path={"/:id/hydrogeology/wateringress"}
              render={() => <WaterIngress isEditable={editingEnabled} boreholeId={parseInt(id, 10)} />}
            />
            <Route
              exact
              path={"/:id/hydrogeology/groundwaterlevelmeasurement"}
              render={() => <GroundwaterLevelMeasurement isEditable={editingEnabled} boreholeId={parseInt(id, 10)} />}
            />
            <Route
              exact
              path={"/:id/hydrogeology/fieldmeasurement"}
              render={() => <FieldMeasurement isEditable={editingEnabled} boreholeId={parseInt(id, 10)} />}
            />
            <Route
              exact
              path={"/:id/hydrogeology/hydrotest"}
              render={() => <Hydrotest isEditable={editingEnabled} boreholeId={parseInt(id, 10)} />}
            />
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
            <Route
              path={"/:boreholeId/completion/:completionId"}
              render={() => <Completion isEditable={editingEnabled} />}
            />
            <Route path={"/:boreholeId/completion"} render={() => <Completion isEditable={editingEnabled} />} />
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
