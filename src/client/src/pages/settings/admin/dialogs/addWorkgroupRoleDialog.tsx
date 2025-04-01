import { FC } from "react";
import { EntityType, Role, Workgroup } from "../../../../api/apiInterfaces.ts";
import { useWorkgroupMutations, useWorkgroups, workgroupQueryKey } from "../../../../api/workgroup.ts";
import { RoleAssignmentDialog } from "./roleAssignmentDialog.tsx";

interface AddWorkgroupRoleDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  userId: number;
}

export const AddWorkgroupRoleDialog: FC<AddWorkgroupRoleDialogProps> = ({ open, setOpen, userId }) => {
  const { data: workgroups } = useWorkgroups();
  const {
    setWorkgroupRole: { mutate: setWorkgroupRole },
  } = useWorkgroupMutations();

  const addWorkgroup = async (workgroupId: string, role: Role) => {
    setWorkgroupRole({ userId: userId, workgroupId: Number(workgroupId), role: role, isActive: true });
  };

  if (!workgroups) return;
  return (
    <RoleAssignmentDialog<Workgroup>
      open={open}
      setOpen={setOpen}
      entityQueryKey={workgroupQueryKey}
      addEntity={addWorkgroup}
      entityType={EntityType.workgroup}
      entities={workgroups}
    />
  );
};
