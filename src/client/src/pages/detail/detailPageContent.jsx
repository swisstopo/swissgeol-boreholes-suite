import { useCallback, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { Redirect, Route, Switch, useParams } from "react-router-dom";
import { Backdrop, Box, CircularProgress, Stack } from "@mui/material";
import _ from "lodash";
import { loadBorehole, patchBorehole } from "../../api-lib";
import { useDomains } from "../../api/fetchApiV2";
import { theme } from "../../AppTheme";
import { AlertContext } from "../../components/alert/alertContext";
import EditorBoreholeFilesTable from "./attachments/table/editorBoreholeFilesTable.tsx";
import BoreholePanel from "./form/borehole/boreholePanel.jsx";
import Completion from "./form/completion/completion.jsx";
import FieldMeasurement from "./form/hydrogeology/fieldMeasurement.jsx";
import GroundwaterLevelMeasurement from "./form/hydrogeology/groundwaterLevelMeasurement.jsx";
import Hydrotest from "./form/hydrogeology/hydrotest.jsx";
import WaterIngress from "./form/hydrogeology/waterIngress.jsx";
import IdentifierSegment from "./form/location/identifierSegment.tsx";
import LocationSegment from "./form/location/locationSegment.tsx";
import NameSegment from "./form/location/nameSegment.tsx";
import RestrictionSegment from "./form/location/restrictionSegment.tsx";
import ChronostratigraphyPanel from "./form/stratigraphy/chronostratigraphy/chronostratigraphyPanel.jsx";
import Lithology from "./form/stratigraphy/lithology";
import LithostratigraphyPanel from "./form/stratigraphy/lithostratigraphy/lithostratigraphyPanel.jsx";
import WorkflowForm from "./form/workflow/workflowForm.jsx";

export const DetailPageContent = ({ editingEnabled, editableByCurrentUser }) => {
  const [loading, setLoading] = useState(true);

  const { t } = useTranslation();

  const borehole = useSelector(state => state.core_borehole);
  const { data: domains } = useDomains();
  const dispatch = useDispatch();

  const updateBorehole = data => {
    return dispatch(updateBorehole(data));
  };

  const { showAlert } = useContext(AlertContext);
  const { id } = useParams();

  let updateAttributeDelay = {};

  const loadOrCreate = useCallback(
    id => {
      const getBorehole = id => {
        return dispatch(loadBorehole(id));
      };
      const intId = parseInt(id, 10);
      // request to edit a borehole
      setLoading(true);
      getBorehole(intId)
        .then(response => {
          if (response.success) {
            setLoading(false);
          }
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    [dispatch],
  );

  useEffect(() => {
    loadOrCreate(id);
  }, [id, loadOrCreate]);

  function checkLock() {
    if (borehole.data.role !== "EDIT") {
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

  function isNumber(value) {
    return /^-?\d*[.,]?\d*$/.test(value);
  }

  function updateNumber(attribute, value, to = true) {
    if (!checkLock()) return;
    const newBorehole = {
      ...borehole,
    };
    _.set(newBorehole.data, attribute, value);

    if (value === null) {
      patch(newBorehole.data, attribute, value, to);
    } else if (/^-?\d*[.,]?\d*$/.test(value)) {
      patch(newBorehole.data, attribute, _.toNumber(value), to);
    }
  }

  function updateChange(attribute, value, to = true) {
    if (checkLock() === false) {
      return;
    }
    const newBorehole = {
      ...borehole,
    };
    if (attribute === "location") {
      _.set(newBorehole.data, "location_x", value[0]);
      _.set(newBorehole.data, "location_y", value[1]);
      if (value[2] !== null && isNumber(value[2])) {
        _.set(newBorehole.data, "elevation_z", value[2]);
      }
      _.set(newBorehole.data, "custom.country", value[3]);
      _.set(newBorehole.data, "custom.canton", value[4]);
      _.set(newBorehole.data, "custom.municipality", value[5]);
    } else {
      _.set(newBorehole.data, attribute, value);
    }

    patch(newBorehole.data, attribute, value, to);
  }

  function patch(borehole, attribute, value, to = true) {
    if (Object.prototype.hasOwnProperty.call(updateAttributeDelay, attribute) && updateAttributeDelay[attribute]) {
      clearTimeout(updateAttributeDelay[attribute]);
      updateAttributeDelay[attribute] = false;
    }
    updateAttributeDelay[attribute] = setTimeout(
      () => {
        patchBorehole(borehole.id, attribute, value)
          .then(response => {
            if (response.data.success) {
              borehole.lock = response.data.lock;
              borehole.updater = response.data.updater;
              if (response.data.location) {
                borehole.custom.country = response.data.location.country;
                borehole.custom.canton = response.data.location.canton;
                borehole.custom.municipality = response.data.location.municipality;
              }
              updateBorehole(borehole);
            } else if (response.status === 200) {
              showAlert(response.data.message, "error");
              if (response.data.error === "errorLocked") {
                patch(borehole.data, attribute, value, to);
                borehole.lock = null;
                updateBorehole(borehole);
              } else {
                window.location.reload();
              }
            }
          })
          .catch(error => {
            console.error(error);
          });
      },
      to ? 500 : 0,
    );
  }

  if (borehole.error !== null) {
    return <div>{t(borehole.error, borehole.data)}</div>;
  }

  return (
    <>
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
        <Backdrop
          sx={theme => ({ color: "#fff", zIndex: theme.zIndex.drawer + 1 })}
          open={borehole.isFetching === true || loading}>
          <CircularProgress color="inherit" />
        </Backdrop>
        <Switch>
          <Route
            exact
            path={"/:id"}
            render={() => (
              <Box>
                <Stack gap={3} mr={2}>
                  <IdentifierSegment
                    borehole={borehole}
                    updateBorehole={updateBorehole}
                    editingEnabled={editingEnabled}></IdentifierSegment>
                  <NameSegment
                    borehole={borehole}
                    updateChange={updateChange}
                    editingEnabled={editingEnabled}></NameSegment>
                  <RestrictionSegment
                    borehole={borehole}
                    updateChange={updateChange}
                    editingEnabled={editingEnabled}></RestrictionSegment>
                  <LocationSegment
                    borehole={borehole}
                    editingEnabled={editingEnabled}
                    updateChange={updateChange}
                    updateNumber={updateNumber}
                    domains={domains}></LocationSegment>
                </Stack>
              </Box>
            )}
          />
          <Route
            exact
            path={"/:id/borehole"}
            render={() => (
              <BoreholePanel
                boreholeId={id}
                borehole={borehole}
                updateChange={updateChange}
                updateNumber={updateNumber}
                isEditable={editingEnabled}
              />
            )}
          />
          <Route
            exact
            path={"/:id/stratigraphy/lithology"}
            render={() => <Lithology id={id} unlocked={editingEnabled} checkLock={checkLock} />}
          />
          <Route
            exact
            path={"/:id/stratigraphy/chronostratigraphy"}
            render={() => <ChronostratigraphyPanel id={parseInt(id, 10)} isEditable={editingEnabled} />}
          />
          <Route
            exact
            path={"/:id/stratigraphy/lithostratigraphy"}
            render={() => <LithostratigraphyPanel id={parseInt(id, 10)} isEditable={editingEnabled} />}
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
        </Switch>
      </Box>
    </>
  );
};
