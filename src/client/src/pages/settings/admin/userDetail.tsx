import { ChangeEvent, FC, MouseEvent, useCallback, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, Checkbox, Chip, Stack, Typography } from "@mui/material";
import { GridColDef, GridFilterModel, GridRenderCellParams } from "@mui/x-data-grid";
import { Trash2, X } from "lucide-react";
import { User, Workgroup, WorkgroupRole } from "../../../api/apiInterfaces.ts";
import { useSelectedUser, useUserMutations } from "../../../api/user.ts";
import { useWorkgroupMutations } from "../../../api/workgroup.ts";
import { theme } from "../../../AppTheme.ts";
import { AddButton } from "../../../components/buttons/buttons.tsx";
import { PromptContext } from "../../../components/prompt/promptContext.tsx";
import { Table } from "../../../components/table/table.tsx";
import { AddWorkgroupRoleDialog } from "./dialogs/addWorkgroupRoleDialog.tsx";
import { UserAdministrationContext } from "./userAdministrationContext.tsx";
import { useSharedTableColumns } from "./useSharedTableColumns.tsx";

export const UserDetail: FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [userWorkgroups, setUserWorkgroups] = useState<Workgroup[]>();
  const [workgroupDialogOpen, setWorkgroupDialogOpen] = useState(false);
  const [filterModel, setFilterModel] = useState<GridFilterModel>();
  const { workgroupNameColumn, statusColumn, getDeleteColumn } = useSharedTableColumns();
  const { userDetailTableSortModel, setUserDetailTableSortModel } = useContext(UserAdministrationContext);
  const { showPrompt } = useContext(PromptContext);
  const { data: selectedUser } = useSelectedUser(parseInt(id));
  const {
    update: { mutate: updateUser },
  } = useUserMutations();
  const {
    removeAllRoles: { mutate: removeAllWorkgroupRolesForUser },
  } = useWorkgroupMutations();

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
    // Get the transformed array of unique workgroups with roles
    if (selectedUser) {
      setUserWorkgroups(getUniqueWorkgroups(selectedUser));
    }
  }, [selectedUser]);

  const handleFilterModelChange = useCallback((newModel: GridFilterModel) => setFilterModel(newModel), []);

  if (!selectedUser) return;
  const isDisabled = selectedUser.isDisabled ?? true;

  const handleCheckboxChange = async (event: ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();
    if (selectedUser) {
      // Optimistically update the user in the state
      const updatedUser = { ...selectedUser, isAdmin: event.target.checked };
      updateUser(updatedUser);
    }
  };

  const addWorkgroup = () => {
    setWorkgroupDialogOpen(true);
  };

  const renderRoleChips = (params: GridRenderCellParams<object[]>) => {
    return (
      <Stack direction="row" gap={1} p={1.2} sx={{ flexWrap: "wrap" }}>
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
          if (!selectedUser || !userWorkgroup?.roles) return;
          removeAllWorkgroupRolesForUser({
            userId: selectedUser.id,
            workgroupId: userWorkgroup.id,
            roles: userWorkgroup.roles,
          });
        },
      },
    ]);
  };

  const columns: GridColDef[] = [
    workgroupNameColumn,
    {
      field: "roles",
      headerName: t("roles"),
      renderCell: renderRoleChips,
      flex: 1,
    },
    statusColumn,
    getDeleteColumn(handleRemoveAllWorkgroupRoles, isDisabled),
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
          action={<AddButton label="addWorkgroup" variant="contained" onClick={addWorkgroup} disabled={isDisabled} />}
        />
        <CardContent sx={{ pt: 4, px: 3 }}>
          {userWorkgroups && userWorkgroups?.length > 0 && (
            <Table<Workgroup>
              rows={userWorkgroups}
              columns={columns}
              filterModel={filterModel}
              onFilterModelChange={handleFilterModelChange}
              sortModel={userDetailTableSortModel}
              isDisabled={isDisabled}
              onSortModelChange={setUserDetailTableSortModel}
              dataCy={"user-workgroups-table"}
              rowAutoHeight={true}
              sx={{ border: "none" }}
            />
          )}
        </CardContent>
      </Card>
      <AddWorkgroupRoleDialog open={workgroupDialogOpen} setOpen={setWorkgroupDialogOpen} userId={Number(id)} />
    </Stack>
  );
};
