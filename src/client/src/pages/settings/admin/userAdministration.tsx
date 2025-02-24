import { ChangeEvent, FC, MouseEvent, useCallback, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { Checkbox, Chip, Stack, Tooltip } from "@mui/material";
import { GridColDef, GridEventListener, GridFilterModel, GridRenderCellParams } from "@mui/x-data-grid";
import { User, WorkgroupRole } from "../../../api/apiInterfaces.ts";
import { fetchUsers, updateUser } from "../../../api/user.ts";
import { Table } from "../../../components/table/table.tsx";
import { useApiRequest } from "../../../hooks/useApiRequest.ts";
import { useDeleteUserPrompts } from "../../../hooks/useDeleteEntityPrompts.tsx";
import { UserAdministrationContext } from "./userAdministrationContext.tsx";
import { useSharedTableColumns } from "./useSharedTableColumns.tsx";

export const UserAdministration: FC = () => {
  const { t } = useTranslation();
  const [filterModel, setFilterModel] = useState<GridFilterModel>();
  const history = useHistory();
  const { callApiWithErrorHandling, callApiWithRollback } = useApiRequest();
  const { firstNameColumn, lastNameColumn, emailColumn, statusColumn, getDeleteColumn } = useSharedTableColumns();
  const { users, setUsers, setSelectedUser, userTableSortModel, setUserTableSortModel } =
    useContext(UserAdministrationContext);
  const { showDeleteUserWarning } = useDeleteUserPrompts(setSelectedUser, users, setUsers);
  const handleFilterModelChange = useCallback((newModel: GridFilterModel) => setFilterModel(newModel), []);

  useEffect(() => {
    setSelectedUser(null);
    const getUsers = async () => {
      const users: User[] = await callApiWithErrorHandling(fetchUsers, []);
      setUsers(users);
    };
    getUsers();
  }, [callApiWithErrorHandling, setSelectedUser, setUsers, t]);

  const renderCellCheckbox = (params: GridRenderCellParams) => {
    const handleCheckBoxClick = async (event: ChangeEvent<HTMLInputElement>, id: number) => {
      event.stopPropagation();
      const user = users.find(user => user.id === id);
      if (user) {
        // Define rollback function to revert the state if the API call fails
        const rollback = () => setUsers([...users]);

        // Optimistically update the user in the state
        const updatedUser = { ...user, isAdmin: event.target.checked };
        setUsers([...users.map(user => (user.id === id ? updatedUser : user))]);

        await callApiWithRollback(updateUser, [updatedUser], rollback);
      }
    };

    return (
      <Checkbox
        checked={params.value}
        disabled={params.row.isDisabled}
        onChange={event => handleCheckBoxClick(event, params.id as number)}
        onClick={event => event.stopPropagation()}
      />
    );
  };

  const renderWorkgroupChips = (params: GridRenderCellParams<WorkgroupRole[]>) => {
    const averageCharacterWidth = 7.5;
    const chipPadding = 16;
    const chipsGap = 8;

    const cellWidth = 320;
    const tableCellPadding = 20;
    const overFlowChipWidth = 44;

    const availableSpace = cellWidth - tableCellPadding - overFlowChipWidth;

    const uniqueWorkgroups: string[] = [
      ...new Set<string>(
        params.value?.map((role: WorkgroupRole) => role.workgroup?.name).filter((name: string) => name !== undefined),
      ),
    ];

    // Calculate how many chips can be displayed in the cell based on the number of characters in the workgroup names
    const calculateVisibleCount = () => {
      let totalWidth = 0;
      let count = 0;

      for (const name of uniqueWorkgroups) {
        const estimatedChipWidth = name.length * averageCharacterWidth + chipPadding;
        if (totalWidth + estimatedChipWidth > availableSpace) break;
        totalWidth += estimatedChipWidth + chipsGap;
        count++;
      }
      return count;
    };

    const visibleCount = calculateVisibleCount();
    const displayedWorkgroups = uniqueWorkgroups.slice(0, visibleCount);
    const extraWorkgroups = uniqueWorkgroups.slice(visibleCount);

    return (
      <Stack direction="row" gap={1} p={1.2} style={{ maxWidth: cellWidth }}>
        {displayedWorkgroups.map(name => (
          <Chip key={name} label={name.toUpperCase()} size="small" color="primary" />
        ))}
        {extraWorkgroups.length > 0 && (
          <Tooltip title={extraWorkgroups.join(", ")}>
            <Chip key="extra-workgroups" label={`+${extraWorkgroups.length}`} size="small" color="primary" />
          </Tooltip>
        )}
      </Stack>
    );
  };

  const handleRowClick: GridEventListener<"rowClick"> = params => {
    history.push(`/setting/user/${params.row.id}`);
  };

  const handleDeleteUser = (event: MouseEvent<HTMLButtonElement>, id: number) => {
    event.stopPropagation();
    const user = users.find(user => user.id === id);
    showDeleteUserWarning(user);
  };

  const columns: GridColDef[] = [
    firstNameColumn,
    lastNameColumn,
    emailColumn,
    statusColumn,
    {
      field: "isAdmin",
      headerName: "Admin",
      width: 100,
      resizable: false,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      disableReorder: true,
      disableExport: true,
      renderCell: renderCellCheckbox,
    },
    {
      field: "workgroupRoles",
      headerName: t("workgroups"),
      width: 320,
      renderCell: renderWorkgroupChips,
    },
    getDeleteColumn(handleDeleteUser),
  ];

  return (
    <Table
      rows={users}
      columns={columns}
      onRowClick={handleRowClick}
      filterModel={filterModel}
      onFilterModelChange={handleFilterModelChange}
      sortModel={userTableSortModel}
      onSortModelChange={setUserTableSortModel}
      dataCy={"users-table"}
    />
  );
};
