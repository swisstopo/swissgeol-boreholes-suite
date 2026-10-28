import { FC, useMemo } from "react";
import { Role, User } from "../../../../api/generated";
import { useWorkgroupMutations, useWorkgroups, workgroupQueryKey } from "../../../../api/workgroup.ts";
import { getRoleInWorkgroup } from "../workgroupRoles.ts";
import { EntityType } from "./entityType.ts";
import { RoleAssignmentDialog } from "./roleAssignmentDialog.tsx";

interface AddWorkgroupRoleDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  user: User;
}

export const AddWorkgroupRoleDialog: FC<AddWorkgroupRoleDialogProps> = ({ open, setOpen, user }) => {
  const { data: workgroups } = useWorkgroups();
  const {
    setWorkgroupRoles: { mutate: setWorkgroupRoles, isPending: isAddingWorkgroups },
  } = useWorkgroupMutations();

  const workgroupOptions = useMemo(
    () =>
      workgroups
        ?.filter(workgroup => !workgroup.isDisabled && !getRoleInWorkgroup(user, workgroup.id))
        .map(workgroup => ({ id: workgroup.id, label: workgroup.name })),
    [workgroups, user],
  );

  const addWorkgroups = (workgroupIds: number[], role: Role, onAdded: () => void) => {
    setWorkgroupRoles(
      workgroupIds.map(workgroupId => ({ userId: user.id, workgroupId, role, isActive: true })),
      { onSuccess: onAdded },
    );
  };

  if (!workgroupOptions) return;
  return (
    <RoleAssignmentDialog
      open={open}
      setOpen={setOpen}
      entityQueryKey={workgroupQueryKey}
      addEntities={addWorkgroups}
      isAdding={isAddingWorkgroups}
      entityType={EntityType.workgroup}
      options={workgroupOptions}
    />
  );
};
