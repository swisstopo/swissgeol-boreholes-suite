import { FC } from "react";
import { Role } from "../../../../api/generated";
import { useWorkgroupMutations, useWorkgroups, workgroupQueryKey } from "../../../../api/workgroup.ts";
import { EntityType } from "./entityType.ts";
import { RoleAssignmentDialog } from "./roleAssignmentDialog.tsx";

interface AddWorkgroupRoleDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  userId: number;
}

export const AddWorkgroupRoleDialog: FC<AddWorkgroupRoleDialogProps> = ({ open, setOpen, userId }) => {
  const { data: workgroups } = useWorkgroups();
  const {
    setWorkgroupRoles: { mutate: setWorkgroupRoles },
  } = useWorkgroupMutations();

  const addWorkgroups = (workgroupIds: number[], role: Role) => {
    setWorkgroupRoles(workgroupIds.map(workgroupId => ({ userId, workgroupId, role, isActive: true })));
  };

  if (!workgroups) return;
  const workgroupOptions = workgroups.map(workgroup => ({ id: workgroup.id, label: workgroup.name }));
  return (
    <RoleAssignmentDialog
      open={open}
      setOpen={setOpen}
      entityQueryKey={workgroupQueryKey}
      addEntities={addWorkgroups}
      entityType={EntityType.workgroup}
      options={workgroupOptions}
    />
  );
};
