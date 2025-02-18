import { ChangeEvent, FC, MouseEvent, useCallback, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, Checkbox, Chip, Stack, Typography } from "@mui/material";
import { DataGrid, GridColDef, GridFilterModel, GridRenderCellParams, GridToolbar } from "@mui/x-data-grid";
import { Trash2, X } from "lucide-react";
import i18n from "i18next";
import { User, Workgroup, WorkgroupRole } from "../../../api/apiInterfaces.ts";
import { fetchUser, updateUser } from "../../../api/user.ts";
import { removeAllWorkgroupRolesForUser } from "../../../api/workgroup.ts";
import { theme } from "../../../AppTheme.ts";
import { AddButton } from "../../../components/buttons/buttons.tsx";
import { PromptContext } from "../../../components/prompt/promptContext.tsx";
import { useApiRequest } from "../../../hooks/useApiRequest.ts";
import { muiLocales } from "../../../mui.locales.ts";
import { TablePaginationActions } from "../../overview/boreholeTable/TablePaginationActions.tsx";
import { AddWorkgroupDialog } from "./AddWorkgroupDialog.tsx";
import { quickFilterStyles } from "./quickfilterStyles.ts";
import { UserAdministrationContext } from "./userAdministrationContext.tsx";
import { useSharedTableColumns } from "./useSharedTableColumns.tsx";

export const UserDetail: FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [userWorkgroups, setUserWorkgroups] = useState<Workgroup[]>();
  const [workgroupDialogOpen, setWorkgroupDialogOpen] = useState(false);
  const { selectedUser, setSelectedUser } = useContext(UserAdministrationContext);
  const { callApiWithErrorHandling, callApiWithRollback } = useApiRequest();
  const history = useHistory();
  const { statusColumn, getDeleteColumn } = useSharedTableColumns();
  const [filterModel, setFilterModel] = useState<GridFilterModel>();
  const { showPrompt } = useContext(PromptContext);
  const handleFilterModelChange = useCallback((newModel: GridFilterModel) => setFilterModel(newModel), []);

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

  if (!selectedUser) return;
  const isDisabled = selectedUser.isDisabled;

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

  const deleteWorkgroupWithRollback = async (workgroup: Workgroup) => {
    // Define rollback function to revert the state if the API call fails
    const rollback = () => {
      setUserWorkgroups([...userWorkgroups!]);
    };

    // Optimistically update the workgroup table
    setUserWorkgroups([...userWorkgroups!.filter(wgp => wgp.id != workgroup.id)]);

    await callApiWithRollback(
      removeAllWorkgroupRolesForUser,
      [selectedUser.id, workgroup.id, workgroup.roles],
      rollback,
    );
  };

  const handleDeleteWorkgroup = (event: MouseEvent<HTMLButtonElement>, id: number) => {
    event.stopPropagation();
    if (!userWorkgroups) return;
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
          deleteWorkgroupWithRollback(userWorkgroup);
        },
      },
    ]);
  };

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: t("workgroup"),
      flex: 1,
    },
    { field: "boreholeCount", headerName: t("boreholeCount"), width: 200 },
    {
      field: "roles",
      headerName: t("roles"),
      renderCell: renderRoleChips,
      flex: 1,
    },
    statusColumn,
    getDeleteColumn(handleDeleteWorkgroup),
  ];

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

  const disabledStyles = {
    cursor: isDisabled ? "default" : "pointer",
    "& .MuiDataGrid-row:hover": { backgroundColor: isDisabled && "rgba(0,0,0,0)" },
    "& .MuiDataGrid-columnHeader": { cursor: isDisabled ? "default" : "pointer" },
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
            <DataGrid
              sx={{
                border: "none !important",
                ...quickFilterStyles,
                ...disabledStyles,
              }}
              data-cy="user-workgroups-table"
              columnHeaderHeight={44}
              rowHeight={44}
              sortingOrder={["asc", "desc"]}
              loading={!userWorkgroups?.length}
              rowCount={userWorkgroups?.length}
              rows={userWorkgroups}
              columns={columns}
              hideFooterPagination={!userWorkgroups?.length}
              pageSizeOptions={[100]}
              slots={{ toolbar: GridToolbar }}
              slotProps={{
                pagination: {
                  ActionsComponent: TablePaginationActions,
                },
                toolbar: {
                  csvOptions: { disableToolbarButton: true },
                  printOptions: { disableToolbarButton: true },
                  showQuickFilter: userWorkgroups?.length > 3,
                },
              }}
              localeText={muiLocales[i18n.language]}
              disableColumnSelector
              disableRowSelectionOnClick
              hideFooterSelectedRowCount
              disableColumnFilter
              disableColumnSorting={isDisabled}
              disableColumnResize={isDisabled}
              disableColumnMenu={true}
              disableDensitySelector
              filterModel={filterModel}
              onFilterModelChange={handleFilterModelChange}
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
