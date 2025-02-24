import { FC, MouseEvent, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, Chip, Stack } from "@mui/material";
import { GridColDef, GridFilterModel, GridRenderCellParams } from "@mui/x-data-grid";
import { User, Workgroup, WorkgroupRole } from "../../../api/apiInterfaces.ts";
import { fetchWorkgroupById } from "../../../api/workgroup.ts";
import { theme } from "../../../AppTheme.ts";
import { FormInputDisplayOnly } from "../../../components/form/form.ts";
import { useApiRequest } from "../../../hooks/useApiRequest.ts";
import { Table } from "./Table.tsx";
import { UserAdministrationContext } from "./userAdministrationContext.tsx";
import { useSharedTableColumns } from "./useSharedTableColumns.tsx";
import { WorkgroupAdministrationContext } from "./workgroupAdministrationContext.tsx";

export const WorkgroupDetail: FC = () => {
  const { id } = useParams<{ id: string }>();
  const { callApiWithErrorHandling } = useApiRequest();
  const history = useHistory();

  const { t } = useTranslation();
  const { firstNameColumn, lastNameColumn, emailColumn, statusColumn, getDeleteColumn } = useSharedTableColumns();
  const { users } = useContext(UserAdministrationContext);
  const { selectedWorkgroup, setSelectedWorkgroup } = useContext(WorkgroupAdministrationContext);
  const [filterModel, setFilterModel] = useState<GridFilterModel>();
  const handleFilterModelChange = useCallback((newModel: GridFilterModel) => setFilterModel(newModel), []);

  useEffect(() => {
    const getWorkgroup = async () => {
      const workgroup: Workgroup = await callApiWithErrorHandling(fetchWorkgroupById, [parseInt(id)]);
      if (!workgroup) {
        history.push("/setting#workgroups");
      } else {
        setSelectedWorkgroup(workgroup);
      }
    };
    getWorkgroup();
  }, [callApiWithErrorHandling, history, id, setSelectedWorkgroup]);

  const workgroupUsers = useMemo(() => {
    if (!users) return [];
    return users.filter((user: User) =>
      user.workgroupRoles?.some((wgr: WorkgroupRole) => wgr.workgroupId === parseInt(id)),
    );
  }, [users, id]);

  const handleRemoveUserFromWorkgroup = (event: MouseEvent<HTMLButtonElement>, id: number) => {
    event.stopPropagation();
    const user = users.find(user => user.id === id);
    if (!user) return;
    // Implement remove user from workgroup
  };

  const renderRoleChips = (params: GridRenderCellParams<object[]>) => {
    const workgroupRoles = params.value.filter((role: WorkgroupRole) => role.workgroupId === parseInt(id));
    return (
      <Stack direction="row" gap={1} p={1.2}>
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
    getDeleteColumn(handleRemoveUserFromWorkgroup),
  ];

  const isDisabled = selectedWorkgroup?.isDisabled;

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
        <CardHeader title={t("users")} sx={{ p: 4, pb: 3 }} titleTypographyProps={{ variant: "h5" }} />
        <CardContent sx={{ pt: 4, px: 3 }}>
          {users && users?.length > 0 && (
            <Table
              rows={workgroupUsers}
              columns={columns}
              filterModel={filterModel}
              onFilterModelChange={handleFilterModelChange}
              isDisabled={isDisabled}
              dataCy={"workgroup-users-table"}
            />
          )}
        </CardContent>
      </Card>
    </Stack>
  );
};
