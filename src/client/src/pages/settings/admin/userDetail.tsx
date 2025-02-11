import { ChangeEvent, FC, useCallback, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, Checkbox, Chip, Stack, Typography } from "@mui/material";
import { DataGrid, GridColDef, GridFilterModel, GridRenderCellParams, GridToolbar } from "@mui/x-data-grid";
import i18n from "i18next";
import { User, WorkgroupRole } from "../../../api/apiInterfaces.ts";
import { fetchUser, updateUser } from "../../../api/user.ts";
import { theme } from "../../../AppTheme.ts";
import { useApiRequest } from "../../../hooks/useApiRequest.ts";
import { muiLocales } from "../../../mui.locales.ts";
import { TablePaginationActions } from "../../overview/boreholeTable/TablePaginationActions.tsx";
import { quickFilterStyles } from "./quickfilterStyles.ts";
import { SettingsHeaderContext } from "./settingsHeaderContext.tsx";
import { useSharedTableColumns } from "./useSharedTableColumns.tsx";

interface UserDetailProps {
  user: User | null;
  setUser: (user: User | null) => void;
}

export const UserDetail: FC<UserDetailProps> = ({ user, setUser }) => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [userWorkgroups, setUserWorkgroups] = useState<object[]>();
  const { callApiWithErrorHandling, callApiWithRollback } = useApiRequest();
  const { setHeaderTitle } = useContext(SettingsHeaderContext);
  const { statusColumn, deleteColumn } = useSharedTableColumns();
  const [filterModel, setFilterModel] = useState<GridFilterModel>();
  const handleFilterModelChange = useCallback((newModel: GridFilterModel) => setFilterModel(newModel), []);

  const getUniqueWorkgroups = useCallback((user: User) => {
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
  }, []);

  useEffect(() => {
    const getUser = async () => {
      const user: User = await callApiWithErrorHandling(fetchUser, [parseInt(id)]);
      setUser(user);
      setHeaderTitle(user.name);

      // Get the transformed array of unique workgroups with roles
      setUserWorkgroups(getUniqueWorkgroups(user));
    };
    getUser();
  }, [callApiWithErrorHandling, getUniqueWorkgroups, id, setHeaderTitle, setUser]);

  if (!user) return;
  const isDisabled = user.isDisabled;

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
    statusColumn,
    deleteColumn,
  ];

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
        <CardHeader title={t("workgroups")} sx={{ p: 4, pb: 3 }} titleTypographyProps={{ variant: "h5" }} />
        <CardContent sx={{ pt: 4, px: 3 }}>
          {userWorkgroups && (
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
    </Stack>
  );
};
