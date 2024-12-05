import React, { useCallback, useContext, useLayoutEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { GridRowSelectionModel, GridSortDirection, GridSortModel } from "@mui/x-data-grid";
import { ArrowDownToLine } from "lucide-react";
import { deleteBoreholes } from "../../../api-lib";
import { Boreholes, ReduxRootState, User } from "../../../api-lib/ReduxStateInterfaces.ts";
import { copyBorehole, exportCSVBorehole, getAllBoreholes } from "../../../api/borehole.ts";
import { PromptContext } from "../../../components/prompt/promptContext.tsx";
import { downloadData } from "../../../utils.ts";
import { OverViewContext } from "../overViewContext.tsx";
import { FilterContext } from "../sidePanelContent/filter/filterContext.tsx";
import { BoreholeTable } from "./boreholeTable.tsx";
import BottomBar from "./bottomBar.tsx";
import { BottomDrawer } from "./bottomDrawer.tsx";

interface BottomBarContainerProps {
  boreholes: Boreholes;
  search: { filter: string };
  setHover: React.Dispatch<React.SetStateAction<number | null>>;
  loadEditingBoreholes: (
    page: number,
    limit: number,
    filter: string,
    orderby: string,
    direction: string,
    featureIds: number[],
  ) => void;
  multipleSelected: (selection: GridRowSelectionModel, filter: string) => void;
  rowToHighlight: number | null;
  selectionModel: GridRowSelectionModel;
  setSelectionModel: React.Dispatch<React.SetStateAction<GridRowSelectionModel>>;
}

const BottomBarContainer = ({
  boreholes,
  loadEditingBoreholes,
  multipleSelected,
  search,
  setHover,
  rowToHighlight,
  selectionModel,
  setSelectionModel,
}: BottomBarContainerProps) => {
  const user: User = useSelector((state: ReduxRootState) => state.core_user);
  const history = useHistory();
  const { t } = useTranslation();
  const { featureIds } = useContext(FilterContext);
  const { bottomDrawerOpen } = useContext(OverViewContext);
  const { showPrompt } = useContext(PromptContext);
  const [workgroupId, setWorkgroupId] = useState<string>(user.data.workgroups[0]?.id);
  const [isBusy, setIsBusy] = useState(false);
  const [paginationModel, setPaginationModel] = useState({
    pageSize: boreholes.limit ?? 100,
    page: boreholes.page ? boreholes.page - 1 : 0, // MUI pagination starts at 0, whereas server pagination starts at 1
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([
    {
      field: boreholes.orderby ?? "alternate_name",
      sort: boreholes.direction ? (boreholes.direction.toLowerCase() as GridSortDirection) : "asc",
    },
  ]);

  const reloadBoreholes = useCallback(() => {
    loadEditingBoreholes(
      paginationModel.page + 1, // MUI pagination starts at 0, whereas server pagination starts at 1
      paginationModel.pageSize,
      search.filter,
      sortModel[0]?.field || "alternate_name",
      sortModel[0]?.sort === "desc" ? "DESC" : "ASC",
      featureIds,
    );
  }, [paginationModel, search, sortModel, loadEditingBoreholes, featureIds]);

  // LayoutEffect prevents cached table data to appear before reload
  useLayoutEffect(() => {
    reloadBoreholes();
  }, [reloadBoreholes]);

  const onCopyBorehole = async () => {
    setIsBusy(true);
    const newBoreholeId = await copyBorehole(selectionModel, workgroupId);
    setIsBusy(false);
    history.push(`/${newBoreholeId}`);
  };

  const onDeleteMultiple = async () => {
    setIsBusy(true);
    // @ts-expect-error legacy api calls not typed
    await deleteBoreholes(selectionModel).then(() => {
      reloadBoreholes();
    });
    setIsBusy(false);
  };

  const handleExportMultipleJson = async () => {
    const paginatedResponse = await getAllBoreholes(selectionModel, 1, selectionModel.length);
    const jsonString = JSON.stringify(paginatedResponse.boreholes, null, 2);
    downloadData(jsonString, `bulkexport_${new Date().toISOString().split("T")[0]}.json`, "application/json");
  };

  const handleExportMultipleCsv = async () => {
    const csvData = await exportCSVBorehole(selectionModel.slice(0, 100));
    downloadData(csvData, `bulkexport_${new Date().toISOString().split("T")[0]}.csv`, "text/csv");
  };

  const showPromptExportMoreThan100 = (callback: () => void) => {
    showPrompt(t("bulkExportMoreThan100"), [
      {
        label: t("cancel"),
      },
      {
        label: t("export100Boreholes"),
        icon: <ArrowDownToLine />,
        variant: "contained",
        action: callback,
      },
    ]);
  };

  const onExportMultipleJson = () => {
    if (selectionModel.length > 100) {
      showPromptExportMoreThan100(handleExportMultipleJson);
    } else {
      handleExportMultipleJson();
    }
  };

  const onExportMultipleCsv = async () => {
    if (selectionModel.length > 100) {
      showPromptExportMoreThan100(handleExportMultipleCsv);
    } else {
      await handleExportMultipleCsv();
    }
  };

  return (
    <>
      <BottomBar
        selectionModel={selectionModel}
        multipleSelected={multipleSelected}
        onCopyBorehole={onCopyBorehole}
        onDeleteMultiple={onDeleteMultiple}
        onExportMultipleJson={onExportMultipleJson}
        onExportMultipleCsv={onExportMultipleCsv}
        search={search}
        boreholes={boreholes}
        workgroup={workgroupId}
        setWorkgroup={setWorkgroupId}
      />
      <BottomDrawer drawerOpen={bottomDrawerOpen}>
        <BoreholeTable
          boreholes={boreholes}
          paginationModel={paginationModel}
          setPaginationModel={setPaginationModel}
          selectionModel={selectionModel}
          setSelectionModel={setSelectionModel}
          sortModel={sortModel}
          setSortModel={setSortModel}
          rowToHighlight={rowToHighlight}
          setHover={setHover}
          isBusy={isBusy}
        />
      </BottomDrawer>
    </>
  );
};

export default BottomBarContainer;
