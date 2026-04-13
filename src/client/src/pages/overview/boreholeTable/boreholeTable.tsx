import {
  ChangeEvent,
  Dispatch,
  FC,
  SetStateAction,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { CircularProgress } from "@mui/material";
import { Box } from "@mui/system";
import {
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
import { BoreholeListItem } from "../../../api/borehole.ts";
import { theme } from "../../../AppTheme.ts";
import { useAuth } from "../../../auth/useBoreholesAuth.tsx";
import { useCodelists } from "../../../components/codelist.ts";
import { formatNumberForDisplay } from "../../../components/form/formUtils.ts";
import { FullPageCentered } from "../../../components/styledComponents.ts";
import { Table } from "../../../components/table/table.tsx";
import { useBoreholesNavigate } from "../../../hooks/useBoreholesNavigate.tsx";
import { SessionKeys } from "../SessionKey.ts";

export interface BoreholeTableProps {
  boreholes: BoreholeListItem[];
  totalCount: number;
  selectableBoreholeIds: number[];
  isLoading: boolean;
  paginationModel: GridPaginationModel;
  setPaginationModel: (model: GridPaginationModel) => void;
  selectionModel: GridRowSelectionModel;
  setSelectionModel: (model: GridRowSelectionModel) => void;
  sortModel: GridSortModel;
  setSortModel: (model: GridSortModel) => void;
  setHover: Dispatch<SetStateAction<number | null>>;
  rowsToHighlight: number[];
}

export const BoreholeTable: FC<BoreholeTableProps> = ({
  boreholes,
  totalCount,
  selectableBoreholeIds,
  isLoading,
  paginationModel,
  setPaginationModel,
  selectionModel,
  setSelectionModel,
  sortModel,
  setSortModel,
  setHover,
  rowsToHighlight,
}: BoreholeTableProps) => {
  const { t, i18n } = useTranslation();
  const { navigateTo } = useBoreholesNavigate();
  const codelists = useCodelists();
  const apiRef = useGridApiRef();
  const auth = useAuth();
  const firstRender = useRef(true);
  const rowCountRef = useRef(totalCount || 0);
  const scrollPositionRef = useRef<Partial<GridScrollParams>>({ top: 0, left: 0 });
  const [filteredIds, setFilteredIds] = useState<number[]>([]);

  // This useEffect makes sure that the table selection model is only updated when the
  // selectableBoreholeIds have changed and not whenever the boreholes change,
  // which also happens on every pagination event (server side pagination).
  useEffect(() => {
    if (selectableBoreholeIds && filteredIds) {
      if (!_.isEqual(selectableBoreholeIds, filteredIds)) {
        setFilteredIds(selectableBoreholeIds);
        setSelectionModel([]);
      }
    }
  }, [selectableBoreholeIds, filteredIds, setSelectionModel]);

  const rowCount = useMemo(() => {
    if (totalCount > 0) {
      rowCountRef.current = totalCount;
    }
    return rowCountRef.current;
  }, [totalCount]);

  const renderHeaderCheckbox = useCallback(
    (params: GridColumnHeaderParams) => {
      const handleHeaderCheckboxClick = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
          setSelectionModel(selectableBoreholeIds);
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
    [selectableBoreholeIds, setSelectionModel],
  );

  const renderCellCheckbox = useCallback(
    (params: GridRenderCellParams) => {
      const handleCheckBoxClick = (event: ChangeEvent<HTMLInputElement>) => {
        const rowId = params.id as number;
        if (event.target.checked) {
          setSelectionModel([...new Set([...selectionModel, rowId])]);
        } else {
          setSelectionModel(selectionModel.filter(item => item !== rowId));
        }
      };
      return (
        <Box sx={{ pl: 1 }}>
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
    {
      field: "name",
      headerName: t("name"),
      flex: 1,
    },
    {
      field: "typeId",
      valueGetter: (value: number) => {
        const domain = codelists.data?.find((d: { id: number }) => d.id === value);
        if (domain) {
          return domain[i18n.language];
        }
        return "";
      },
      headerName: t("borehole_type"),
      flex: 1,
    },
    {
      field: "totalDepth",
      valueGetter: (value: number) => formatNumberForDisplay(Math.round(value * 100) / 100, 2),
      headerName: t("totaldepth"),
      flex: 1,
    },
    {
      field: "purposeId",
      valueGetter: (value: number) => {
        const domain = codelists.data?.find((d: { id: number }) => d.id === value);
        return domain ? domain[i18n.language] : "";
      },
      headerName: t("purpose"),
      flex: 1,
    },
    {
      field: "elevationZ",
      valueGetter: (value: number) => formatNumberForDisplay(Math.round(value * 100) / 100, 2),
      headerName: t("reference_elevation"),
      flex: 1,
    },
    {
      field: "locationX",
      valueGetter: (value: number) => formatNumberForDisplay(Math.round(value * 100) / 100, 2),
      headerName: t("location_x"),
      flex: 1,
    },
    {
      field: "locationY",
      valueGetter: (value: number) => formatNumberForDisplay(Math.round(value * 100) / 100, 2),
      headerName: t("location_y"),
      flex: 1,
    },
    {
      field: "locked",
      headerName: "",
      width: 20,
      resizable: false,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      disableReorder: true,
      disableExport: true,
      renderCell: value => {
        if (value.row.locked) {
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
  if (!auth.anonymousModeEnabled) {
    columns.splice(2, 0, {
      field: "workgroupId",
      valueGetter: (_value: number | null, row: BoreholeListItem) => row.workgroupName ?? "",
      headerName: t("workgroup"),
      flex: 1,
    });
  }

  const handleRowClick: GridEventListener<"rowClick"> = params => {
    navigateTo({ path: `/${params.row.id}/location` });
  };

  const getRowClassName = (params: GridRowParams) => {
    let css = "";
    if (params.row.locked) {
      css = "disabled-row ";
    }
    if (rowsToHighlight.includes(params.id as number)) {
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
    return () => sessionStorage.setItem(SessionKeys.tableScrollPosition, JSON.stringify(scrollPositionRef.current));
  }, []);

  // Restore table scroll position
  useEffect(() => {
    if (!apiRef.current) return;

    // Workaround to restore scroll position see #https://github.com/mui/mui-x/issues/5071 and https://github.com/mui/mui-x/issues/4674
    if (firstRender.current) {
      requestIdleCallback(
        () => {
          const scrollPosition =
            sessionStorage.getItem(SessionKeys.tableScrollPosition) === null
              ? { top: 0, left: 0 }
              : JSON.parse(sessionStorage.getItem(SessionKeys.tableScrollPosition) as string);
          apiRef.current?.scroll(scrollPosition);
          scrollPositionRef.current = scrollPosition;
          firstRender.current = false;
        },
        { timeout: 1000 },
      );
    }
  }, [apiRef]);

  return (
    <Suspense
      fallback={
        <FullPageCentered>
          <CircularProgress />
        </FullPageCentered>
      }>
      <Table<BoreholeListItem>
        rows={boreholes}
        columns={columns}
        dataCy={"borehole-table"}
        apiRef={apiRef}
        onRowClick={handleRowClick}
        getRowClassName={getRowClassName}
        sortModel={sortModel}
        onSortModelChange={setSortModel}
        isLoading={isLoading}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        rowCount={rowCount}
        paginationMode="server"
        sortingMode="server"
        checkboxSelection={true}
        isRowSelectable={(params: GridRowParams) => params.row.locked === null}
        rowSelectionModel={selectionModel}
        showQuickFilter={false}
      />
    </Suspense>
  );
};
