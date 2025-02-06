import { ChangeEvent, useCallback, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, Checkbox, Chip, Stack, Typography } from "@mui/material";
import { DataGrid, GridColDef, GridFilterModel, GridRenderCellParams, GridToolbar } from "@mui/x-data-grid";
import { Trash2 } from "lucide-react";
import i18n from "i18next";
import { User, WorkgroupRole } from "../../../api/apiInterfaces.ts";
import { fetchUser, updateUser } from "../../../api/user.ts";
import { theme } from "../../../AppTheme.ts";
import { useApiCallHandler } from "../../../hooks/useApiCallHandler.ts";
import { muiLocales } from "../../../mui.locales.ts";
import { TablePaginationActions } from "../../overview/boreholeTable/TablePaginationActions.tsx";
import { quickFilterStyles } from "./quickfilterStyles.ts";
import { SettingsHeaderContext } from "./settingsHeaderContext.tsx";

export const UserDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [user, setUser] = useState<User>();
  const [userWorkgroups, setUserWorkgroups] = useState<object[]>();
  const { handleApiCall, handleApiCallWithRollback } = useApiCallHandler();
  const { setHeaderTitle, setChipContent } = useContext(SettingsHeaderContext);
  const [filterModel, setFilterModel] = useState<GridFilterModel>();
  const handleFilterModelChange = useCallback((newModel: GridFilterModel) => setFilterModel(newModel), []);

  useEffect(() => {
    const getUser = async () => {
      const user: User = await handleApiCall(fetchUser, [parseInt(id)]);
      setUser(user);
      setHeaderTitle(user.name);
      setChipContent("user");

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

      // Get the transformed array of unique workgroups with roles
      setUserWorkgroups(getUniqueWorkgroups(user));
    };
    getUser();
  }, [handleApiCall, id, setChipContent, setHeaderTitle]);

  if (!user) return;

  const renderRoleChips = (params: GridRenderCellParams<object[]>) => {
    return (
      <Stack direction="row" gap={1} p={1.2}>
        {params.value.map((roleName: string) => (
          <Chip key={roleName} label={roleName.toUpperCase()} size="small" color="primary" />
        ))}
      </Stack>
    );
  };

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: t("workgroup"),
      flex: 1,
    },
    {
      field: "roles",
      headerName: t("roles"),
      renderCell: renderRoleChips,
      flex: 1,
    },
    {
      field: "isDisabled",
      headerName: t("status"),
      valueGetter: isDisabled => {
        return isDisabled ? t("disabled") : t("enabled");
      },
      width: 120,
    },
    {
      field: "delete",
      headerName: "",
      width: 24,
      resizable: false,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      disableReorder: true,
      disableExport: true,
      renderCell: value => {
        return (
          <Stack
            direction={"row"}
            gap={1}
            p={0.5}
            key={value.id}
            sx={{ mt: 1, border: `1px solid ${theme.palette.primary.main}`, borderRadius: 1 }}>
            <Trash2 color={theme.palette.primary.main} />
          </Stack>
        );
      },
    },
  ];

  const handleCheckboxChange = async (event: ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();
    if (user) {
      // Define rollback function to revert the state if the API call fails
      const rollback = () => setUser({ ...user });
      // Optimistically update the user in the state
      const updatedUser = { ...user, isAdmin: event.target.checked };
      setUser({ ...updatedUser });
      await handleApiCallWithRollback(updateUser, [updatedUser], rollback);
    }
  };

  const isLoading = !userWorkgroups?.length;

  return (
    <Stack
      sx={{
        height: "100%",
        p: 5,
        overflowY: "auto",
        backgroundColor: theme.palette.background.lightgrey,
      }}>
      <Card data-cy="user-general" sx={{ mb: 3 }}>
        <CardHeader title={t("general")} sx={{ p: 4, pb: 3 }} titleTypographyProps={{ variant: "h5" }} />
        <CardContent sx={{ pt: 4, px: 3 }}>
          <Stack direction={"row"} alignItems={"center"}>
            <Checkbox checked={user.isAdmin} onChange={handleCheckboxChange} data-cy="is-user-admin-checkbox" />
            <Typography>Admin</Typography>
          </Stack>
        </CardContent>
      </Card>
      <Card data-cy="user-workgroups">
        <CardHeader title={t("workgroups")} sx={{ p: 4, pb: 3 }} titleTypographyProps={{ variant: "h5" }} />
        <CardContent sx={{ pt: 4, px: 3 }}>
          {userWorkgroups && (
            <DataGrid
              sx={{ border: "none !important", ...quickFilterStyles }}
              data-cy="user-workgroups-table"
              columnHeaderHeight={44}
              rowHeight={44}
              sortingOrder={["asc", "desc"]}
              loading={isLoading}
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
              disableColumnMenu={true}
              disableDensitySelector
              filterModel={filterModel}
              onFilterModelChange={handleFilterModelChange}
            />
          )}
        </CardContent>
      </Card>
    </Stack>
  );
};
