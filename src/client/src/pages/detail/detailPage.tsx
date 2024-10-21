import { FC, useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useParams } from "react-router-dom";
import { Box, CircularProgress, Stack } from "@mui/material";
import { loadBorehole } from "../../api-lib";
import { Borehole, ReduxRootState } from "../../api-lib/ReduxStateInterfaces.ts";
import { LabelingToggleButton } from "../../components/buttons/labelingButton.tsx";
import { LayoutBox, MainContentBox, SidebarBox } from "../../components/styledComponents.ts";
import DetailHeader from "./detailHeader.tsx";
import { DetailPageContent } from "./detailPageContent.tsx";
import DetailSideNav from "./detailSideNav";
import { useLabelingContext } from "./labeling/labelingInterfaces.tsx";
import LabelingPanel from "./labeling/labelingPanel.tsx";
import { SaveBar } from "./saveBar.tsx";

export const DetailPage: FC = () => {
  const [editingEnabled, setEditingEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editableByCurrentUser, setEditableByCurrentUser] = useState(false);
  const borehole: Borehole = useSelector((state: ReduxRootState) => state.core_borehole);
  const user = useSelector((state: ReduxRootState) => state.core_user);
  const location = useLocation();
  const { panelPosition, panelOpen, togglePanel } = useLabelingContext();
  const dispatch = useDispatch();
  const { id } = useParams<{
    id: string;
  }>();

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

  useEffect(() => {
    loadOrCreate(id);
  }, [id, loadOrCreate]);

  useEffect(() => {
    if (!editingEnabled) {
      togglePanel(false);
    }

    if (borehole.data.lock !== null && borehole.data.lock.id !== user.data.id) {
      setEditableByCurrentUser(false);
      return;
    }

    const matchingWorkgroup =
      user.data.workgroups.find(workgroup => workgroup.id === borehole.data.workgroup?.id) ?? false;
    const userRoleMatches =
      matchingWorkgroup &&
      Object.prototype.hasOwnProperty.call(matchingWorkgroup, "roles") &&
      matchingWorkgroup.roles.includes(borehole.data.role);
    const isStatusPage = location.pathname.endsWith("/status");
    const isBoreholeInEditWorkflow = borehole?.data.workflow?.role === "EDIT";

    setEditableByCurrentUser(userRoleMatches && (isStatusPage || isBoreholeInEditWorkflow));
  }, [editingEnabled, user, borehole, location, togglePanel]);

  if (loading)
    return (
      <Stack height="100%" alignItems="center" justifyContent="center">
        <CircularProgress />
      </Stack>
    );

  return (
    <>
      <DetailHeader
        editingEnabled={editingEnabled}
        setEditingEnabled={setEditingEnabled}
        editableByCurrentUser={editableByCurrentUser}
      />
      <LayoutBox>
        <SidebarBox>
          <DetailSideNav />
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
                boreholeId={parseInt(id, 10)}
              />
            </MainContentBox>
            {editingEnabled && panelOpen && <LabelingPanel boreholeId={borehole.data.id} />}
          </Box>
          {location.pathname.endsWith("/location") && <SaveBar />}
        </Stack>
      </LayoutBox>
    </>
  );
};
