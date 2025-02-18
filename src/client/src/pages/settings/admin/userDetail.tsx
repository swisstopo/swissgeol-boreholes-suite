import { ChangeEvent, FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, Checkbox, Stack, Typography } from "@mui/material";
import { User, Workgroup, WorkgroupRole } from "../../../api/apiInterfaces.ts";
import { fetchUser, updateUser } from "../../../api/user.ts";
import { theme } from "../../../AppTheme.ts";
import { AddButton } from "../../../components/buttons/buttons.tsx";
import { useApiRequest } from "../../../hooks/useApiRequest.ts";
import { AddWorkgroupDialog } from "./addWorkgroupDialog.tsx";
import { WorkgroupTable } from "./workgroupTable.tsx";

interface UserDetailProps {
  user: User | null;
  setUser: (user: User | null) => void;
}

export const UserDetail: FC<UserDetailProps> = ({ user, setUser }) => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [userWorkgroups, setUserWorkgroups] = useState<Workgroup[]>();
  const [workgroupDialogOpen, setWorkgroupDialogOpen] = useState(false);
  const { callApiWithErrorHandling, callApiWithRollback } = useApiRequest();
  const history = useHistory();

  const getUniqueWorkgroups = (user: User) => {
    const { workgroupRoles } = user;
    if (!workgroupRoles || workgroupRoles.length < 1) return [];
    const workgroupsMap = new Map();
    workgroupRoles.forEach((r: WorkgroupRole) => {
      if (workgroupsMap.has(r.workgroupId)) {
        workgroupsMap.get(r.workgroupId).roles.push(r.role);
      } else {
        workgroupsMap.set(r.workgroupId, {
          ...r.workgroup,
          roles: [r.role],
        });
      }
    });
    return Array.from(workgroupsMap.values());
  };

  useEffect(() => {
    const getUser = async () => {
      const user: User = await callApiWithErrorHandling(fetchUser, [parseInt(id)]);
      if (!user) {
        history.push("/setting#users");
      } else {
        setUser(user);

        // Get the transformed array of unique workgroups with roles
        setUserWorkgroups(getUniqueWorkgroups(user));
      }
    };
    getUser();
  }, [callApiWithErrorHandling, history, id, setUser]);

  if (!user) return;
  const isDisabled = user.isDisabled ?? true;

  const handleCheckboxChange = async (event: ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();
    if (user) {
      // Define rollback function to revert the state if the API call fails
      const rollback = () => setUser({ ...user });

      // Optimistically update the user in the state
      const updatedUser = { ...user, isAdmin: event.target.checked };
      setUser({ ...updatedUser });

      await callApiWithRollback(updateUser, [updatedUser], rollback);
    }
  };

  const addWorkgroup = () => {
    setWorkgroupDialogOpen(true);
  };

  return (
    <Stack
      sx={{
        height: "100%",
        opacity: isDisabled ? "50%" : "100%",
        p: 5,
        overflowY: "auto",
        backgroundColor: theme.palette.background.lightgrey,
      }}>
      <Card data-cy="user-general" sx={{ mb: 3 }}>
        <CardHeader title={t("general")} sx={{ p: 4, pb: 3 }} titleTypographyProps={{ variant: "h5" }} />
        <CardContent sx={{ pt: 4, px: 3 }}>
          <Stack direction={"row"} alignItems={"center"}>
            <Checkbox
              checked={user.isAdmin}
              onChange={handleCheckboxChange}
              data-cy="is-user-admin-checkbox"
              disabled={isDisabled}
            />
            <Typography>Admin</Typography>
          </Stack>
        </CardContent>
      </Card>
      <Card data-cy="user-workgroups">
        <CardHeader
          title={t("workgroups")}
          sx={{ p: 4, pb: 3 }}
          titleTypographyProps={{ variant: "h5" }}
          action={<AddButton label="addWorkgroup" variant="contained" onClick={() => addWorkgroup()} />}
        />
        <CardContent sx={{ pt: 4, px: 3 }}>
          {userWorkgroups && userWorkgroups?.length > 0 && (
            <WorkgroupTable
              isDisabled={isDisabled}
              workgroups={userWorkgroups}
              user={user}
              setWorkgroups={setUserWorkgroups}
            />
          )}
        </CardContent>
      </Card>
      <AddWorkgroupDialog
        open={workgroupDialogOpen}
        setOpen={setWorkgroupDialogOpen}
        userId={id}
        setUserWorkgroups={setUserWorkgroups}
        userWorkgroups={userWorkgroups ?? []}
      />
    </Stack>
  );
};
