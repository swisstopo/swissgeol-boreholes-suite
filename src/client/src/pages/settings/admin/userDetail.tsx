import { ChangeEvent, FC, MouseEvent, useCallback, useContext, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, Checkbox, Stack, Typography } from "@mui/material";
import { GridColDef, GridFilterModel, GridRenderCellParams } from "@mui/x-data-grid";
import { Trash2, X } from "lucide-react";
import { Role } from "../../../api/generated";
import { useSelectedUser, useUserMutations } from "../../../api/user.ts";
import { useWorkgroupMutations } from "../../../api/workgroup.ts";
import { theme } from "../../../AppTheme.ts";
import { AddButton } from "../../../components/buttons/buttons.tsx";
import { PromptContext } from "../../../components/prompt/promptContext.tsx";
import { Table } from "../../../components/table/table.tsx";
import { useRequiredId } from "../../../hooks/useRequiredId.ts";
import { AddWorkgroupRoleDialog } from "./dialogs/addWorkgroupRoleDialog.tsx";
import { RoleSelect } from "./roleSelect.tsx";
import { UserAdministrationContext } from "./userAdministrationContext.tsx";
import { useSharedTableColumns } from "./useSharedTableColumns.tsx";
import { getWorkgroupsWithRole, WorkgroupWithRole } from "./workgroupRoles.ts";

export const UserDetail: FC = () => {
  const id = useRequiredId();
  const { t } = useTranslation();
  const [workgroupDialogOpen, setWorkgroupDialogOpen] = useState(false);
  const [filterModel, setFilterModel] = useState<GridFilterModel>();
  const { workgroupNameColumn, statusColumn, getDeleteColumn } = useSharedTableColumns();
  const { userDetailTableSortModel, setUserDetailTableSortModel } = useContext(UserAdministrationContext);
  const { showPrompt } = useContext(PromptContext);
  const { data: selectedUser } = useSelectedUser(id);
  const {
    update: { mutate: updateUser },
  } = useUserMutations();
  const {
    setWorkgroupRoles: { mutate: setWorkgroupRoles, isPending: isSettingWorkgroupRoles },
  } = useWorkgroupMutations();

  // Get the user's workgroups, each with the user's role in it
  const userWorkgroups = useMemo(
    () => (selectedUser ? getWorkgroupsWithRole(selectedUser) : undefined),
    [selectedUser],
  );

  const handleFilterModelChange = useCallback((newModel: GridFilterModel) => setFilterModel(newModel), []);

  if (!selectedUser) return;
  const isDisabled = selectedUser.isDisabled ?? true;

  const handleCheckboxChange = (event: ChangeEvent<HTMLInputElement>) => {
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

  const renderRoleSelect = (params: GridRenderCellParams<WorkgroupWithRole, Role>) =>
    params.value && (
      <RoleSelect
        value={params.value}
        label={`${t("role")} ${params.row.name}`}
        disabled={isDisabled || isSettingWorkgroupRoles}
        onChange={role =>
          setWorkgroupRoles([{ userId: selectedUser.id, workgroupId: params.row.id, role, isActive: true }])
        }
      />
    );

  const handleRemoveWorkgroupRole = (event: MouseEvent<HTMLButtonElement>, id: number) => {
    event.stopPropagation();
    if (!userWorkgroups || !selectedUser) return;
    const userWorkgroup = userWorkgroups.find(workgroup => workgroup.id === id);
    if (!userWorkgroup) return;
    showPrompt(t("confirmRemoveRole", { name: selectedUser.name, workgroupName: userWorkgroup.name }), [
      {
        label: "cancel",
        icon: <X />,
      },
      {
        label: "delete",
        icon: <Trash2 />,
        variant: "contained",
        action: () => {
          if (!selectedUser) return;
          setWorkgroupRoles([
            {
              userId: selectedUser.id,
              workgroupId: userWorkgroup.id,
              role: userWorkgroup.role,
              isActive: false,
            },
          ]);
        },
      },
    ]);
  };

  const columns: GridColDef[] = [
    workgroupNameColumn,
    {
      field: "role",
      headerName: t("role"),
      renderCell: renderRoleSelect,
      flex: 1,
      minWidth: 200,
    },
    statusColumn,
    getDeleteColumn(handleRemoveWorkgroupRole, isDisabled),
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
        <CardHeader title={t("general")} sx={{ p: 4, pb: 3 }} slotProps={{ title: { variant: "h5" } }} />
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
          slotProps={{ title: { variant: "h5" } }}
          action={<AddButton label="addWorkgroup" variant="contained" onClick={addWorkgroup} disabled={isDisabled} />}
        />
        <CardContent sx={{ pt: 4, px: 3 }}>
          {userWorkgroups && userWorkgroups?.length > 0 && (
            <Table<WorkgroupWithRole>
              rows={userWorkgroups}
              columns={columns}
              filterModel={filterModel}
              onFilterModelChange={handleFilterModelChange}
              sortModel={userDetailTableSortModel}
              isDisabled={isDisabled}
              onSortModelChange={setUserDetailTableSortModel}
              dataCy={"user-workgroups-table"}
              rowAutoHeight={true}
            />
          )}
        </CardContent>
      </Card>
      <AddWorkgroupRoleDialog open={workgroupDialogOpen} setOpen={setWorkgroupDialogOpen} user={selectedUser} />
    </Stack>
  );
};
