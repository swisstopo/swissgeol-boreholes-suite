import { FC, MouseEvent, useCallback, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, Chip, Stack } from "@mui/material";
import { GridColDef, GridFilterModel, GridRenderCellParams } from "@mui/x-data-grid";
import { Trash2, X } from "lucide-react";
import { User, WorkgroupRole } from "../../../api/apiInterfaces.ts";
import { useUsers } from "../../../api/user.ts";
import { useSelectedWorkgroup, useWorkgroupMutations } from "../../../api/workgroup.ts";
import { theme } from "../../../AppTheme.ts";
import { AddButton } from "../../../components/buttons/buttons.tsx";
import { FormInputDisplayOnly } from "../../../components/form/form.ts";
import { PromptContext } from "../../../components/prompt/promptContext.tsx";
import { Table } from "../../../components/table/table.tsx";
import { useRequiredParams } from "../../../hooks/useRequiredParams.ts";
import { AddUserDialog } from "./dialogs/addUserDialog.tsx";
import { useSharedTableColumns } from "./useSharedTableColumns.tsx";
import { WorkgroupAdministrationContext } from "./workgroupAdministrationContext.tsx";

export const WorkgroupDetail: FC = () => {
  const { id } = useRequiredParams<{ id: string }>();
  const { t } = useTranslation();
  const [workgroupUsers, setWorkgroupUsers] = useState<User[]>();
  const { firstNameColumn, lastNameColumn, emailColumn, statusColumn, getDeleteColumn } = useSharedTableColumns();
  const { data: users } = useUsers();
  const [userDialogOpen, setUserDialogOpen] = useState(false);

  const { workgroupDetailTableSortModel, setWorkgroupDetailTableSortModel } =
    useContext(WorkgroupAdministrationContext);
  const { data: selectedWorkgroup } = useSelectedWorkgroup(parseInt(id));
  const {
    removeAllRoles: { mutate: removeAllWorkgroupRolesForUser },
  } = useWorkgroupMutations();
  const { showPrompt } = useContext(PromptContext);
  const [filterModel, setFilterModel] = useState<GridFilterModel>();
  const handleFilterModelChange = useCallback((newModel: GridFilterModel) => setFilterModel(newModel), []);

  useEffect(() => {
    if (users) {
      const usersInWorkgroup = users.filter((user: User) =>
        user.workgroupRoles?.some((wgr: WorkgroupRole) => wgr.workgroupId === parseInt(id)),
      );
      setWorkgroupUsers(usersInWorkgroup);
    }
  }, [id, users]);

  if (!selectedWorkgroup) return;

  const handleRemoveUserFromWorkgroup = (event: MouseEvent<HTMLButtonElement>, id: number) => {
    event.stopPropagation();
    const user = users?.find(user => user.id === id);
    if (!user) return;
    showPrompt(t("confirmRemoveRoles", { name: user.name, workgroupName: selectedWorkgroup.name }), [
      {
        label: "cancel",
        icon: <X />,
      },
      {
        label: "delete",
        icon: <Trash2 />,
        variant: "contained",
        action: () => {
          if (!selectedWorkgroup || !user?.workgroupRoles || user.workgroupRoles.length <= 0) return;
          removeAllWorkgroupRolesForUser({
            userId: user.id,
            workgroupId: selectedWorkgroup.id,
            roles: user.workgroupRoles?.map(r => r.role),
          });
        },
      },
    ]);
  };

  const addUser = () => {
    setUserDialogOpen(true);
  };

  const renderRoleChips = (params: GridRenderCellParams<object[]>) => {
    const workgroupRoles = params.value.filter((role: WorkgroupRole) => role.workgroupId === parseInt(id));
    return (
      <Stack direction="row" gap={1} p={1.2} sx={{ flexWrap: "wrap" }}>
        {workgroupRoles.map((workgroupRole: WorkgroupRole) => (
          <Chip
            key={workgroupRole.role}
            label={workgroupRole.role.toUpperCase()}
            size="small"
            color="primary"
            data-cy={`${workgroupRole.role}-chip`}
          />
        ))}
      </Stack>
    );
  };

  const isDisabled = selectedWorkgroup?.isDisabled;

  const columns: GridColDef[] = [
    firstNameColumn,
    lastNameColumn,
    emailColumn,
    statusColumn,
    {
      field: "workgroupRoles",
      headerName: t("roles"),
      flex: 1,
      renderCell: renderRoleChips,
    },
    getDeleteColumn(handleRemoveUserFromWorkgroup, isDisabled),
  ];

  return (
    <Stack
      data-cy={"workgroup-detail"}
      sx={{
        height: "100%",
        opacity: isDisabled ? "50%" : "100%",
        p: 5,
        overflowY: "auto",
        backgroundColor: theme.palette.background.lightgrey,
      }}>
      <Card data-cy="workgroup-general" sx={{ mb: 3 }}>
        <CardHeader title={t("general")} sx={{ p: 4, pb: 3 }} titleTypographyProps={{ variant: "h5" }} />
        <CardContent sx={{ pt: 4, px: 3 }}>
          <Stack direction={"row"} alignItems={"center"}>
            <FormInputDisplayOnly label={"workgroup"} value={selectedWorkgroup?.name ?? null} sx={{ maxWidth: 500 }} />
          </Stack>
        </CardContent>
      </Card>
      <Card data-cy="workgroup-users">
        <CardHeader
          title={t("users")}
          sx={{ p: 4, pb: 3 }}
          titleTypographyProps={{ variant: "h5" }}
          action={<AddButton label="addUser" variant="contained" onClick={addUser} disabled={isDisabled} />}
        />
        <CardContent sx={{ pt: 4, px: 3 }}>
          {workgroupUsers && workgroupUsers?.length > 0 && (
            <Table<User>
              rows={workgroupUsers}
              columns={columns}
              filterModel={filterModel}
              onFilterModelChange={handleFilterModelChange}
              isDisabled={isDisabled}
              sortModel={workgroupDetailTableSortModel}
              onSortModelChange={setWorkgroupDetailTableSortModel}
              dataCy={"workgroup-users-table"}
              rowAutoHeight={true}
              sx={{ border: "none" }}
            />
          )}
        </CardContent>
      </Card>
      <AddUserDialog
        open={userDialogOpen}
        setOpen={setUserDialogOpen}
        workgroupId={parseInt(id)} //
      />
    </Stack>
  );
};
