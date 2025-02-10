import { FC, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "react-query";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useParams } from "react-router-dom";
import { Box, CircularProgress, Stack } from "@mui/material";
import { loadBorehole } from "../../api-lib";
import { Borehole, ReduxRootState } from "../../api-lib/ReduxStateInterfaces.ts";
import { BoreholeV2, getBoreholeById, updateBorehole } from "../../api/borehole.ts";
import { LabelingToggleButton } from "../../components/buttons/labelingButton.tsx";
import {
  prepareBoreholeDataForSubmit,
  prepareLocationDataForSubmit,
} from "../../components/legacyComponents/formUtils.ts";
import { LayoutBox, MainContentBox, SidebarBox } from "../../components/styledComponents.ts";
import { DetailContext, DetailContextProps } from "./detailContext.tsx";
import DetailHeader from "./detailHeader.tsx";
import { DetailPageContent } from "./detailPageContent.tsx";
import { DetailSideNav } from "./detailSideNav.tsx";
import { BoreholeFormInputs } from "./form/borehole/boreholePanelInterfaces.ts";
import { LocationFormInputs, LocationFormSubmission } from "./form/location/locationPanelInterfaces.tsx";
import { useLabelingContext } from "./labeling/labelingInterfaces.tsx";
import LabelingPanel from "./labeling/labelingPanel.tsx";
import { SaveBar } from "./saveBar";

export const DetailPage: FC = () => {
  const [loading, setLoading] = useState(true);
  const [editableByCurrentUser, setEditableByCurrentUser] = useState(false);
  const legacyBorehole: Borehole = useSelector((state: ReduxRootState) => state.core_borehole);
  const user = useSelector((state: ReduxRootState) => state.core_user);
  const location = useLocation();
  const { panelPosition, panelOpen, togglePanel } = useLabelingContext();
  const { editingEnabled, setEditingEnabled } = useContext<DetailContextProps>(DetailContext);
  const dispatch = useDispatch();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: borehole, isLoading } = useQuery<BoreholeV2, Error>({
    queryKey: ["borehole", parseInt(id, 10)],
    queryFn: () => getBoreholeById(parseInt(id, 10)),
  });

  useEffect(() => {
    if (!isLoading && borehole) {
      setEditingEnabled(borehole.locked !== null && borehole.lockedById === user.data.id);
    }
  }, [borehole, setEditingEnabled, user.data.id]);

  const loadOrCreate = useCallback(
    (id: string) => {
      setLoading(true);
      dispatch(loadBorehole(parseInt(id, 10)))
        //@ts-expect-error // legacy fetch function returns not typed
        .then(response => {
          if (response.success) {
            setLoading(false);
          }
        });
    },
    [dispatch, setLoading],
  );

  const locationPanelRef = useRef<{ submit: () => void; reset: () => void }>(null);
  const boreholePanelRef = useRef<{ submit: () => void; reset: () => void }>(null);

  function getAndUpdateBorehole(boreholeSubmission: BoreholeFormInputs | LocationFormSubmission) {
    getBoreholeById(parseInt(id)).then(b => {
      updateBorehole({ ...b, ...boreholeSubmission }).then(() => {
        queryClient.invalidateQueries({ queryKey: ["borehole", id] });
      });
    });
  }

  const onBoreholeFormSubmit = (formInputs: BoreholeFormInputs) => {
    getAndUpdateBorehole(prepareBoreholeDataForSubmit(formInputs));
  };

  const onLocationFormSubmit = (formInputs: LocationFormInputs) => {
    getAndUpdateBorehole(prepareLocationDataForSubmit(formInputs));
  };

  const triggerSubmit = () => {
    boreholePanelRef.current?.submit();
    locationPanelRef.current?.submit();
  };

  const triggerReset = () => {
    boreholePanelRef.current?.reset();
    locationPanelRef.current?.reset();
  };

  useEffect(() => {
    loadOrCreate(id);
  }, [id, loadOrCreate]);

  useEffect(() => {
    setEditingEnabled(legacyBorehole?.data?.lock !== null);
  }, [legacyBorehole?.data?.lock, setEditingEnabled]);

  useEffect(() => {
    if (!editingEnabled) {
      togglePanel(false);
    }

    if (legacyBorehole?.data?.lock?.id && legacyBorehole.data.lock.id !== user.data.id) {
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

  const shouldShowSaveBar =
    location.pathname.endsWith("/location") ||
    (location.pathname.endsWith("/borehole") && location.hash === "#general");

  return (
    <>
      <DetailHeader
        borehole={borehole ?? ({} as BoreholeV2)}
        editableByCurrentUser={editableByCurrentUser}
        triggerReset={triggerReset}
      />
      <LayoutBox>
        <SidebarBox>
          <DetailSideNav borehole={borehole ?? ({} as BoreholeV2)} />
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
                editableByCurrentUser={editableByCurrentUser}
                locationPanelRef={locationPanelRef}
                onLocationFormSubmit={onLocationFormSubmit}
                boreholePanelRef={boreholePanelRef}
                onBoreholeFormSubmit={onBoreholeFormSubmit}
                borehole={borehole ?? ({} as BoreholeV2)}
                panelOpen={panelOpen}
              />
            </MainContentBox>
            {editingEnabled && panelOpen && <LabelingPanel />}
          </Box>
          {editingEnabled && shouldShowSaveBar && <SaveBar triggerSubmit={triggerSubmit} triggerReset={triggerReset} />}
        </Stack>
      </LayoutBox>
    </>
  );
};
