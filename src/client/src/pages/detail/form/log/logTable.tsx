import { Dispatch, FC, SetStateAction, useContext, useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Typography } from "@mui/material";
import { Stack } from "@mui/system";
import { GridColDef, GridEventListener, GridRowSelectionModel, useGridApiRef } from "@mui/x-data-grid";
import Filter2Icon from "../../../../assets/icons/filter2.svg?react";
import { getSectionsByBoreholeId } from "../../../../api/fetchApiV2.ts";
import { DeleteButton, ToggleButton } from "../../../../components/buttons/buttons.tsx";
import { CodelistLabelStyle, useCodelists } from "../../../../components/codelist.ts";
import { FormContainer, FormDomainMultiSelect, FormMultiSelect } from "../../../../components/form/form.ts";
import { FormMultiSelectValue } from "../../../../components/form/formMultiSelect.tsx";
import { FormSelectValue } from "../../../../components/form/formSelect.tsx";
import { formatNumberForDisplay } from "../../../../components/form/formUtils.ts";
import { Table } from "../../../../components/table/table.tsx";
import { EditStateContext } from "../../editStateContext.tsx";
import { SaveContext } from "../../saveContext.tsx";
import { LogRun, LogRunChangeTracker } from "./log.ts";
import { getServiceOrToolArray } from "./logUtils.ts";

interface SectionFilter {
  id: number;
  label: string;
  fromDepth: number;
  toDepth: number;
}

interface LogRunFilter {
  runNumbers: number[];
  sections: number[];
  toolTypes: number[];
}

interface LogTableProps {
  boreholeId: string;
  runs: LogRun[];
  isLoading: boolean;
  setSelectedLogRunId: Dispatch<SetStateAction<string | undefined>>;
  setTmpLogRuns: Dispatch<SetStateAction<LogRunChangeTracker[]>>;
}

export const LogTable: FC<LogTableProps> = ({ boreholeId, runs, isLoading, setSelectedLogRunId, setTmpLogRuns }) => {
  const { editingEnabled } = useContext(EditStateContext);
  const { t, i18n } = useTranslation();
  const apiRef = useGridApiRef();
  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>([]);
  const [filterVisible, setFilterVisible] = useState(false);
  const [sectionFilters, setSectionFilters] = useState<SectionFilter[]>();

  const { markAsChanged } = useContext(SaveContext);
  const { data: codelists } = useCodelists();

  const formMethods = useForm<LogRunFilter>({ mode: "onChange" });
  const runFilter = formMethods.watch("runNumbers");
  const sectionFilter = formMethods.watch("sections");
  const toolTypeFilter = formMethods.watch("toolTypes");

  const hasActiveFilter = useMemo(
    () => runFilter?.length > 0 || sectionFilter?.length > 0 || toolTypeFilter?.length > 0,
    [runFilter, sectionFilter, toolTypeFilter],
  );

  const runNumbers = useMemo<FormMultiSelectValue[]>(
    () =>
      runs
        .filter(run => run.runNumber !== undefined)
        .map(run => ({ key: run.id, name: run.runNumber! }) as FormMultiSelectValue),
    [runs],
  );
  const filteredRuns = useMemo<LogRun[]>(() => {
    let filtered = runs;
    if (runFilter && runFilter.length > 0) {
      filtered = filtered.filter(run => runFilter.includes(run.id));
    }
    if (sectionFilter && sectionFilters) {
      const sections: SectionFilter[] = [];
      for (const id of sectionFilter) {
        const section = sectionFilters.find(s => s.id === id);
        if (section) sections.push(section);
      }
      if (sections.length > 0) {
        const hasOverlapWithSections = (run: LogRun) => {
          for (const section of sections) {
            if (
              run.fromDepth !== undefined &&
              run.toDepth !== undefined &&
              run.fromDepth <= section.toDepth &&
              run.toDepth >= section.fromDepth
            ) {
              return true;
            }
          }
          return false;
        };
        filtered = filtered.filter(hasOverlapWithSections);
      }
    }
    if (toolTypeFilter && toolTypeFilter.length > 0) {
      const hasMatchingToolType = (run: LogRun) => {
        if (!run.logFiles) return false;
        for (const file of run.logFiles) {
          if (!file.toolTypeCodelistIds) continue;
          for (const id of file.toolTypeCodelistIds) {
            if (toolTypeFilter.includes(id)) {
              return true;
            }
          }
        }
        return false;
      };
      filtered = filtered.filter(hasMatchingToolType);
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

  useEffect(() => {
    if (!filterVisible) {
      formMethods.reset({
        runNumbers: [],
        sections: [],
        toolTypes: [],
      });
    }
  }, [filterVisible, formMethods]);

  const handleRowClick: GridEventListener<"rowClick"> = params => {
    setSelectedLogRunId(params.row.tmpId);
  };

  const deleteLogRun = (selectedRows: GridRowSelectionModel) => {
    setTmpLogRuns(prev => prev.filter(run => run.item.tmpId !== undefined && !selectedRows.includes(run.item.tmpId)));
    markAsChanged(true);
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
        field: "boreholeStatusId",
        valueGetter: (value: number) => {
          const boreholeStatusCode = codelists?.find(d => d.id === value);
          return boreholeStatusCode?.[i18n.language] ?? boreholeStatusCode?.["en"] ?? "";
        },
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

  const selection = true;
  return (
    <Stack height={"100%"}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Stack direction="row" alignItems="center" gap={1}>
          <Typography data-cy="log-run-count">
            {selectionModel.length > 0
              ? t("selectedCount", { count: selectionModel.length })
              : t("runCount", { count: filteredRuns.length })}
          </Typography>
          {selection && (
            <>
              {editingEnabled && (
                <DeleteButton disabled={selectionModel.length === 0} onClick={() => deleteLogRun(selectionModel)} />
              )}
              {/* TODO: Hide until logic is implemented with https://github.com/swisstopo/swissgeol-boreholes-suite/issues/2361*/}
              {/*<ExportButton label={"exportData"} disabled={selectionModel.length === 0} onClick={() => exportData()} />*/}
              {/*<ExportButton*/}
              {/*  label={"exportTable"}*/}
              {/*  disabled={selectionModel.length === 0}*/}
              {/*  onClick={() => exportTable()}*/}
              {/*/>*/}
            </>
          )}
        </Stack>
        <Stack direction="row" alignItems="center" gap={1}>
          <ToggleButton label={"filter"} icon={<Filter2Icon />} active={filterVisible} onToggle={setFilterVisible} />
        </Stack>
      </Stack>
      {filterVisible && (
        <FormProvider {...formMethods}>
          <FormContainer direction={"row"} mb={2} justifyContent={"space-between"} data-cy={"filter-form"}>
            <FormMultiSelect fieldName={"runNumbers"} label={"runNumber"} values={runNumbers} readonly={false} />
            <FormMultiSelect
              fieldName={"sections"}
              label={"sectionName"}
              values={sectionFilters?.map(filter => ({ key: filter.id, name: filter.label }) as FormSelectValue) ?? []}
              readonly={false}
            />
            <FormDomainMultiSelect
              schemaName={"log_tool_type"}
              fieldName={"toolTypes"}
              label={"serviceOrTool"}
              labelStyle={CodelistLabelStyle.TextAndCodeChipsCodeOnly}
              readonly={false}
            />
          </FormContainer>
        </FormProvider>
      )}
      <Table
        apiRef={apiRef}
        isLoading={isLoading}
        rows={filteredRuns}
        getRowId={row => row.tmpId!}
        columns={columns}
        showQuickFilter={false}
        onRowClick={handleRowClick}
        checkboxSelection
        rowSelectionModel={selectionModel}
        onRowSelectionModelChange={setSelectionModel}
        rowAutoHeight={true}
        noRowsLabel={hasActiveFilter ? "noFilterResult" : "noLogRun"}
      />
    </Stack>
  );
};
