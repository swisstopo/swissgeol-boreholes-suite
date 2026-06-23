import { Dispatch, SetStateAction, useCallback, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { GridPaginationModel, GridRowSelectionModel, GridSortModel } from "@mui/x-data-grid";
import { BoreholeListItem, bulkDeleteBoreholes, copyBorehole, useReloadBoreholes } from "../../../api/borehole.ts";
import { ApiError } from "../../../api/errorClasses.ts";
import { AlertContext } from "../../../components/alert/alertContext.tsx";
import { useBoreholesNavigate } from "../../../hooks/useBoreholesNavigate.tsx";
import { useBoreholeUrlParams } from "../useBoreholeUrlParams.ts";
import { useUserWorkgroups } from "../UserWorkgroupsContext.tsx";
import { BoreholeTable } from "./boreholeTable.tsx";
import BottomBar from "./bottomBar.tsx";
import { BottomDrawer } from "./bottomDrawer.tsx";

interface BottomBarContainerProps {
  boreholes: BoreholeListItem[];
  totalCount: number;
  selectableBoreholeIds: number[];
  setHover: Dispatch<SetStateAction<number | null>>;
  multipleSelected: (selection: GridRowSelectionModel, filter: Record<string, unknown>) => void;
  rowsToHighlight: number[];
  selectionModel: GridRowSelectionModel;
  setSelectionModel: Dispatch<SetStateAction<GridRowSelectionModel>>;
  setIsExporting: Dispatch<SetStateAction<boolean>>;
  paginationModel: GridPaginationModel;
  setPaginationModel: (model: GridPaginationModel) => void;
  sortModel: GridSortModel;
  setSortModel: (model: GridSortModel) => void;
}

const BottomBarContainer = ({
  boreholes,
  totalCount,
  selectableBoreholeIds,
  multipleSelected,
  setHover,
  rowsToHighlight,
  selectionModel,
  setSelectionModel,
  setIsExporting,
  paginationModel,
  setPaginationModel,
  sortModel,
  setSortModel,
}: BottomBarContainerProps) => {
  const { navigateTo } = useBoreholesNavigate();
  const reloadBoreholes = useReloadBoreholes();
  const { bottomDrawerOpen } = useBoreholeUrlParams();
  const { currentWorkgroupId } = useUserWorkgroups();
  const { showAlert } = useContext(AlertContext);
  const { t } = useTranslation();

  const [isBusy, setIsBusy] = useState(false);

  const onCopyBorehole = useCallback(async () => {
    setIsBusy(true);
    const newBoreholeId = await copyBorehole(selectionModel, currentWorkgroupId);
    setIsBusy(false);
    navigateTo({ path: `/${newBoreholeId}` });
  }, [navigateTo, selectionModel, currentWorkgroupId]);

  const onDeleteMultiple = useCallback(async () => {
    setIsBusy(true);
    try {
      const boreholeIds = selectionModel.filter((id): id is number => typeof id === "number");
      await bulkDeleteBoreholes(boreholeIds);
      reloadBoreholes();
    } catch (error) {
      if (error instanceof ApiError && error.messageKey === "bulkDeleteUnauthorizedBoreholes") {
        const rawIds = error.details?.unauthorizedBoreholeIds;
        const ids = Array.isArray(rawIds) ? rawIds.filter((id): id is number => typeof id === "number") : [];
        showAlert(`${t("bulkDeleteUnauthorizedBoreholes")} ${ids.join(", ")}`, "error");
      } else {
        const message = error instanceof Error ? error.message : String(error);
        showAlert(`${t("errorBulkDeleting")} ${message}`, "error");
      }
    } finally {
      setIsBusy(false);
    }
  }, [reloadBoreholes, selectionModel, showAlert, t]);

  return (
    <>
      <BottomBar
        selectionModel={selectionModel}
        multipleSelected={multipleSelected}
        onCopyBorehole={onCopyBorehole}
        onDeleteMultiple={onDeleteMultiple}
        totalCount={totalCount}
        setIsExporting={setIsExporting}
      />
      <BottomDrawer drawerOpen={bottomDrawerOpen}>
        <BoreholeTable
          boreholes={boreholes}
          totalCount={totalCount}
          selectableBoreholeIds={selectableBoreholeIds}
          isLoading={isBusy}
          paginationModel={paginationModel}
          setPaginationModel={setPaginationModel}
          selectionModel={selectionModel}
          setSelectionModel={setSelectionModel}
          sortModel={sortModel}
          setSortModel={setSortModel}
          rowsToHighlight={rowsToHighlight}
          setHover={setHover}
        />
      </BottomDrawer>
    </>
  );
};

export default BottomBarContainer;
