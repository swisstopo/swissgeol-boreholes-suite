import { FC, useCallback, useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { Box, CircularProgress, Stack } from "@mui/material";
import { loadBorehole } from "../../api-lib";
import { Borehole, ReduxRootState } from "../../api-lib/ReduxStateInterfaces.ts";
import { getBoreholeById } from "../../api/borehole.ts";
import { SidePanelToggleButton } from "../../components/buttons/labelingButtons.tsx";
import { LayoutBox, MainContentBox, SidebarBox } from "../../components/styledComponents.ts";
import { useRequiredParams } from "../../hooks/useRequiredParams.ts";
import { AnalyticsContext, AnalyticsContextProps } from "../../term/analyticsContext.tsx";
import { DetailContext, DetailContextProps } from "./detailContext.tsx";
import DetailHeader from "./detailHeader.tsx";
import { DetailPageContent } from "./detailPageContent.tsx";
import { DetailSideNav } from "./detailSideNav.tsx";
import { useLabelingContext } from "./labeling/labelingContext.tsx";
import LabelingPanel from "./labeling/labelingPanel.tsx";
import { SaveBar } from "./saveBar";
import { SaveContext, SaveContextProps } from "./saveContext.tsx";

export const DetailPage: FC = () => {
  const [loading, setLoading] = useState(true);
  const [editableByCurrentUser, setEditableByCurrentUser] = useState(false);
  const legacyBorehole: Borehole = useSelector((state: ReduxRootState) => state.core_borehole);
  const user = useSelector((state: ReduxRootState) => state.core_user);
  const workflowStatus = useSelector((state: ReduxRootState) => state.core_workflow);
  const location = useLocation();
  const { panelPosition, panelOpen, togglePanel } = useLabelingContext();
  const { borehole, setBorehole, editingEnabled, setEditingEnabled } = useContext<DetailContextProps>(DetailContext);
  const { showSaveBar } = useContext<SaveContextProps>(SaveContext);
  const { sendAnalyticsEvent } = useContext<AnalyticsContextProps>(AnalyticsContext);
  const dispatch = useDispatch();
  const { id } = useRequiredParams<{ id: string }>();

  useEffect(() => {
    getBoreholeById(parseInt(id, 10)).then(b => {
      setBorehole(b);
      setEditingEnabled(b.locked !== null && b.lockedById === user.data.id);
    });
  }, [id, setBorehole, setEditingEnabled, user.data.id, workflowStatus]);

  const loadOrCreate = useCallback(
    (id: string) => {
      setLoading(true);
      // @ts-expect-error legacy API methods will not be typed, as they are going to be removed
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

  useEffect(() => {
    loadOrCreate(id);
  }, [id, loadOrCreate]);

  useEffect(() => {
    sendAnalyticsEvent();
  }, [sendAnalyticsEvent]);

  useEffect(() => {
    setEditingEnabled(legacyBorehole?.data?.lock !== null);
  }, [legacyBorehole?.data?.lock, setEditingEnabled]);

  useEffect(() => {
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

  return (
    <>
      <DetailHeader borehole={borehole} editableByCurrentUser={editableByCurrentUser} />
      <LayoutBox>
        <SidebarBox>
          <DetailSideNav borehole={borehole} />
        </SidebarBox>
        <Stack width="100%" direction="column" sx={{ overflowX: "auto" }}>
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
              <SidePanelToggleButton
                panelOpen={panelOpen}
                panelPosition={panelPosition}
                onClick={() => togglePanel()}
              />
              <DetailPageContent borehole={borehole} panelOpen={panelOpen} />
            </MainContentBox>
            {panelOpen && <LabelingPanel />}
          </Box>
          {editingEnabled && showSaveBar && <SaveBar />}
        </Stack>
      </LayoutBox>
    </>
  );
};
