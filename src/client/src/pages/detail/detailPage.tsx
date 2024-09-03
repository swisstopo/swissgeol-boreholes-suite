import { MainContentBox, SidebarBox } from "../../components/styledComponents.ts";
import { FC, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { Borehole, ReduxRootState } from "../../api-lib/ReduxStateInterfaces.ts";
import DetailSideNav from "./detailSideNav";
import DetailPageContent from "./detailPageContent";
import DetailHeader from "./detailHeader.tsx";
import { Box } from "@mui/material";
import { useLabelingContext } from "./labeling/labelingInterfaces.tsx";
import LabelingPanel from "./labeling/labelingPanel.tsx";
import { LabelingToggleButton } from "../../components/buttons/labelingButton.tsx";

interface DetailPageContentProps {
  editingEnabled: boolean;
  editableByCurrentUser: boolean;
}

export const DetailPage: FC = () => {
  const [editingEnabled, setEditingEnabled] = useState(false);
  const [editableByCurrentUser, setEditableByCurrentUser] = useState(false);
  const borehole: Borehole = useSelector((state: ReduxRootState) => state.core_borehole);
  const user = useSelector((state: ReduxRootState) => state.core_user);
  const location = useLocation();
  const { panelPosition, panelOpen, togglePanel } = useLabelingContext();

  useEffect(() => {
    setEditingEnabled(borehole.data.lock !== null);
  }, [borehole.data.lock]);

  useEffect(() => {
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
  }, [editingEnabled, user, borehole, location]);

  const props: DetailPageContentProps = {
    editingEnabled: editingEnabled,
    editableByCurrentUser: editableByCurrentUser,
  };

  return (
    <>
      <DetailHeader
        editingEnabled={editingEnabled}
        setEditingEnabled={setEditingEnabled}
        editableByCurrentUser={editableByCurrentUser}
      />
      <Box sx={{ display: "flex", flexDirection: "column", flex: "1 1 100%", overflow: "hidden" }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            height: panelOpen && panelPosition === "bottom" ? "50%" : "100%",
          }}>
          <SidebarBox>
            <DetailSideNav />
          </SidebarBox>
          <Box sx={{ display: "flex", flexDirection: "row", width: "100%" }}>
            <MainContentBox
              sx={{
                width: panelOpen && panelPosition === "right" ? "50%" : "100%",
              }}>
              <LabelingToggleButton panelOpen={panelOpen} panelPosition={panelPosition} onClick={() => togglePanel()} />
              <DetailPageContent {...props} />
            </MainContentBox>
            {panelOpen && panelPosition === "right" && <LabelingPanel />}
          </Box>
        </Box>
        {panelOpen && panelPosition === "bottom" && <LabelingPanel />}
      </Box>
    </>
  );
};
