import { LayoutBox, MainContentBox, SidebarBox } from "../../components/styledComponents.ts";
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
  const showLabeling = false;

  useEffect(() => {
    setEditingEnabled(borehole.data.lock !== null);
  }, [borehole.data.lock]);

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
      <LayoutBox>
        <SidebarBox>
          <DetailSideNav />
        </SidebarBox>
        <Box sx={{ display: "flex", flexDirection: panelPosition === "right" ? "row" : "column", width: "100%" }}>
          <MainContentBox
            sx={{
              width: panelOpen && panelPosition === "right" ? "50%" : "100%",
              height: panelOpen && panelPosition === "bottom" ? "50%" : "100%",
            }}>
            {editingEnabled && showLabeling && (
              <LabelingToggleButton panelOpen={panelOpen} panelPosition={panelPosition} onClick={() => togglePanel()} />
            )}
            <DetailPageContent {...props} />
          </MainContentBox>
          {editingEnabled && panelOpen && <LabelingPanel boreholeId={borehole.data.id} />}
        </Box>
      </LayoutBox>
    </>
  );
};
