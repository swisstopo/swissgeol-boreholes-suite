import { Dispatch, FC, SetStateAction, useContext, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Typography } from "@mui/material";
import { Stack } from "@mui/system";
import { GridColDef, GridEventListener, GridRowSelectionModel, useGridApiRef } from "@mui/x-data-grid";
import { DeleteButton, ExportButton } from "../../../../components/buttons/buttons.tsx";
import { Codelist, useCodelists } from "../../../../components/codelist.ts";
import { formatNumberForDisplay } from "../../../../components/form/formUtils.ts";
import { Table } from "../../../../components/table/table.tsx";
import { EditStateContext } from "../../editStateContext.tsx";
import { LogRun, useLogRunMutations } from "./log.ts";
import { getServiceOrToolArray } from "./logUtils.ts";

interface LogTableProps {
  runs: LogRun[];
  isLoading: boolean;
  setSelectedLogRun: Dispatch<SetStateAction<LogRun | undefined>>;
}

export const LogTable: FC<LogTableProps> = ({ runs, isLoading, setSelectedLogRun }) => {
  const { editingEnabled } = useContext(EditStateContext);
  const { t, i18n } = useTranslation();
  const apiRef = useGridApiRef();
  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>([]);
  const { data: codelists } = useCodelists();
  const {
    delete: { mutate: deleteLogRuns },
  } = useLogRunMutations();

  const exportData = () => {
    console.log("Export log runs", selectionModel);
  };

  const exportTable = () => {
    console.log("Export log runs table", selectionModel);
  };

  const handleRowClick: GridEventListener<"rowClick"> = params => {
    setSelectedLogRun(runs.find(run => run.id === params.row.id) ?? undefined);
  };

  const deleteLogRun = (selectedRows: GridRowSelectionModel) => {
    // Todo: only permanently delete runs on save
    deleteLogRuns(runs.filter(run => selectedRows.includes(run.id)));
  };

  const columns = useMemo<GridColDef<LogRun>[]>(
    () => [
      {
        field: "runNumber",
        headerName: t("runNumber"),
        flex: 1,
        valueGetter: (_, row) => row?.runNumber ?? "",
      },
      {
        field: "loggedInterval",
        valueGetter: (_, row: LogRun) =>
          `${formatNumberForDisplay(row?.fromDepth, 1)} - ${formatNumberForDisplay(row?.toDepth, 1)}`,
        headerName: t("loggedInterval") + ` [${t("mMd")}]`,
        flex: 1,
      },
      {
        field: "serviceOrTool",
        valueGetter: (_, row) => {
          return getServiceOrToolArray(row, codelists).join(", ");
        },
        headerName: t("serviceOrTool"),
        flex: 1,
      },
      {
        field: "boreholeStatus",
        valueGetter: (value: Codelist) => value?.[i18n.language] ?? value?.["en"] ?? "",
        headerName: t("boreholeStatus"),
        flex: 1,
      },
      {
        field: "runDate",
        valueGetter: (value: string) => (value && new Date(value).toLocaleDateString()) ?? "",
        headerName: t("runDate"),
        flex: 1,
      },
      {
        field: "comment",
        headerName: t("comment"),
        flex: 1,
      },
    ],
    [t, codelists, i18n.language],
  );
  if (runs.length === 0) {
    return <Typography>{t("noLogRun")}</Typography>;
  }

  const selection = true;
  return (
    <>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Stack direction="row" alignItems="center" gap={1}>
          <Typography data-cy="log-run-count">
            {selectionModel.length > 0
              ? t("selectedCount", { count: selectionModel.length })
              : `${runs.length} ${t("runs")}`}
          </Typography>
          {selection && (
            <>
              {editingEnabled && (
                <DeleteButton disabled={selectionModel.length === 0} onClick={() => deleteLogRun(selectionModel)} />
              )}
              <ExportButton label={"exportData"} disabled={selectionModel.length === 0} onClick={() => exportData()} />
              <ExportButton
                label={"exportTable"}
                disabled={selectionModel.length === 0}
                onClick={() => exportTable()}
              />
            </>
          )}
        </Stack>
      </Stack>
      <Table
        apiRef={apiRef}
        isLoading={isLoading}
        rows={runs}
        columns={columns}
        showQuickFilter={false}
        onRowClick={handleRowClick}
        checkboxSelection
        rowSelectionModel={selectionModel}
        onRowSelectionModelChange={setSelectionModel}
        rowAutoHeight={true}
      />
    </>
  );
};
