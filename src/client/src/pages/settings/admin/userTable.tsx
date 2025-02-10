import { ChangeEvent, useCallback, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { Checkbox, Chip, Stack, Tooltip } from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridEventListener,
  GridFilterModel,
  GridRenderCellParams,
  GridToolbar,
} from "@mui/x-data-grid";
import { Trash2 } from "lucide-react";
import { User, WorkgroupRole } from "../../../api/apiInterfaces.ts";
import { fetchUsers, updateUser } from "../../../api/user.ts";
import { theme } from "../../../AppTheme.ts";
import { useApiRequest } from "../../../hooks/useApiRequest.ts";
import { muiLocales } from "../../../mui.locales.ts";
import { TablePaginationActions } from "../../overview/boreholeTable/TablePaginationActions.tsx";
import { quickFilterStyles } from "./quickfilterStyles.ts";
import { SettingsHeaderContext } from "./settingsHeaderContext.tsx";

export const UserTable = () => {
  const { t, i18n } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [filterModel, setFilterModel] = useState<GridFilterModel>();
  const history = useHistory();
  const { setHeaderTitle, setChipContent } = useContext(SettingsHeaderContext);
  const { callApiWithErrorHandling, callApiWithRollback } = useApiRequest();
  const handleFilterModelChange = useCallback((newModel: GridFilterModel) => setFilterModel(newModel), []);

  useEffect(() => {
    const getUsers = async () => {
      const users: User[] = await callApiWithErrorHandling(fetchUsers, []);
      setUsers(users);
    };
    getUsers();
    setHeaderTitle("settings");
    setChipContent("");
  }, [callApiWithErrorHandling, setChipContent, setHeaderTitle, t]);

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

  const columns: GridColDef[] = [
    { field: "firstName", headerName: t("firstname"), flex: 1 },
    { field: "lastName", headerName: t("lastname"), flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    {
      field: "isDisabled",
      headerName: t("status"),
      valueGetter: isDisabled => {
        return isDisabled ? t("disabled") : t("enabled");
      },
      width: 120,
    },
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

  const isLoading = !users?.length;

  return (
    <DataGrid
      sx={{ border: "none !important", ...quickFilterStyles }}
      data-cy="users-table"
      columnHeaderHeight={44}
      rowHeight={44}
      sortingOrder={["asc", "desc"]}
      loading={isLoading}
      onRowClick={handleRowClick}
      rowCount={users?.length}
      rows={users}
      columns={columns}
      hideFooterPagination={!users?.length}
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
