import { FC, MouseEvent, useCallback, useContext, useMemo, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, Stack } from "@mui/material";
import { GridColDef, GridFilterModel, GridRenderCellParams } from "@mui/x-data-grid";
import { Trash2, X } from "lucide-react";
import { Role, User, UserWorkgroupRole } from "../../../api/generated";
import { useUsers } from "../../../api/user.ts";
import { useSelectedWorkgroup, useWorkgroupMutations } from "../../../api/workgroup.ts";
import { theme } from "../../../AppTheme.ts";
import { AddButton } from "../../../components/buttons/buttons.tsx";
import { FormInput } from "../../../components/form/form.ts";
import { PromptContext } from "../../../components/prompt/promptContext.tsx";
import { Table } from "../../../components/table/table.tsx";
import { useRequiredId } from "../../../hooks/useRequiredId.ts";
import { AddUserDialog } from "./dialogs/addUserDialog.tsx";
import { RoleChip } from "./roleChip.tsx";
import { useSharedTableColumns } from "./useSharedTableColumns.tsx";
import { WorkgroupAdministrationContext } from "./workgroupAdministrationContext.tsx";
import { getRoleInWorkgroup } from "./workgroupRoles.ts";

export const WorkgroupDetail: FC = () => {
  const id = useRequiredId();
  const { t } = useTranslation();
  const { firstNameColumn, lastNameColumn, emailColumn, statusColumn, getDeleteColumn } = useSharedTableColumns();
  const { data: users } = useUsers();
  const [userDialogOpen, setUserDialogOpen] = useState(false);

  const { workgroupDetailTableSortModel, setWorkgroupDetailTableSortModel } =
    useContext(WorkgroupAdministrationContext);
  const { data: selectedWorkgroup } = useSelectedWorkgroup(id);
  const {
    setWorkgroupRole: { mutate: setWorkgroupRole },
    update: { mutate: updateWorkgroup },
  } = useWorkgroupMutations();
  const { showPrompt } = useContext(PromptContext);
  const [filterModel, setFilterModel] = useState<GridFilterModel>();
  const handleFilterModelChange = useCallback((newModel: GridFilterModel) => setFilterModel(newModel), []);

  const formMethods = useForm({
    defaultValues: selectedWorkgroup,
  });

  const changeNameTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const changeName = useCallback(
    (name: string) => {
      // A direct commit supersedes a pending debounced one, which would otherwise repeat the same update.
      clearTimeout(changeNameTimer.current);
      if (!selectedWorkgroup || !name || name === selectedWorkgroup.name) return;

      const updatedWorkgroup = { ...selectedWorkgroup, name };
      updateWorkgroup(updatedWorkgroup);
    },
    [selectedWorkgroup, updateWorkgroup],
  );

  const debouncedChangeName = useCallback(
    (name: string) => {
      clearTimeout(changeNameTimer.current);
      changeNameTimer.current = setTimeout(() => changeName(name), 2000);
    },
    [changeName],
  );

  const workgroupUsers = useMemo(
    () => users?.filter((user: User) => user.workgroupRoles?.some((wgr: UserWorkgroupRole) => wgr.workgroupId === id)),
    [id, users],
  );

  if (!selectedWorkgroup) return;

  const handleRemoveUserFromWorkgroup = (event: MouseEvent<HTMLButtonElement>, id: number) => {
    event.stopPropagation();
    const user = users?.find(user => user.id === id);
    if (!user) return;
    showPrompt(t("confirmRemoveRole", { name: user.name, workgroupName: selectedWorkgroup.name }), [
      {
        label: "cancel",
        icon: <X />,
      },
      {
        label: "delete",
        icon: <Trash2 />,
        variant: "contained",
        action: () => {
          const role = getRoleInWorkgroup(user, selectedWorkgroup.id);
          if (!role) return;
          setWorkgroupRole({
            userId: user.id,
            workgroupId: selectedWorkgroup.id,
            role: role,
            isActive: false,
          });
        },
      },
    ]);
  };

  const addUser = () => {
    setUserDialogOpen(true);
  };

  const renderRoleChip = (params: GridRenderCellParams<User, Role | undefined>) =>
    params.value && <RoleChip role={params.value} />;

  const isDisabled = selectedWorkgroup?.isDisabled;

  const columns: GridColDef[] = [
    firstNameColumn,
    lastNameColumn,
    emailColumn,
    statusColumn,
    {
      field: "role",
      headerName: t("role"),
      flex: 1,
      valueGetter: (_value, row: User) => getRoleInWorkgroup(row, id),
      renderCell: renderRoleChip,
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
        <CardHeader title={t("general")} sx={{ p: 4, pb: 3 }} slotProps={{ title: { variant: "h5" } }} />
        <CardContent sx={{ pt: 4, px: 3 }}>
          <Stack direction={"row"} alignItems={"center"}>
            <FormProvider {...formMethods}>
              <FormInput
                label="workgroup"
                fieldName="workgroup"
                value={selectedWorkgroup?.name ?? ""}
                readonly={false}
                required
                sx={{ maxWidth: 500 }}
                onUpdate={value => debouncedChangeName(value)}
                inputProps={{
                  onBlur: e => changeName(e.target.value),
                }}
              />
            </FormProvider>
          </Stack>
        </CardContent>
      </Card>
      <Card data-cy="workgroup-users">
        <CardHeader
          title={t("users")}
          sx={{ p: 4, pb: 3 }}
          slotProps={{ title: { variant: "h5" } }}
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
            />
          )}
        </CardContent>
      </Card>
      <AddUserDialog open={userDialogOpen} setOpen={setUserDialogOpen} workgroupId={id} />
    </Stack>
  );
};
