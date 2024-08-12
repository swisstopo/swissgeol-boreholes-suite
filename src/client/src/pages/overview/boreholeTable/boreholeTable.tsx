import { FC, useEffect, useMemo, useRef } from "react";
import {
  DataGrid,
  GridColDef,
  GridEventListener,
  GridPaginationModel,
  GridRowId,
  GridRowSelectionModel,
  GridSortModel,
  useGridApiRef,
} from "@mui/x-data-grid";
import { styled } from "@mui/system";
import { theme } from "../../../AppTheme.ts";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDomains } from "../../../api/fetchApiV2";
import { TablePaginationActions } from "../TablePaginationActions.tsx";
import { Boreholes } from "../../../api-lib/ReduxStateInterfaces.ts";

export interface BoreholeTableProps {
  boreholes: Boreholes;
  paginationModel: GridPaginationModel;
  setPaginationModel: (model: GridPaginationModel) => void;
  selectionModel: GridRowSelectionModel;
  setSelectionModel: (model: GridRowSelectionModel) => void;
  sortModel: GridSortModel;
  setSortModel: (model: GridSortModel) => void;
  onHover: (id: string | null) => void;
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
  onHover,
  rowToHighlight,
  isBusy,
}: BoreholeTableProps) => {
  const { t, i18n } = useTranslation();
  const history = useHistory();
  const domains = useDomains();
  const apiRef = useGridApiRef();
  const rowCountRef = useRef(boreholes?.length || 0);

  const rowCount = useMemo(() => {
    if (boreholes?.length > 0) {
      rowCountRef.current = boreholes.length;
    }
    return rowCountRef.current;
  }, [boreholes?.length]);

  const columns: GridColDef[] = [
    { field: "original_name", headerName: t("name"), flex: 1 },
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
  ];

  const handleRowClick: GridEventListener<"rowClick"> = params => {
    history.push(`/${params.row.id}`);
  };

  const getRowClassName = (params: { id: GridRowId }) => {
    return rowToHighlight === params.id ? "highlighted-row" : "";
  };

  useEffect(() => {
    if (apiRef.current) {
      const handleRowMouseEnter: GridEventListener<"rowMouseEnter"> = params => {
        onHover(params.row.id);
      };

      const handleRowMouseLeave: GridEventListener<"rowMouseLeave"> = () => {
        onHover(null);
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
  }, [apiRef, onHover]);

  const StyledDataGrid = styled(DataGrid)(() => ({
    fontFamily: theme.typography.fontFamily,
    fontSize: "16px",
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
    "& .highlighted-row": {
      backgroundColor: theme.palette.background.lightgrey,
      color: theme.palette.primary.main,
    },
  }));

  return (
    <StyledDataGrid
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
      localeText={{
        MuiTablePagination: {
          labelRowsPerPage: t("rowsPerPage"),
          labelDisplayedRows: ({ from, to, count }) => `${from} - ${to} ${t("of")} ${count}`,
        },
      }}
      disableColumnSelector
      disableColumnFilter
      checkboxSelection
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
