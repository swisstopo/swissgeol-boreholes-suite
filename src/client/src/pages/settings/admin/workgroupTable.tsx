import { FC, MouseEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Chip, Stack } from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridEventListener,
  GridFilterModel,
  GridRenderCellParams,
  GridRowParams,
  GridToolbar,
} from "@mui/x-data-grid";
import { Role, User, Workgroup } from "../../../api/apiInterfaces.ts";
import { fetchWorkgroups } from "../../../api/workgroup.ts";
import { useApiRequest } from "../../../hooks/useApiRequest.ts";
import { muiLocales } from "../../../mui.locales.ts";
import { TablePaginationActions } from "../../overview/boreholeTable/TablePaginationActions.tsx";
import { quickFilterStyles } from "./quickfilterStyles.ts";
import { useSharedTableColumns } from "./useSharedTableColumns.tsx";

interface WorkgroupTableProps {
  users: User[];
}

export const WorkgroupTable: FC<WorkgroupTableProps> = ({ users }) => {
  const { t, i18n } = useTranslation();
  const [filterModel, setFilterModel] = useState<GridFilterModel>();
  const [isLoading, setIsLoading] = useState(true);
  const [workgroups, setWorkgroups] = useState<Workgroup[]>();
  const { callApiWithErrorHandling } = useApiRequest();
  const { statusColumn, getDeleteColumn } = useSharedTableColumns();
  const handleFilterModelChange = useCallback((newModel: GridFilterModel) => setFilterModel(newModel), []);

  useEffect(() => {
    setIsLoading(true);
    const getWorkgroups = async () => {
      const workgroups: Workgroup[] = await callApiWithErrorHandling(fetchWorkgroups, []);
      setWorkgroups(workgroups);
      setIsLoading(false);
    };
    getWorkgroups();
  }, [callApiWithErrorHandling, t]);

  const userWorkgroupRoles = useMemo(() => {
    return users.map(user => user.workgroupRoles).flat();
  }, [users]);

  const renderUserChips = (params: GridRenderCellParams<Workgroup>) => {
    if (!userWorkgroupRoles || userWorkgroupRoles.length === 0) return null;
    return (
      <Stack direction="row" gap={1} p={1.2}>
        {Object.values(Role).map(role => {
          const usersPerRole = userWorkgroupRoles.filter(
            u => u!.workgroupId === params.row.id && u!.role === role,
          ).length;
          if (usersPerRole === 0) return null;
          return <Chip key={role} label={`${role} (${usersPerRole})`} size="small" color="primary" />;
        })}
      </Stack>
    );
  };

  const handleRowClick: GridEventListener<"rowClick"> = params => {
    console.log(`navigate to /setting/workgroup/${params.row.id}`);
  };

  const handleDeleteWorkgroup = (event: MouseEvent<HTMLButtonElement>, id: number) => {
    event.stopPropagation();
    const workgroup = workgroups?.find(workgroup => workgroup.id === id);
    if (!workgroup) return;
  };

  const columns: GridColDef[] = [
    { field: "name", headerName: t("workgroup"), flex: 1 },
    { field: "boreholeCount", headerName: t("boreholeCount"), width: 150 },
    {
      field: "usersPerRole",
      headerName: t("usersPerRole"),
      flex: 1,
      minWidth: 400,
      renderCell: renderUserChips,
    },
    statusColumn,
    getDeleteColumn(handleDeleteWorkgroup),
  ];

  const getRowClassName = (params: GridRowParams) => {
    let css = "";
    if (params.row.isDisabled) {
      css = "disabled-row ";
    }
    return css;
  };

  return (
    <DataGrid
      sx={{ border: "none !important", ...quickFilterStyles }}
      data-cy="users-table"
      columnHeaderHeight={44}
      getRowClassName={getRowClassName}
      rowHeight={44}
      sortingOrder={["asc", "desc"]}
      loading={isLoading}
      onRowClick={handleRowClick}
      rowCount={workgroups?.length}
      rows={workgroups}
      columns={columns}
      hideFooterPagination={!workgroups?.length}
      pageSizeOptions={[100]}
      slots={{ toolbar: GridToolbar }}
      slotProps={{
        pagination: {
          ActionsComponent: TablePaginationActions,
        },
        toolbar: {
          csvOptions: { disableToolbarButton: true },
          printOptions: { disableToolbarButton: true },
          showQuickFilter: true,
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
  );
};
