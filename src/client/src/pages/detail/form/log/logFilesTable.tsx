import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Typography } from "@mui/material";
import { Stack } from "@mui/system";
import { GridColDef, GridRowId, GridRowSelectionModel, useGridApiRef } from "@mui/x-data-grid";
import Filter2Icon from "../../../../assets/icons/filter2.svg?react";
import { ToggleButton } from "../../../../components/buttons/buttons.tsx";
import { CodelistLabelStyle, useCodelists } from "../../../../components/codelist.ts";
import { FormBooleanSelect } from "../../../../components/form/formBooleanSelect.tsx";
import { FormContainer } from "../../../../components/form/formContainer.tsx";
import { FormDomainMultiSelect } from "../../../../components/form/formDomainMultiSelect.tsx";
import { FormMultiSelect, FormMultiSelectValue } from "../../../../components/form/formMultiSelect.tsx";
import { Table } from "../../../../components/table/table.tsx";
import { usePublicColumn } from "../../../../components/table/usePublicColumn.tsx";
import { LogFile } from "./log.ts";

interface LogFileFilter {
  toolTypes: number[];
  extensions: number[];
  passTypes: number[];
  dataPackages: number[];
  public: number | null;
}

interface LogFileTableProps {
  files: LogFile[];
}

export const LogFileTable: FC<LogFileTableProps> = ({ files }) => {
  const { t, i18n } = useTranslation();
  const apiRef = useGridApiRef();
  const [updatedRows, setUpdatedRows] = useState<Map<GridRowId, LogFile>>(new Map());
  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>([]);
  const [filterVisible, setFilterVisible] = useState(false);
  const [extensionsFilters, setExtensionsFilters] = useState<FormMultiSelectValue[]>();
  const { data: codelists } = useCodelists();

  const formMethods = useForm<LogFileFilter>({ mode: "onChange" });
  const toolTypeFilter = formMethods.watch("toolTypes");
  const extensionsFilter = formMethods.watch("extensions");
  const passTypesFilter = formMethods.watch("passTypes");
  const dataPackagesFilter = formMethods.watch("dataPackages");
  const publicFilter = formMethods.watch("public");

  const hasActiveFilter = useMemo(
    () =>
      toolTypeFilter?.length > 0 ||
      extensionsFilter?.length > 0 ||
      passTypesFilter?.length > 0 ||
      dataPackagesFilter?.length > 0 ||
      publicFilter !== null,
    [
      dataPackagesFilter?.length,
      extensionsFilter?.length,
      passTypesFilter?.length,
      publicFilter,
      toolTypeFilter?.length,
    ],
  );

  const filteredFiles = useMemo<LogFile[]>(() => {
    let filtered = files;
    if (toolTypeFilter && toolTypeFilter.length > 0) {
      filtered = filtered.filter(file =>
        toolTypeFilter.some(filterValue => file.toolTypeCodelistIds.includes(filterValue)),
      );
    }
    if (extensionsFilters && extensionsFilter && extensionsFilter.length > 0) {
      const extensionNames = new Set(
        extensionsFilter
          .map(filterValue => extensionsFilters.find(ext => ext.key === filterValue)?.name?.toLowerCase())
          .filter(Boolean),
      );
      filtered = filtered.filter(file => extensionNames.has(file.fileType.toLowerCase()));
    }
    if (passTypesFilter && passTypesFilter.length > 0) {
      filtered = filtered.filter(file => file.passTypeId && passTypesFilter.includes(file.passTypeId));
    }
    if (dataPackagesFilter && dataPackagesFilter.length > 0) {
      filtered = filtered.filter(file => file.dataPackageId && dataPackagesFilter.includes(file.dataPackageId));
    }
    if (publicFilter !== null) {
      filtered = filtered.filter(file => file.public === (publicFilter === 1));
    }
    return filtered;
  }, [dataPackagesFilter, extensionsFilter, extensionsFilters, files, passTypesFilter, publicFilter, toolTypeFilter]);

  useEffect(() => {
    if (!extensionsFilters) {
      const extensions = Array.from(new Set(files.map(file => file.fileType.toLowerCase()))).sort((a, b) =>
        a.localeCompare(b),
      );
      setExtensionsFilters(extensions.map((ext, index) => ({ key: index, name: ext })));
    }
  }, [extensionsFilters, files]);

  useEffect(() => {
    if (!filterVisible) {
      formMethods.reset({
        toolTypes: [],
        extensions: [],
        passTypes: [],
        dataPackages: [],
        public: null,
      });
    }
  }, [filterVisible, formMethods]);

  const { getPublicColumnHeader, getPublicColumnCell } = usePublicColumn({
    apiRef,
    updatedRows,
    setUpdatedRows,
    rows: files,
  });

  const getCodelistCode = useCallback(
    (id: number) => {
      const codelistEntry = codelists.find(code => code.id === id);
      if (!codelistEntry) return "";
      return codelistEntry.code;
    },
    [codelists],
  );

  const getCodelistValue = useCallback(
    (id: number) => {
      const code = codelists.find(code => code.id === id);
      return code?.[i18n.language] ?? code?.["en"] ?? "";
    },
    [codelists, i18n.language],
  );

  const columns = useMemo<GridColDef<LogFile>[]>(
    () => [
      {
        field: "name",
        headerName: t("name"),
        flex: 1,
        valueGetter: (value, row) => row?.name ?? "-",
      },
      {
        field: "toolTypeCodelistIds",
        valueGetter: (values: number[] | undefined) => {
          if (!values || values.length === 0) return "";
          return values
            .map(getCodelistCode)
            .filter(code => code !== "")
            .join(", ");
        },
        headerName: t("toolType"),
        flex: 1,
      },
      {
        field: "fileType",
        headerName: t("extension"),
        flex: 1,
      },
      {
        field: "passTypeId",
        valueGetter: (value: number) => getCodelistValue(value),
        headerName: t("passType"),
        flex: 1,
      },
      {
        field: "pass",
        headerName: t("pass"),
        flex: 1,
      },
      {
        field: "dataPackageId",
        valueGetter: (value: number) => getCodelistValue(value),
        headerName: t("dataPackage"),
        flex: 1,
      },
      {
        field: "depthTypeId",
        valueGetter: (value: number) => getCodelistValue(value),
        headerName: t("depthType"),
        flex: 1,
      },
      {
        field: "deliveryDate",
        valueGetter: (value: string) => (value && new Date(value).toLocaleDateString()) ?? "",
        headerName: t("deliveryDate"),
        flex: 1,
      },
      {
        field: "public",
        headerName: t("public"),
        type: "boolean",
        resizable: false,
        width: 100,
        renderHeader: getPublicColumnHeader,
        renderCell: getPublicColumnCell,
      },
    ],
    [t, getPublicColumnHeader, getPublicColumnCell, getCodelistCode, getCodelistValue],
  );

  return (
    <Stack height={"100%"}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Stack direction="row" alignItems="center" gap={1}>
          <Typography data-cy="log-run-count">
            {selectionModel.length > 0
              ? t("selectedCount", { count: selectionModel.length })
              : `${filteredFiles.length} ${t("run", { count: filteredFiles.length })}`}
          </Typography>
        </Stack>
        <Stack direction="row" alignItems="center" gap={1}>
          <ToggleButton label={"filter"} icon={<Filter2Icon />} active={filterVisible} onToggle={setFilterVisible} />
        </Stack>
      </Stack>
      {filterVisible && (
        <FormProvider {...formMethods}>
          <FormContainer direction={"row"} mb={2} justifyContent={"space-between"} data-cy={"filter-form"}>
            <FormDomainMultiSelect
              schemaName={"log_tool_type"}
              fieldName={"toolTypes"}
              label={"toolType"}
              labelStyle={CodelistLabelStyle.TextAndCodeChipsCodeOnly}
              readonly={false}
            />
            <FormMultiSelect fieldName={"extensions"} label={"extension"} values={extensionsFilters} readonly={false} />
            <FormDomainMultiSelect
              schemaName={"log_pass_type"}
              fieldName={"passTypes"}
              label={"passType"}
              labelStyle={CodelistLabelStyle.TextOnly}
              readonly={false}
            />
            <FormDomainMultiSelect
              schemaName={"log_data_package"}
              fieldName={"dataPackages"}
              label={"dataPackage"}
              labelStyle={CodelistLabelStyle.TextOnly}
              readonly={false}
            />
            <FormBooleanSelect fieldName={"public"} label={"public"} readonly={false} allowUndefined={false} />
          </FormContainer>
        </FormProvider>
      )}
      <Table
        apiRef={apiRef}
        rows={filteredFiles}
        isLoading={false}
        columns={columns}
        showQuickFilter={false}
        checkboxSelection
        rowSelectionModel={selectionModel}
        onRowSelectionModelChange={setSelectionModel}
        rowAutoHeight={true}
        noRowsLabel={hasActiveFilter ? "noFilterResult" : "noLogFile"}
      />
    </Stack>
  );
};
