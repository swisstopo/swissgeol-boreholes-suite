import { ChangeEvent, FC, MouseEvent, useCallback, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, Checkbox, Chip, Stack, Typography } from "@mui/material";
import { GridColDef, GridFilterModel, GridRenderCellParams } from "@mui/x-data-grid";
import { Trash2, X } from "lucide-react";
import { User, Workgroup, WorkgroupRole } from "../../../api/apiInterfaces.ts";
import { fetchUser, updateUser } from "../../../api/user.ts";
import { removeAllWorkgroupRolesForUser } from "../../../api/workgroup.ts";
import { theme } from "../../../AppTheme.ts";
import { AddButton } from "../../../components/buttons/buttons.tsx";
import { PromptContext } from "../../../components/prompt/promptContext.tsx";
import { useApiRequest } from "../../../hooks/useApiRequest.ts";
import { AddWorkgroupDialog } from "./addWorkgroupDialog.tsx";
import { Table } from "./Table.tsx";
import { UserAdministrationContext } from "./userAdministrationContext.tsx";
import { useSharedTableColumns } from "./useSharedTableColumns.tsx";

export const UserDetail: FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [userWorkgroups, setUserWorkgroups] = useState<Workgroup[]>();
  const [workgroupDialogOpen, setWorkgroupDialogOpen] = useState(false);
  const [filterModel, setFilterModel] = useState<GridFilterModel>();
  const { workgroupNameColumn, boreholeCountColumn, statusColumn, getDeleteColumn } = useSharedTableColumns();
  const { selectedUser, setSelectedUser, userDetailTableSortModel, setUserDetailTableSortModel } =
    useContext(UserAdministrationContext);
  const { showPrompt } = useContext(PromptContext);
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
        setSelectedUser(user);

        // Get the transformed array of unique workgroups with roles
        setUserWorkgroups(getUniqueWorkgroups(user));
      }
    };
    getUser();
  }, [callApiWithErrorHandling, history, id, setSelectedUser]);

  const handleFilterModelChange = useCallback((newModel: GridFilterModel) => setFilterModel(newModel), []);

  if (!selectedUser) return;
  const isDisabled = selectedUser.isDisabled ?? true;

  const handleCheckboxChange = async (event: ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();
    if (selectedUser) {
      // Define rollback function to revert the state if the API call fails
      const rollback = () => setSelectedUser({ ...selectedUser });

      // Optimistically update the user in the state
      const updatedUser = { ...selectedUser, isAdmin: event.target.checked };
      setSelectedUser({ ...updatedUser });

      await callApiWithRollback(updateUser, [updatedUser], rollback);
    }
  };

  const addWorkgroup = () => {
    setWorkgroupDialogOpen(true);
  };

  const renderRoleChips = (params: GridRenderCellParams<object[]>) => {
    return (
      <Stack direction="row" gap={1} p={1.2}>
        {params.value.map((roleName: string) => (
          <Chip
            key={roleName}
            label={roleName.toUpperCase()}
            size="small"
            color="primary"
            data-cy={`${roleName}-chip`}
          />
        ))}
      </Stack>
    );
  };

  const removeAllWorkgroupRolesWithRollback = async (workgroup: Workgroup) => {
    // Define rollback function to revert the state if the API call fails
    const rollback = () => {
      setUserWorkgroups([...userWorkgroups!]);
    };

    // Optimistically update the workgroup table
    setUserWorkgroups([...userWorkgroups!.filter(wgp => wgp.id != workgroup.id)]);

    if (!selectedUser) return;
    await callApiWithRollback(
      removeAllWorkgroupRolesForUser,
      [selectedUser.id, workgroup.id, workgroup.roles],
      rollback,
    );
  };

  const handleRemoveAllWorkgroupRoles = (event: MouseEvent<HTMLButtonElement>, id: number) => {
    event.stopPropagation();
    if (!userWorkgroups || !selectedUser) return;
    const userWorkgroup = userWorkgroups.find(workgroup => workgroup.id === id);
    if (!userWorkgroup) return;
    showPrompt(t("confirmRemoveRoles", { name: selectedUser.name, workgroupName: userWorkgroup.name }), [
      {
        label: t("cancel"),
        icon: <X />,
      },
      {
        label: t("delete"),
        icon: <Trash2 />,
        variant: "contained",
        action: () => {
          removeAllWorkgroupRolesWithRollback(userWorkgroup);
        },
      },
    ]);
  };

  const columns: GridColDef[] = [
    workgroupNameColumn,
    boreholeCountColumn,
    {
      field: "roles",
      headerName: t("roles"),
      renderCell: renderRoleChips,
      flex: 1,
    },
    statusColumn,
    getDeleteColumn(handleRemoveAllWorkgroupRoles),
  ];

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
              checked={selectedUser.isAdmin}
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
            <Table
              rows={userWorkgroups}
              columns={columns}
              filterModel={filterModel}
              onFilterModelChange={handleFilterModelChange}
              sortModel={userDetailTableSortModel}
              isDisabled={isDisabled}
              onSortModelChange={setUserDetailTableSortModel}
              dataCy={"user-workgroups-table"}
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
