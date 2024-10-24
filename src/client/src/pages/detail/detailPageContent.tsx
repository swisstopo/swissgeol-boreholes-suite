import { RefObject, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { Redirect, Route, Switch, useParams } from "react-router-dom";
import { Box } from "@mui/material";
import _ from "lodash";
import { patchBorehole, updateBorehole } from "../../api-lib";
import { Borehole, BoreholeAttributes, ReduxRootState } from "../../api-lib/ReduxStateInterfaces.ts";
import { BoreholeV2, getBoreholeById } from "../../api/borehole.ts";
import { theme } from "../../AppTheme";
import { AlertContext } from "../../components/alert/alertContext";
import EditorBoreholeFilesTable from "./attachments/table/editorBoreholeFilesTable.tsx";
import BoreholePanel from "./form/borehole/boreholePanel.jsx";
import Completion from "./form/completion/completion.jsx";
import FieldMeasurement from "./form/hydrogeology/fieldMeasurement.jsx";
import GroundwaterLevelMeasurement from "./form/hydrogeology/groundwaterLevelMeasurement.jsx";
import Hydrotest from "./form/hydrogeology/hydrotest.jsx";
import WaterIngress from "./form/hydrogeology/waterIngress.jsx";
import { LocationFormInputs, LocationPanel } from "./form/location/locationPanel.tsx";
import ChronostratigraphyPanel from "./form/stratigraphy/chronostratigraphy/chronostratigraphyPanel.jsx";
import Lithology from "./form/stratigraphy/lithology";
import LithostratigraphyPanel from "./form/stratigraphy/lithostratigraphy/lithostratigraphyPanel.jsx";
import WorkflowForm from "./form/workflow/workflowForm.jsx";

interface DetailPageContentProps {
  editingEnabled: boolean;
  editableByCurrentUser: boolean;
  locationPanelRef: RefObject<{ submit: () => void; reset: () => void }>;
  handleFormSubmit: (data: LocationFormInputs) => void;
  handleDirtyChange: (isDirty: boolean) => void;
}

export const DetailPageContent = ({
  editingEnabled,
  editableByCurrentUser,
  locationPanelRef,
  handleFormSubmit,
  handleDirtyChange,
}: DetailPageContentProps) => {
  const { t } = useTranslation();
  const { showAlert } = useContext(AlertContext);
  const legacyBorehole = useSelector((state: ReduxRootState) => state.core_borehole);
  const [borehole, setBorehole] = useState<BoreholeV2>();

  const dispatch = useDispatch();
  const { id } = useParams<{
    id: string;
  }>();

  useEffect(() => {
    getBoreholeById(parseInt(id, 10)).then(b => {
      setBorehole(b);
    });
  }, [id]);

  /* eslint-disable  @typescript-eslint/no-explicit-any */
  const updateAttributeDelay: { [index: string]: any } = {};

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

  function isNumber(value: string | number): boolean {
    return typeof value === "number" || !isNaN(Number(value));
  }

  function updateNumber(attribute: keyof Borehole["data"], value: number | null, to = true) {
    if (!checkLock()) return;
    const updatedBorehole = {
      ...legacyBorehole,
    };
    _.set(updatedBorehole.data, attribute, value);

    if (value === null) {
      patch(updatedBorehole.data, attribute, value, to);
    } else if (isNumber(value)) {
      patch(updatedBorehole.data, attribute, _.toNumber(value), to);
    }
  }

  function updateChange(
    attribute: keyof Borehole["data"],
    value: string | number | boolean | null | (number | string | null)[],
    to = true,
  ) {
    if (!checkLock()) {
      return;
    }
    const updatedBorehole = {
      ...legacyBorehole,
    };
    if (attribute === "location") {
      const arrayValue = value as (number | string | null)[];
      _.set(updatedBorehole.data, "location_x", arrayValue[0]);
      _.set(updatedBorehole.data, "location_y", arrayValue[1]);
      if (arrayValue[2] !== null && isNumber(arrayValue[2])) {
        _.set(updatedBorehole.data, "elevation_z", arrayValue[2]);
      }
      _.set(updatedBorehole.data, "custom.country", arrayValue[3]);
      _.set(updatedBorehole.data, "custom.canton", arrayValue[4]);
      _.set(updatedBorehole.data, "custom.municipality", arrayValue[5]);
    } else {
      _.set(updatedBorehole.data, attribute, value);
    }

    patch(updatedBorehole.data, attribute, value, to);
  }

  function patch(
    borehole: BoreholeAttributes,
    attribute: string,
    value: string | number | boolean | null | (number | string | null)[],
    to = true,
  ) {
    if (Object.prototype.hasOwnProperty.call(updateAttributeDelay, attribute) && updateAttributeDelay[attribute]) {
      clearTimeout(updateAttributeDelay[attribute]);
      updateAttributeDelay[attribute] = false;
    }
    updateAttributeDelay[attribute] = setTimeout(
      () => {
        patchBorehole(borehole.id, attribute, value)
          //@ts-expect-error  legacy fetch function returns not typed
          .then(response => {
            if (response.data.success) {
              borehole.lock = response.data.lock;
              borehole.updater = response.data.updater;
              if (response.data.location) {
                borehole.custom.country = response.data.location.country;
                borehole.custom.canton = response.data.location.canton;
                borehole.custom.municipality = response.data.location.municipality;
              }
              dispatch(updateBorehole(borehole));
              getBoreholeById(borehole.id).then(res => {
                setBorehole(res);
              });
            } else if (response.status === 200) {
              showAlert(response.data.message, "error");
              if (response.data.error === "errorLocked") {
                patch(response.data, attribute, value, to);
                borehole.lock = null;
                dispatch(updateBorehole(borehole));
              } else {
                window.location.reload();
              }
            }
          })
          .catch((error: string) => {
            console.error(error);
          });
      },
      to ? 500 : 0,
    );
  }

  if (legacyBorehole.error !== null) {
    showAlert(legacyBorehole.error, "error");
  }

  return (
    <>
      {borehole && (
        <Box
          sx={{
            height: "100%",
            display: "flex",
            flex: "1 1 100%",
            flexDirection: "column",
            px: 11,
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
                  onSubmit={handleFormSubmit}
                  borehole={borehole}
                  onDirtyChange={handleDirtyChange}
                  updateChange={updateChange}
                  updateNumber={updateNumber}
                />
              )}
            />
            <Route
              exact
              path={"/:id/borehole"}
              render={() => (
                <BoreholePanel
                  boreholeId={id}
                  borehole={legacyBorehole}
                  updateChange={updateChange}
                  updateNumber={updateNumber}
                  isEditable={editingEnabled}
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
