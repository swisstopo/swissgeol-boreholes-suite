import { FC, MouseEvent, useCallback, useContext, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Chip, Stack } from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridEventListener,
  GridFilterModel,
  GridRenderCellParams,
  GridRowParams,
  GridSortModel,
  GridToolbar,
} from "@mui/x-data-grid";
import { Trash2, X } from "lucide-react";
import i18n from "i18next";
import { Role, User, Workgroup } from "../../../api/apiInterfaces.ts";
import { removeAllWorkgroupRolesForUser } from "../../../api/workgroup.ts";
import { PromptContext } from "../../../components/prompt/promptContext.tsx";
import { useApiRequest } from "../../../hooks/useApiRequest.ts";
import { useDeleteWorkgroupPrompts } from "../../../hooks/useDeleteEntityPrompts.tsx";
import { muiLocales } from "../../../mui.locales.ts";
import { TablePaginationActions } from "../../overview/boreholeTable/TablePaginationActions.tsx";
import { quickFilterStyles } from "./quickfilterStyles.ts";
import { useSharedTableColumns } from "./useSharedTableColumns.tsx";
import { WorkgroupAdministrationContext } from "./workgroupAdministrationContext.tsx";

interface WorkgroupTableProps {
  isDisabled: boolean;
  workgroups: Workgroup[];
  setWorkgroups: (workgroups: Workgroup[]) => void;
  sortModel: GridSortModel;
  setSortModel: (model: GridSortModel) => void;
  user?: User;
  users?: User[];
  handleRowClick?: GridEventListener<"rowClick">;
}
export const WorkgroupTable: FC<WorkgroupTableProps> = ({
  isDisabled,
  workgroups,
  setWorkgroups,
  sortModel,
  setSortModel,
  user = null,
  users = null,
  handleRowClick,
}) => {
  const { t } = useTranslation();
  const { statusColumn, getDeleteColumn } = useSharedTableColumns();
  const { showPrompt } = useContext(PromptContext);
  const { setSelectedWorkgroup } = useContext(WorkgroupAdministrationContext);
  const { callApiWithRollback } = useApiRequest();
  const [filterModel, setFilterModel] = useState<GridFilterModel>();
  const handleFilterModelChange = useCallback((newModel: GridFilterModel) => setFilterModel(newModel), []);
  const { showDeleteWorkgroupWarning } = useDeleteWorkgroupPrompts(setSelectedWorkgroup, workgroups, setWorkgroups);

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

  const getRowClassName = (params: GridRowParams): string => (params.row.isDisabled ? "disabled-row" : "");

  const userWorkgroupRoles = useMemo(() => users?.map(user => user.workgroupRoles).flat() ?? [], [users]);

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

  const removeAllWorkgroupRolesWithRollback = async (workgroup: Workgroup) => {
    // Define rollback function to revert the state if the API call fails
    const rollback = () => {
      setWorkgroups([...workgroups!]);
    };

    // Optimistically update the workgroup table
    setWorkgroups([...workgroups!.filter(wgp => wgp.id != workgroup.id)]);

    if (!user) return;
    await callApiWithRollback(removeAllWorkgroupRolesForUser, [user.id, workgroup.id, workgroup.roles], rollback);
  };

  const handleRemoveAllWorkgroupRoles = (event: MouseEvent<HTMLButtonElement>, id: number) => {
    event.stopPropagation();
    if (!workgroups || !user) return;
    const userWorkgroup = workgroups.find(workgroup => workgroup.id === id);
    if (!userWorkgroup) return;
    showPrompt(t("confirmRemoveRoles", { name: user.name, workgroupName: userWorkgroup.name }), [
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

  const handleDeleteWorkgroup = (event: MouseEvent<HTMLButtonElement>, id: number) => {
    event.stopPropagation();
    const workgroupToDelete = workgroups.find(wgp => wgp.id === id);
    showDeleteWorkgroupWarning(workgroupToDelete);
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
      renderCell: users ? renderUserChips : renderRoleChips,
      flex: 1,
    },
    statusColumn,
    getDeleteColumn(user ? handleRemoveAllWorkgroupRoles : handleDeleteWorkgroup),
  ];

  const disabledStyles = {
    cursor: isDisabled ? "default" : "pointer",
    "& .MuiDataGrid-row:hover": { backgroundColor: isDisabled && "rgba(0,0,0,0)" },
    "& .MuiDataGrid-columnHeader": { cursor: isDisabled ? "default" : "pointer" },
  };

  return (
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
      loading={!workgroups?.length}
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
      disableColumnSorting={isDisabled}
      disableColumnResize={isDisabled}
      disableColumnMenu={true}
      disableDensitySelector
      filterModel={filterModel}
      onRowClick={handleRowClick}
      getRowClassName={getRowClassName}
      onFilterModelChange={handleFilterModelChange}
      sortModel={sortModel}
      onSortModelChange={setSortModel}
    />
  );
};
