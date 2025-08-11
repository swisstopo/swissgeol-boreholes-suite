import { FC, Suspense, useContext, useEffect } from "react";
import { Box, CircularProgress, Stack } from "@mui/material";
import { useBorehole } from "../../api/borehole.ts";
import { useCurrentUser } from "../../api/user.ts";
import { SidePanelToggleButton } from "../../components/buttons/labelingButtons.tsx";
import { GoogleAnalytics } from "../../components/GoogleAnalytics.tsx";
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
  const { panelPosition, panelOpen, togglePanel } = useLabelingContext();
  const { editingEnabled, setEditingEnabled } = useContext(EditStateContext);
  const { showSaveBar } = useContext<SaveContextProps>(SaveContext);
  const { analyticsId } = useContext<AnalyticsContextProps>(AnalyticsContext);
  const { id } = useRequiredParams<{ id: string }>();
  const { data: borehole, isLoading } = useBorehole(parseInt(id));
  const { data: currentUser } = useCurrentUser();

  useEffect(() => {
    setEditingEnabled(borehole?.locked !== null && borehole?.lockedById === currentUser?.id);
  }, [borehole?.locked, borehole?.lockedById, setEditingEnabled, currentUser?.id]);

  if (isLoading || !borehole)
    return (
      <Stack height="100%" alignItems="center" justifyContent="center">
        <CircularProgress />
      </Stack>
    );

  return (
    <>
      <DetailHeader borehole={borehole} />
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
      {analyticsId && <GoogleAnalytics id={analyticsId} />}
    </>
  );
};
