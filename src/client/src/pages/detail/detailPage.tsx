import { FC, useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useParams } from "react-router-dom";
import { Box, CircularProgress, Stack } from "@mui/material";
import { loadBorehole } from "../../api-lib";
import { Borehole, ReduxRootState } from "../../api-lib/ReduxStateInterfaces.ts";
import { BoreholeV2, getBoreholeById, updateBorehole } from "../../api/borehole.ts";
import { LabelingToggleButton } from "../../components/buttons/labelingButton.tsx";
import { parseFloatWithThousandsSeparator } from "../../components/legacyComponents/formUtils.ts";
import { LayoutBox, MainContentBox, SidebarBox } from "../../components/styledComponents.ts";
import DetailHeader from "./detailHeader.tsx";
import { DetailPageContent } from "./detailPageContent.tsx";
import { DetailSideNav } from "./detailSideNav.tsx";
import { LocationFormInputs } from "./form/location/locationPanel";
import { useLabelingContext } from "./labeling/labelingInterfaces.tsx";
import LabelingPanel from "./labeling/labelingPanel.tsx";
import { SaveBar } from "./saveBar";

export const DetailPage: FC = () => {
  const [editingEnabled, setEditingEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [editableByCurrentUser, setEditableByCurrentUser] = useState(false);
  const [borehole, setBorehole] = useState<BoreholeV2 | null>(null);
  const legacyBorehole: Borehole = useSelector((state: ReduxRootState) => state.core_borehole);
  const user = useSelector((state: ReduxRootState) => state.core_user);
  const location = useLocation();
  const { panelPosition, panelOpen, togglePanel } = useLabelingContext();
  const dispatch = useDispatch();
  const { id } = useParams<{
    id: string;
  }>();

  useEffect(() => {
    getBoreholeById(parseInt(id, 10)).then(b => {
      setBorehole(b);
    });
  }, [id]);

  const loadOrCreate = useCallback(
    (id: string) => {
      setLoading(true);
      dispatch(loadBorehole(parseInt(id, 10)))
        //@ts-expect-error // legacy fetch function returns not typed
        .then(response => {
          if (response.success) {
            setLoading(false);
          }
        })
        .catch(function (error: string) {
          console.log(error);
        });
    },
    [dispatch, setLoading],
  );

  const locationPanelRef = useRef<{ submit: () => void; reset: () => void }>(null);

  const prepareFormDataForSubmit = (data: LocationFormInputs) => {
    data.elevationZ = data?.elevationZ ? parseFloatWithThousandsSeparator(String(data.elevationZ)) : null;
    data.referenceElevation = data?.referenceElevation
      ? parseFloatWithThousandsSeparator(String(data.referenceElevation))
      : null;
    data.restrictionUntil = data?.restrictionUntil ? (data.restrictionUntil += "T00:00:00.000Z") : null;
    data.nationalInterest = data?.nationalInterest === 1 ? true : data?.nationalInterest === 0 ? false : null;
    data.restrictionId = data.restrictionId || null;
    data.referenceElevationTypeId = data.referenceElevationTypeId || null;
    data.elevationPrecisionId = data.elevationPrecisionId || null;
    data.qtReferenceElevationId = data.qtReferenceElevationId || null;
    data.alternateName = data?.alternateName || data.originalName;

    delete data.hrsId;
    return data;
  };

  const handleFormSubmit = (data: LocationFormInputs) => {
    const newdata = prepareFormDataForSubmit(data);
    getBoreholeById(parseInt(id)).then(b => {
      updateBorehole({ ...b, ...newdata }).then(r => {
        setBorehole(r);
        // TODO error handling?
      });
    });
  };

  const handleDirtyChange = (isDirty: boolean) => {
    setIsFormDirty(isDirty);
  };

  const triggerSubmit = () => {
    if (locationPanelRef.current) {
      locationPanelRef.current.submit();
    }
  };

  const triggerReset = () => {
    if (locationPanelRef.current) {
      locationPanelRef.current.reset();
    }
  };

  useEffect(() => {
    loadOrCreate(id);
  }, [id, loadOrCreate]);

  useEffect(() => {
    if (!editingEnabled) {
      togglePanel(false);
    }

    if (legacyBorehole.data.lock !== null && legacyBorehole.data.lock?.id !== user.data.id) {
      setEditableByCurrentUser(false);
      return;
    }

    const matchingWorkgroup =
      user.data.workgroups.find(workgroup => workgroup.id === legacyBorehole.data.workgroup?.id) ?? false;
    const userRoleMatches =
      matchingWorkgroup &&
      Object.prototype.hasOwnProperty.call(matchingWorkgroup, "roles") &&
      matchingWorkgroup.roles.includes(legacyBorehole.data.role);
    const isStatusPage = location.pathname.endsWith("/status");
    const isBoreholeInEditWorkflow = legacyBorehole?.data.workflow?.role === "EDIT";

    setEditableByCurrentUser(userRoleMatches && (isStatusPage || isBoreholeInEditWorkflow));
  }, [editingEnabled, user, legacyBorehole, location, togglePanel]);

  if (loading || !borehole)
    return (
      <Stack height="100%" alignItems="center" justifyContent="center">
        <CircularProgress />
      </Stack>
    );

  return (
    <>
      <DetailHeader
        borehole={borehole}
        editingEnabled={editingEnabled}
        setEditingEnabled={setEditingEnabled}
        editableByCurrentUser={editableByCurrentUser}
      />
      <LayoutBox>
        <SidebarBox>
          <DetailSideNav id={id} />
        </SidebarBox>
        <Stack width="100%" direction="column">
          <Box
            sx={{
              display: "flex",
              flexGrow: 1,
              overflow: "auto",
              flexDirection: panelPosition === "right" ? "row" : "column",
              width: "100%",
            }}>
            <MainContentBox
              sx={{
                width: panelOpen && panelPosition === "right" ? "50%" : "100%",
                height: panelOpen && panelPosition === "bottom" ? "50%" : "100%",
              }}>
              {editingEnabled && (
                <LabelingToggleButton
                  panelOpen={panelOpen}
                  panelPosition={panelPosition}
                  onClick={() => togglePanel()}
                />
              )}
              <DetailPageContent
                editingEnabled={editingEnabled}
                editableByCurrentUser={editableByCurrentUser}
                handleFormSubmit={handleFormSubmit}
                locationPanelRef={locationPanelRef}
                handleDirtyChange={handleDirtyChange}
                borehole={borehole}
                setBorehole={setBorehole}
              />
            </MainContentBox>
            {editingEnabled && panelOpen && <LabelingPanel boreholeId={Number(id)} />}
          </Box>
          {editingEnabled && location.pathname.endsWith("/location") && (
            <SaveBar triggerSubmit={triggerSubmit} triggerReset={triggerReset} isFormDirty={isFormDirty} />
          )}
        </Stack>
      </LayoutBox>
    </>
  );
};
