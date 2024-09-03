import { LayoutBox, MainContentBox, SidebarBox } from "../../components/styledComponents.ts";
import { FC, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { Borehole, ReduxRootState } from "../../api-lib/ReduxStateInterfaces.ts";
import DetailSideNav from "./detailSideNav";
import DetailPageContent from "./detailPageContent";
import DetailHeader from "./detailHeader.tsx";

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
      <LayoutBox>
        <SidebarBox>
          <DetailSideNav />
        </SidebarBox>
        <MainContentBox>
          <DetailPageContent {...props} />
        </MainContentBox>
      </LayoutBox>
    </>
  );
};
