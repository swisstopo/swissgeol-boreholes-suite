import { FC, Suspense, useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Box, CircularProgress, Stack } from "@mui/material";
import { Workflow } from "../../api-lib/ReduxStateInterfaces.ts";
import { Role } from "../../api/apiInterfaces.ts";
import { useBorehole } from "../../api/borehole.ts";
import { useCurrentUser } from "../../api/user.ts";
import { SidePanelToggleButton } from "../../components/buttons/labelingButtons.tsx";
import { FullPageCentered, LayoutBox, MainContentBox, SidebarBox } from "../../components/styledComponents.ts";
import { useRequiredParams } from "../../hooks/useRequiredParams.ts";
import { AnalyticsContext, AnalyticsContextProps } from "../../term/analyticsContext.tsx";
import DetailHeader from "./detailHeader.tsx";
import { DetailPageContent } from "./detailPageContent.tsx";
import { DetailSideNav } from "./detailSideNav.tsx";
import { EditStateContext } from "./editStateContext.tsx";
import { useLabelingContext } from "./labeling/labelingContext.tsx";
import LabelingPanel from "./labeling/labelingPanel.tsx";
import { SaveBar } from "./saveBar";
import { SaveContext, SaveContextProps } from "./saveContext.tsx";

export const DetailPage: FC = () => {
  const [editableByCurrentUser, setEditableByCurrentUser] = useState(false);
  const location = useLocation();
  const { panelPosition, panelOpen, togglePanel } = useLabelingContext();
  const { editingEnabled, setEditingEnabled } = useContext(EditStateContext);
  const { showSaveBar } = useContext<SaveContextProps>(SaveContext);
  const { sendAnalyticsEvent } = useContext<AnalyticsContextProps>(AnalyticsContext);
  const { id } = useRequiredParams<{ id: string }>();
  const { data: borehole, isLoading } = useBorehole(parseInt(id));
  const { data: currentUser } = useCurrentUser();

  useEffect(() => {
    setEditingEnabled(borehole?.locked !== null && borehole?.lockedById === currentUser?.id);
  }, [borehole?.locked, borehole?.lockedById, setEditingEnabled, currentUser?.id]);

  useEffect(() => {
    sendAnalyticsEvent();
  }, [sendAnalyticsEvent]);

  useEffect(() => {
    if (borehole?.locked && borehole?.lockedById !== currentUser?.id) {
      setEditableByCurrentUser(false);
      return;
    }
    const userRolesOnBorehole =
      currentUser?.workgroupRoles?.filter(w => w.workgroupId === borehole?.workgroupId).map(r => r.role) ?? [];
    const currentBoreholeStatus = borehole?.workflows.sort((a: Workflow, b: Workflow) => a.id - b.id)[
      borehole?.workflows.length - 1
    ].role;
    const userRoleMatches = userRolesOnBorehole?.includes(currentBoreholeStatus);
    const isStatusPage = location.pathname.endsWith("/status");
    const isBoreholeInEditWorkflow = currentBoreholeStatus === Role.Editor;

    setEditableByCurrentUser(userRoleMatches && (isStatusPage || isBoreholeInEditWorkflow));
  }, [
    borehole?.locked,
    borehole?.lockedById,
    borehole?.workflows,
    borehole?.workgroupId,
    currentUser,
    location.pathname,
  ]);

  if (isLoading || !borehole)
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
        <Suspense
          fallback={
            <FullPageCentered>
              <CircularProgress />
            </FullPageCentered>
          }>
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
        </Suspense>
      </LayoutBox>
    </>
  );
};
