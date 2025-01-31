import React, { FC, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { Box } from "@mui/system";
import {
  DataGrid,
  GridCellCheckboxRenderer,
  GridColDef,
  GridColumnHeaderParams,
  GridEventListener,
  GridHeaderCheckbox,
  GridPaginationModel,
  GridRenderCellParams,
  GridRowParams,
  GridRowSelectionModel,
  GridScrollParams,
  GridSortModel,
  useGridApiRef,
} from "@mui/x-data-grid";
import { LockKeyhole } from "lucide-react";
import _ from "lodash";
import { Boreholes } from "../../../api-lib/ReduxStateInterfaces.ts";
import { useDomains } from "../../../api/fetchApiV2";
import { theme } from "../../../AppTheme.ts";
import { useAuth } from "../../../auth/useBdmsAuth.tsx";
import { muiLocales } from "../../../mui.locales.ts";
import { OverViewContext } from "../overViewContext.tsx";
import { TablePaginationActions } from "./TablePaginationActions.tsx";

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
  const auth = useAuth();
  const firstRender = useRef(true);
  const { tableScrollPosition, setTableScrollPosition } = useContext(OverViewContext);
  const hasLoaded = useRef(false);
  const rowCountRef = useRef(boreholes?.length || 0);
  const scrollPositionRef = useRef(tableScrollPosition);
  const [filteredIds, setFilteredIds] = useState<number[]>([]);

  // This useEffect makes sure that the table selection model is only updated when the
  // filtered_borehole_ids have changed and not whenever the boreholes.data changes,
  // which also happens on every pagination event (server side pagination).
  useEffect(() => {
    if (boreholes?.filtered_borehole_ids && filteredIds) {
      if (!_.isEqual(boreholes.filtered_borehole_ids, filteredIds)) {
        setFilteredIds(boreholes.filtered_borehole_ids as number[]);
        setSelectionModel([]);
      }
    }
  }, [boreholes.filtered_borehole_ids, filteredIds, setSelectionModel]);

  const rowCount = useMemo(() => {
    if (boreholes?.length > 0) {
      rowCountRef.current = boreholes.length;
    }
    return rowCountRef.current;
  }, [boreholes?.length]);

  const renderHeaderCheckbox = useCallback(
    (params: GridColumnHeaderParams) => {
      const handleHeaderCheckboxClick = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
          setSelectionModel(boreholes.filtered_borehole_ids);
        } else {
          setSelectionModel([]);
        }
      };

      return (
        <GridHeaderCheckbox
          {...params}
          // @ts-expect-error onChange is not in the GridColumnHeaderParams type, but can be used
          onChange={handleHeaderCheckboxClick}
          data-cy={"table-header-checkbox"}
          sx={{ m: 1 }}
        />
      );
    },
    [boreholes.filtered_borehole_ids, setSelectionModel],
  );

  const renderCellCheckbox = useCallback(
    (params: GridRenderCellParams) => {
      const handleCheckBoxClick = (event: React.ChangeEvent<HTMLInputElement>) => {
        const rowId = params.id as number;
        if (event.target.checked) {
          setSelectionModel([...new Set([...selectionModel, rowId])]);
        } else {
          setSelectionModel(selectionModel.filter(item => item !== rowId));
        }
      };
      return (
        <Box sx={{ p: 1 }}>
          <GridCellCheckboxRenderer
            {...params}
            // @ts-expect-error onChange is not in the GridColumnHeaderParams type, but can be used
            onChange={handleCheckBoxClick}
          />
        </Box>
      );
    },
    [selectionModel, setSelectionModel],
  );

  const columns: GridColDef[] = [
    {
      field: "__check__",
      width: 10,
      resizable: false,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      disableReorder: true,
      disableExport: true,
      renderHeader: renderHeaderCheckbox,
      renderCell: renderCellCheckbox,
    },
    { field: "alternate_name", headerName: t("name"), flex: 1 },
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
      resizable: false,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      disableReorder: true,
      disableExport: true,
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

  // Add workgroup column if not in anonymous mode
  !auth.anonymousModeEnabled &&
    columns.splice(2, 0, {
      field: "workgroup",
      valueGetter: (value: { name: string }) => {
        return value.name;
      },
      headerName: t("workgroup"),
      flex: 1,
    });

  const handleRowClick: GridEventListener<"rowClick"> = params => {
    history.push(`/${params.row.id}/location`);
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

      const handleScrollPosition: GridEventListener<"scrollPositionChange"> = (params: GridScrollParams) => {
        scrollPositionRef.current = { top: params.top, left: params.left };
      };

      const handleRowMouseLeave: GridEventListener<"rowMouseLeave"> = () => {
        setHover(null);
      };

      const unsubscribeMouseEnter = apiRef.current.subscribeEvent("rowMouseEnter", handleRowMouseEnter);
      const unsubscribeMouseLeave = apiRef.current.subscribeEvent("rowMouseLeave", handleRowMouseLeave);
      const unsubscribeScroll = apiRef.current.subscribeEvent("scrollPositionChange", handleScrollPosition);

      // Clean up subscriptions
      return () => {
        unsubscribeMouseEnter();
        unsubscribeMouseLeave();
        unsubscribeScroll();
      };
    }
  }, [apiRef, setHover]);

  // Store table scroll position in context on unmount
  useEffect(() => {
    return () => {
      setTableScrollPosition(scrollPositionRef.current);
    };
  }, [setTableScrollPosition]);

  // Restore table scroll position
  const isLoading = boreholes.isFetching || isBusy;

  useEffect(() => {
    if (!apiRef.current) return;

    if (isLoading) {
      hasLoaded.current = true;
      return;
    }

    // Workaround to restore scroll position see #https://github.com/mui/mui-x/issues/5071 and https://github.com/mui/mui-x/issues/4674
    if (firstRender.current && hasLoaded.current) {
      requestIdleCallback(() => {
        apiRef.current.scroll(tableScrollPosition);
        firstRender.current = false;
      });
    }
  }, [apiRef, isLoading, tableScrollPosition]);

  return (
    <DataGrid
      sx={{
        cursor: "pointer",
        ".MuiDataGrid-columnHeader": {
          backgroundColor: theme.palette.border.light,
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
      loading={isLoading}
      rowCount={rowCount}
      rows={boreholes.data}
      columns={columns}
      paginationMode="server"
      hideFooterPagination={!boreholes.length}
      paginationModel={paginationModel}
      onPaginationModelChange={setPaginationModel}
      pageSizeOptions={[100]}
      slotProps={{
        pagination: {
          ActionsComponent: TablePaginationActions,
        },
      }}
      localeText={muiLocales[i18n.language]}
      disableColumnSelector
      disableColumnFilter
      checkboxSelection={true}
      isRowSelectable={(params: GridRowParams) => params.row.lock === null}
      disableRowSelectionOnClick
      rowSelectionModel={selectionModel}
      hideFooterSelectedRowCount
      sortingMode="server"
      sortModel={sortModel}
      onSortModelChange={setSortModel}
    />
  );
};
