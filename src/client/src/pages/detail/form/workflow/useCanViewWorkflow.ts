import { useCurrentUser } from "../../../../api/user.ts";
import { useAuth } from "../../../../auth/useBoreholesAuth.tsx";
import { canViewWorkflow } from "./workflowRole.ts";

// Anonymous mode signs every visitor in as one pre-configured user. Its workgroup roles are plain
// database entries, so the status stays hidden in that mode whatever roles the user holds.
export const useCanViewWorkflow = (workgroupId: number) => {
  const auth = useAuth();
  const { data: currentUser, isLoading } = useCurrentUser();
  return {
    isLoading: !auth.anonymousModeEnabled && isLoading,
    canView: !auth.anonymousModeEnabled && canViewWorkflow(currentUser, workgroupId),
  };
};
