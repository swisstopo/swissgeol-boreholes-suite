import { Dispatch, SetStateAction, useCallback, useContext } from "react";
import { useTranslation } from "react-i18next";
import { GridPaginationModel, GridRowSelectionModel, GridSortModel } from "@mui/x-data-grid";
import { BoreholeListItem, useBoreholeMutations } from "../../../api/borehole.ts";
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
  onBulkEdit: () => void;
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
  onBulkEdit,
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
  const {
    copy: { mutateAsync: copyBorehole, isPending: isCopying },
    bulkDelete: { mutate: bulkDeleteBoreholes, isPending: isBulkDeleting },
  } = useBoreholeMutations();
  const { bottomDrawerOpen } = useBoreholeUrlParams();
  const { currentWorkgroupId } = useUserWorkgroups();
  const { showAlert } = useContext(AlertContext);
  const { t } = useTranslation();

  const onCopyBorehole = useCallback(async () => {
    const newBoreholeId = await copyBorehole({ boreholeId: selectionModel, workgroupId: currentWorkgroupId });
    navigateTo({ path: `/${newBoreholeId}` });
  }, [copyBorehole, navigateTo, selectionModel, currentWorkgroupId]);

  const onDeleteMultiple = useCallback(() => {
    const boreholeIds = selectionModel.filter((id): id is number => typeof id === "number");
    bulkDeleteBoreholes(boreholeIds, {
      onError: error => {
        if (error instanceof ApiError && error.messageKey === "bulkDeleteUnauthorizedBoreholes") {
          const rawIds = error.details?.unauthorizedBoreholeIds;
          const ids = Array.isArray(rawIds) ? rawIds.filter((id): id is number => typeof id === "number") : [];
          showAlert(`${t("bulkDeleteUnauthorizedBoreholes")} ${ids.join(", ")}`, "error");
        } else {
          const message = error instanceof Error ? error.message : String(error);
          showAlert(`${t("errorBulkDeleting")} ${message}`, "error");
        }
      },
    });
  }, [bulkDeleteBoreholes, selectionModel, showAlert, t]);

  return (
    <>
      <BottomBar
        selectionModel={selectionModel}
        onBulkEdit={onBulkEdit}
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
          isLoading={isCopying || isBulkDeleting}
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
