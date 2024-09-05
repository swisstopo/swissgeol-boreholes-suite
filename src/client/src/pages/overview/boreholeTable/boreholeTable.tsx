import React, { FC, useEffect, useMemo, useRef } from "react";
import {
  DataGrid,
  GridColDef,
  GridEventListener,
  GridPaginationModel,
  GridRowParams,
  GridRowSelectionModel,
  GridSortModel,
  useGridApiRef,
} from "@mui/x-data-grid";
import { Box } from "@mui/system";
import { theme } from "../../../AppTheme.ts";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDomains } from "../../../api/fetchApiV2";
import { TablePaginationActions } from "./TablePaginationActions.tsx";
import { Boreholes, ReduxRootState, User } from "../../../api-lib/ReduxStateInterfaces.ts";
import { useSelector } from "react-redux";
import { muiLocales } from "../../../mui.locales.ts";
import { LockKeyhole } from "lucide-react";

export interface BoreholeTableProps {
  boreholes: Boreholes;
  paginationModel: GridPaginationModel;
  setPaginationModel: (model: GridPaginationModel) => void;
  selectionModel: GridRowSelectionModel;
  setSelectionModel: (model: GridRowSelectionModel) => void;
  sortModel: GridSortModel;
  setSortModel: (model: GridSortModel) => void;
  setHover: React.Dispatch<React.SetStateAction<number | null>>;
  rowToHighlight: number | null;
  isBusy: boolean;
}

export const BoreholeTable: FC<BoreholeTableProps> = ({
  boreholes,
  paginationModel,
  setPaginationModel,
  selectionModel,
  setSelectionModel,
  sortModel,
  setSortModel,
  setHover,
  rowToHighlight,
  isBusy,
}: BoreholeTableProps) => {
  const { t, i18n } = useTranslation();
  const history = useHistory();
  const domains = useDomains();
  const apiRef = useGridApiRef();
  const rowCountRef = useRef(boreholes?.length || 0);
  const user: User = useSelector((state: ReduxRootState) => state.core_user);
  const userIsEditor = user.data.roles.includes("EDIT");

  const rowCount = useMemo(() => {
    if (boreholes?.length > 0) {
      rowCountRef.current = boreholes.length;
    }
    return rowCountRef.current;
  }, [boreholes?.length]);

  const columns: GridColDef[] = [
    { field: "alternate_name", headerName: t("name"), flex: 1 },
    {
      field: "workgroup",
      valueGetter: (value: { name: string }) => {
        return value.name;
      },
      headerName: t("workgroup"),
      flex: 1,
    },
    {
      field: "borehole_type",
      valueGetter: (value: number) => {
        const domain = domains?.data?.find((d: { id: number }) => d.id === value);
        if (domain) {
          return domain[i18n.language];
        }
        return "";
      },
      headerName: t("borehole_type"),
      flex: 1,
    },
    {
      field: "total_depth",
      valueGetter: value => {
        return Math.round(value * 100) / 100;
      },
      headerName: t("totaldepth"),
      flex: 1,
    },
    {
      field: "extended",
      valueGetter: (value: { purpose: number }) => {
        const domain = domains?.data?.find((d: { id: number }) => d.id === value.purpose);
        if (domain) {
          return domain[i18n.language];
        }
        return "";
      },
      headerName: t("purpose"),
      flex: 1,
    },
    {
      field: "reference_elevation",
      valueGetter: value => {
        return Math.round(value * 100) / 100;
      },
      headerName: t("reference_elevation"),
      flex: 1,
    },
    {
      field: "location_x",
      valueGetter: (value, row) => {
        return `${Math.round(row.location_x * 100) / 100 || "-"}`;
      },
      headerName: t("location_x"),
      flex: 1,
    },
    {
      field: "location_y",
      valueGetter: (value, row) => {
        return `${Math.round(row.location_y * 100) / 100 || "-"}`;
      },
      headerName: t("location_y"),
      flex: 1,
    },
    {
      field: "lock",
      headerName: "",
      width: 20,
      renderCell: value => {
        if (value.row.lock) {
          return (
            <Box sx={{ color: theme.palette.error.main }}>
              <LockKeyhole />
            </Box>
          );
        }
      },
    },
  ];

  const handleRowClick: GridEventListener<"rowClick"> = params => {
    history.push(`/${params.row.id}`);
  };

  const getRowClassName = (params: GridRowParams) => {
    let css = "";
    if (params.row.lock) {
      css = "locked-row ";
    }
    if (rowToHighlight === params.id) {
      css = "highlighted-row ";
    }
    return css;
  };

  useEffect(() => {
    if (apiRef.current) {
      const handleRowMouseEnter: GridEventListener<"rowMouseEnter"> = params => {
        setHover(params.row.id);
      };

      const handleRowMouseLeave: GridEventListener<"rowMouseLeave"> = () => {
        setHover(null);
      };

      const api = apiRef.current;
      const unsubscribeMouseEnter = api.subscribeEvent("rowMouseEnter", handleRowMouseEnter);
      const unsubscribeMouseLeave = api.subscribeEvent("rowMouseLeave", handleRowMouseLeave);

      // Clean up subscriptions
      return () => {
        unsubscribeMouseEnter();
        unsubscribeMouseLeave();
      };
    }
  }, [apiRef, setHover]);

  return (
    <DataGrid
      sx={{
        ".MuiDataGrid-columnHeader": {
          backgroundColor: theme.palette.boxShadow,
        },
        ".MuiDataGrid-root .MuiDataGrid-columnHeader:focus, &.MuiDataGrid-root .MuiDataGrid-cell:focus": {
          outline: "none",
        },
        ".MuiTablePagination-toolbar p": {
          margin: 0,
        },
        ".MuiDataGrid-footerContainer": {
          height: "42px !important",
        },
        ".MuiTablePagination-selectLabel": {
          fontSize: "12px",
        },
        ".MuiTablePagination-selectIcon": {
          width: "14px",
          height: "14px",
        },
        ".MuiTablePagination-displayedRows": {
          fontSize: "12px",
        },
        ".MuiIconButton-root": {
          color: "#0000008A",
          backgroundColor: "rgba(0, 0, 0, 0)",
        },
        ".MuiIconButton-root.Mui-disabled": {
          color: "#828e9a",
        },
        "& .highlighted-row": {
          backgroundColor: theme.palette.background.lightgrey,
          color: theme.palette.primary.main,
        },
        "& .locked-row": {
          backgroundColor: theme.palette.background.default,
          color: theme.palette.action.disabled,
        },
      }}
      data-cy="borehole-table"
      apiRef={apiRef}
      onRowClick={handleRowClick}
      getRowClassName={getRowClassName}
      columnHeaderHeight={42}
      rowHeight={42}
      sortingOrder={["asc", "desc"]}
      loading={boreholes.isFetching || isBusy}
      rowCount={rowCount}
      rows={boreholes.data}
      columns={columns}
      paginationMode="server"
      hideFooterPagination={!boreholes.length}
      paginationModel={paginationModel}
      onPaginationModelChange={setPaginationModel}
      pageSizeOptions={[25, 50, 100]}
      slotProps={{
        pagination: {
          ActionsComponent: TablePaginationActions,
        },
      }}
      localeText={muiLocales[i18n.language]}
      disableColumnSelector
      disableColumnFilter
      checkboxSelection={userIsEditor}
      isRowSelectable={(params: GridRowParams) => params.row.lock === null}
      disableRowSelectionOnClick
      rowSelectionModel={selectionModel}
      onRowSelectionModelChange={setSelectionModel}
      hideFooterSelectedRowCount
      sortingMode="server"
      sortModel={sortModel}
      onSortModelChange={setSortModel}
    />
  );
};
