import { FC, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Typography } from "@mui/material";
import { Stack } from "@mui/system";
import { GridColDef, GridRowSelectionModel, useGridApiRef } from "@mui/x-data-grid";
import Filter2Icon from "../../../../assets/icons/filter2.svg?react";
import { getSectionsByBoreholeId } from "../../../../api/fetchApiV2.ts";
import { theme } from "../../../../AppTheme.ts";
import { BoreholesButton, DeleteButton, ExportButton } from "../../../../components/buttons/buttons.tsx";
import { Codelist, useCodelists } from "../../../../components/codelist.ts";
import { FormContainer, FormDomainMultiSelect, FormMultiSelect, FormSelect } from "../../../../components/form/form.ts";
import { FormMultiSelectValue } from "../../../../components/form/formMultiSelect.tsx";
import { FormSelectValue } from "../../../../components/form/formSelect.tsx";
import { formatNumberForDisplay } from "../../../../components/form/formUtils.ts";
import { Table } from "../../../../components/table/table.tsx";
import { EditStateContext } from "../../editStateContext.tsx";
import { LogRun } from "./log.ts";

interface SectionFilter {
  id: number;
  label: string;
  fromDepth: number;
  toDepth: number;
}

interface LogRunFilter {
  runNumbers: number[];
  section: number;
  toolTypes: number[];
}

interface LogTableProps {
  boreholeId: string;
  runs: LogRun[];
  isLoading: boolean;
}

export const LogTable: FC<LogTableProps> = ({ boreholeId, runs, isLoading }) => {
  const { editingEnabled } = useContext(EditStateContext);
  const { t, i18n } = useTranslation();
  const apiRef = useGridApiRef();
  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>([]);
  const [filterVisible, setFilterVisible] = useState(false);
  const formMethods = useForm<LogRunFilter>({ mode: "onChange" });
  const runFilter = formMethods.watch("runNumbers");
  const sectionFilter = formMethods.watch("section");
  const toolTypeFilter = formMethods.watch("toolTypes");

  const codelists = useCodelists();
  const runNumbers = useMemo<FormMultiSelectValue[]>(
    () =>
      runs
        .filter(run => run.runNumber !== undefined)
        .map(run => ({ key: run.id, name: run.runNumber! }) as FormMultiSelectValue),
    [runs],
  );
  const [sectionFilters, setSectionFilters] = useState<SectionFilter[]>();
  const filteredRuns = useMemo<LogRun[]>(() => {
    let filtered = runs;
    if (runFilter && runFilter.length > 0) {
      filtered = filtered.filter(run => runFilter.includes(run.id));
    }
    if (sectionFilter && sectionFilters) {
      const section = sectionFilters.find(s => s.id === sectionFilter);
      if (section) {
        filtered = filtered.filter(
          run =>
            run.fromDepth !== undefined &&
            run.toDepth !== undefined &&
            run.fromDepth <= section.toDepth &&
            run.toDepth >= section.fromDepth,
        );
      }
    }
    if (toolTypeFilter && toolTypeFilter.length > 0) {
      filtered = filtered.filter(run =>
        run.logFiles?.some(file => file.toolTypeCodelistIds?.some(id => toolTypeFilter.includes(id)) ?? false),
      );
    }
    return filtered;
  }, [runs, runFilter, sectionFilter, sectionFilters, toolTypeFilter]);

  useEffect(() => {
    if (!sectionFilters) {
      getSectionsByBoreholeId(Number(boreholeId)).then(sections => {
        const filters: SectionFilter[] = [];
        for (const section of sections) {
          for (const element of section.sectionElements) {
            filters.push({
              id: element.id,
              label:
                section.name +
                ` (${formatNumberForDisplay(element.fromDepth, 1)} - ${formatNumberForDisplay(element.toDepth, 1)})`,
              fromDepth: element.fromDepth,
              toDepth: element.toDepth,
            });
          }
        }
        setSectionFilters(filters);
      });
    }
  }, [boreholeId, sectionFilters]);

  const displayServiceOrTool = useCallback(
    (logRun: LogRun) => {
      return (
        logRun.logFiles
          ?.flatMap(file => file.toolTypeCodelistIds)
          .filter((id, index, array) => array.indexOf(id) === index) // get unique ids
          ?.map(id => codelists.data?.find((d: Codelist) => d.id === id)?.code)
          .join(", ") ?? ""
      );
    },
    [codelists.data],
  );

  const deleteLogRun = () => {
    console.log("Delete log runs", selectionModel);
  };

  const exportData = () => {
    console.log("Export log runs", selectionModel);
  };

  const exportTable = () => {
    console.log("Export log runs table", selectionModel);
  };

  const columns = useMemo<GridColDef<LogRun>[]>(
    () => [
      {
        field: "runNumber",
        headerName: t("runNumber"),
        flex: 1,
        valueGetter: (value, row) => row?.runNumber ?? "",
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
        valueGetter: (value, row) => {
          return displayServiceOrTool(row);
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
    [t, displayServiceOrTool, i18n.language],
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
              : `${filteredRuns.length} ${t("run", { count: filteredRuns.length })}`}
          </Typography>
          {selection && (
            <>
              {editingEnabled && <DeleteButton disabled={selectionModel.length === 0} onClick={() => deleteLogRun()} />}
              <ExportButton label={"exportData"} disabled={selectionModel.length === 0} onClick={() => exportData()} />
              <ExportButton
                label={"exportTable"}
                disabled={selectionModel.length === 0}
                onClick={() => exportTable()}
              />
            </>
          )}
        </Stack>
        <Stack direction="row" alignItems="center" gap={1}>
          <BoreholesButton
            label={"filter"}
            onClick={() => setFilterVisible(prev => !prev)}
            variant={filterVisible ? "contained" : "outlined"}
            sx={
              filterVisible
                ? {
                    color: `${theme.palette.toggleButton.active.color} !important`,
                    backgroundColor: `${theme.palette.toggleButton.active.backgroundColor} !important`,
                    padding: `9px 13px`,
                    boxShadow: "none",
                    "&:hover": {
                      backgroundColor: `${theme.palette.toggleButton.active.hoverBackgroundColor} !important`,
                    },
                  }
                : {}
            }
            icon={<Filter2Icon />}
          />
        </Stack>
      </Stack>
      {filterVisible && (
        <FormProvider {...formMethods}>
          <FormContainer direction={"row"} mb={2} justifyContent={"space-between"}>
            <FormMultiSelect fieldName={"runNumbers"} label={"runNumber"} values={runNumbers} readonly={false} />
            <FormSelect
              fieldName={"section"}
              label={"sectionName"}
              values={sectionFilters?.map(filter => ({ key: filter.id, name: filter.label }) as FormSelectValue) ?? []}
              readonly={false}
            />
            <FormDomainMultiSelect
              schemaName={"log_tool_type"}
              fieldName={"toolTypes"}
              label={"serviceOrTool"}
              showCode={true}
              readonly={false}
            />
          </FormContainer>
        </FormProvider>
      )}
      <Table
        apiRef={apiRef}
        isLoading={isLoading}
        rows={filteredRuns}
        columns={columns}
        showQuickFilter={false}
        checkboxSelection
        rowSelectionModel={selectionModel}
        onRowSelectionModelChange={setSelectionModel}
        rowAutoHeight={true}
      />
    </>
  );
};
