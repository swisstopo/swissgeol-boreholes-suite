import { FC, MouseEvent, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { Chip, Stack } from "@mui/material";
import { GridColDef, GridEventListener, GridFilterModel, GridRenderCellParams } from "@mui/x-data-grid";
import { Role, Workgroup } from "../../../api/apiInterfaces.ts";
import { fetchWorkgroups } from "../../../api/workgroup.ts";
import { Table } from "../../../components/table/table.tsx";
import { useApiRequest } from "../../../hooks/useApiRequest.ts";
import { useDeleteWorkgroupPrompts } from "../../../hooks/useDeleteEntityPrompts.tsx";
import { UserAdministrationContext } from "./userAdministrationContext.tsx";
import { useSharedTableColumns } from "./useSharedTableColumns.tsx";
import { WorkgroupAdministrationContext } from "./workgroupAdministrationContext.tsx";

export const WorkgroupAdministration: FC = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const { users } = useContext(UserAdministrationContext);
  const { workgroups, setWorkgroups, setSelectedWorkgroup, workgroupTableSortModel, setworkgroupTableSortModel } =
    useContext(WorkgroupAdministrationContext);
  const [filterModel, setFilterModel] = useState<GridFilterModel>();
  const handleFilterModelChange = useCallback((newModel: GridFilterModel) => setFilterModel(newModel), []);
  const { showDeleteWorkgroupWarning } = useDeleteWorkgroupPrompts(setSelectedWorkgroup, workgroups, setWorkgroups);
  const { workgroupNameColumn, boreholeCountColumn, statusColumn, getDeleteColumn } = useSharedTableColumns();

  const { callApiWithErrorHandling } = useApiRequest();

  useEffect(() => {
    setSelectedWorkgroup(null);
    const getWorkgroups = async () => {
      const workgroups: Workgroup[] = await callApiWithErrorHandling(fetchWorkgroups, []);
      setWorkgroups(workgroups);
    };
    getWorkgroups();
  }, [callApiWithErrorHandling, setSelectedWorkgroup, setWorkgroups, t]);

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
    const workgroupToDelete = workgroups.find(wgp => wgp.id === id);
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
  return (
    <Table
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
