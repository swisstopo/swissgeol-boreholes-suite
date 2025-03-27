import { FC, MouseEvent, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { Chip, Stack } from "@mui/material";
import { GridColDef, GridEventListener, GridFilterModel, GridRenderCellParams } from "@mui/x-data-grid";
import { Role, Workgroup } from "../../../api/apiInterfaces.ts";
import { useUsers } from "../../../api/user.ts";
import { useWorkgroups } from "../../../api/workgroup.ts";
import { Table } from "../../../components/table/table.tsx";
import { useDeleteWorkgroupPrompts } from "../../../hooks/useDeleteEntityPrompts.tsx";
import { useShowAlertOnError } from "../../../hooks/useShowAlertOnError.ts";
import { useSharedTableColumns } from "./useSharedTableColumns.tsx";
import { WorkgroupAdministrationContext } from "./workgroupAdministrationContext.tsx";

export const WorkgroupAdministration: FC = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const { data: workgroups, isError: isWorkgroupsError, error: workgroupsError } = useWorkgroups();
  const { data: users, isError: isUsersError, error: usersError } = useUsers();
  const { setSelectedWorkgroup, workgroupTableSortModel, setworkgroupTableSortModel } =
    useContext(WorkgroupAdministrationContext);
  const [filterModel, setFilterModel] = useState<GridFilterModel>();
  const handleFilterModelChange = useCallback((newModel: GridFilterModel) => setFilterModel(newModel), []);

  const { showDeleteWorkgroupWarning } = useDeleteWorkgroupPrompts(setSelectedWorkgroup);
  const { workgroupNameColumn, boreholeCountColumn, statusColumn, getDeleteColumn } = useSharedTableColumns();

  useShowAlertOnError(isWorkgroupsError, workgroupsError);
  useShowAlertOnError(isUsersError, usersError);

  useEffect(() => {
    setSelectedWorkgroup(null);
  }, [setSelectedWorkgroup]);

  const userWorkgroupRoles = useMemo(() => users?.map(user => user.workgroupRoles).flat() ?? [], [users]);

  const renderUserChips = (params: GridRenderCellParams<Workgroup>) => {
    if (!userWorkgroupRoles || userWorkgroupRoles.length === 0) return null;
    return (
      <Stack direction="row" gap={1} p={1.2} sx={{ flexWrap: "wrap" }}>
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

  const handleDeleteWorkgroup = (event: MouseEvent<HTMLButtonElement>, id: number) => {
    event.stopPropagation();
    const workgroupToDelete = workgroups?.find(wgp => wgp.id === id);
    showDeleteWorkgroupWarning(workgroupToDelete);
  };

  const columns: GridColDef[] = [
    workgroupNameColumn,
    boreholeCountColumn,
    {
      field: "roles",
      headerName: t("roles"),
      renderCell: renderUserChips,
      flex: 1,
    },
    statusColumn,
    getDeleteColumn(handleDeleteWorkgroup),
  ];

  const handleRowClick: GridEventListener<"rowClick"> = params => {
    history.push(`/setting/workgroup/${params.row.id}`);
  };

  if (!workgroups) return;

  return (
    <Table<Workgroup>
      rows={workgroups}
      columns={columns}
      onRowClick={handleRowClick}
      filterModel={filterModel}
      onFilterModelChange={handleFilterModelChange}
      sortModel={workgroupTableSortModel}
      onSortModelChange={setworkgroupTableSortModel}
      dataCy={"workgroups-table"}
      rowAutoHeight={true}
    />
  );
};
