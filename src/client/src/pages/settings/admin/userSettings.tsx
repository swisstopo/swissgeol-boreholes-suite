import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Checkbox, Chip, Stack, Tooltip } from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridColumnVisibilityModel,
  GridFilterModel,
  GridRenderCellParams,
  GridToolbar,
} from "@mui/x-data-grid";
import { Trash2 } from "lucide-react";
import { User, WorkgroupRole } from "../../../api/apiInterfaces.ts";
import { fetchUsers } from "../../../api/user.ts";
import { theme } from "../../../AppTheme.ts";
import { muiLocales } from "../../../mui.locales.ts";
import { TablePaginationActions } from "../../overview/boreholeTable/TablePaginationActions.tsx";

export const UserSettings = () => {
  const { t, i18n } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [filterModel, setFilterModel] = useState<GridFilterModel>({
    items: [],
    quickFilterExcludeHiddenColumns: true,
    quickFilterValues: [""],
  });
  const [columnVisibilityModel, setColumnVisibilityModel] = useState<GridColumnVisibilityModel>({
    company: false,
  });
  const handleFilterModelChange = useCallback((newModel: GridFilterModel) => setFilterModel(newModel), []);
  const handleColumnVisibilityChange = useCallback(
    (newModel: GridColumnVisibilityModel) => setColumnVisibilityModel(newModel),
    [],
  );

  useEffect(() => {
    const getUsers = async () => {
      return await fetchUsers();
    };
    getUsers().then(users => setUsers(users));
  }, []);

  const renderCellCheckbox = (params: GridRenderCellParams) => {
    const handleCheckBoxClick = (event: ChangeEvent<HTMLInputElement>, id: number) => {
      event.stopPropagation();
      console.log("update user with id", id);
      //Todo: update user admin status
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
        params.value.map((role: WorkgroupRole) => role.workgroup?.name).filter((name: string) => name !== undefined),
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

  const columns: GridColDef[] = [
    { field: "firstName", headerName: t("firstname"), flex: 1 },
    { field: "lastName", headerName: t("lastname"), flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    {
      field: "isDisabled",
      headerName: t("status"),
      valueGetter: isDisabled => {
        return isDisabled ? t("disabled") : t("active");
      },
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

  const quickFilterStyles = {
    "& .MuiDataGrid-toolbarContainer .MuiDataGrid-toolbarQuickFilter .MuiInput-root": {
      outline: `1px solid ${theme.palette.secondary.main} !important`,
      borderRadius: "4px",
      padding: "8px 4px  4px 4px",
      color: theme.palette.secondary.main,
      "&:focus-within": {
        outline: `2px solid ${theme.palette.primary.main} !important`,
      },
    },
    "& .MuiDataGrid-toolbarContainer .MuiInput-underline:after, & .MuiDataGrid-toolbarContainer .MuiInput-underline:before":
      {
        borderBottom: "none",
      },
    "& .MuiDataGrid-toolbarContainer .MuiInput-underline:hover:not(.Mui-disabled):before": {
      borderBottom: "none",
    },
    "& .MuiDataGrid-toolbarContainer .MuiInput-underline.Mui-focused:after": {
      borderBottom: "none",
    },
  };

  const isLoading = !users.length;

  return (
    <DataGrid
      sx={{ border: "none !important", ...quickFilterStyles }}
      data-cy="users-table"
      columnHeaderHeight={44}
      rowHeight={44}
      sortingOrder={["asc", "desc"]}
      loading={isLoading}
      rowCount={users.length}
      rows={users}
      columns={columns}
      hideFooterPagination={!users.length}
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
      columnVisibilityModel={columnVisibilityModel}
      onColumnVisibilityModelChange={handleColumnVisibilityChange}
    />
  );
};
