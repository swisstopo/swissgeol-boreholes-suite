import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { Box, Chip, Tooltip } from "@mui/material";
import { CircleX } from "lucide-react";
import PolygonIcon from "../../../../assets/icons/polygon.svg?react";
import { useWorkgroups } from "../../../../api/workgroup.ts";
import { CodelistLabelStyle, useCodelistLabel, useCodelists } from "../../../../components/codelist.ts";
import { FilterKey, useBoreholeUrlParams } from "../../useBoreholeUrlParams.ts";
import { buildFilterChipDescriptors } from "./filterChipDescriptors.ts";
import { PolygonFilterContext } from "./polygonFilterContext.tsx";

const FilterChips = () => {
  const { t } = useTranslation();
  const { filterPolygon, setFilterPolygon, setFeatureIds, setPolygonSelectionEnabled } =
    useContext(PolygonFilterContext);
  const { setFilterField, clearFilterField, filterParams, setTableParams } = useBoreholeUrlParams();
  const { data: codelists } = useCodelists();
  const getCodelistLabel = useCodelistLabel(CodelistLabelStyle.TextOnly);
  const { data: workgroups } = useWorkgroups();

  const setFieldAndResetPage = (key: FilterKey, value: Parameters<typeof setFilterField>[1]) => {
    setFilterField(key, value);
    setTableParams({ page: 0 });
  };
  const clearFieldAndResetPage = (key: FilterKey) => {
    clearFilterField(key);
    setTableParams({ page: 0 });
  };

  const descriptors = buildFilterChipDescriptors({
    filterParams,
    codelists: codelists ?? [],
    getCodelistLabel,
    workgroups: workgroups ?? [],
    t,
    setField: setFieldAndResetPage,
    clearField: clearFieldAndResetPage,
  });

  const hasAnyChip = descriptors.length > 0 || filterPolygon !== null;

  return (
    <Box sx={{ marginBottom: hasAnyChip ? "14px" : undefined }}>
      {descriptors.map(descriptor => {
        const chip = (
          <Chip
            key={descriptor.id}
            sx={{ marginRight: "10px", marginBottom: "10px" }}
            data-cy={descriptor.testId}
            color="primary"
            label={descriptor.label}
            onDelete={descriptor.onDelete}
            deleteIcon={<CircleX style={{ width: "16px", height: "16px" }} />}
          />
        );
        return descriptor.tooltip ? (
          <Tooltip key={descriptor.id} title={descriptor.tooltip}>
            <span>{chip}</span>
          </Tooltip>
        ) : (
          chip
        );
      })}
      {filterPolygon !== null && (
        <Chip
          sx={{ marginRight: "10px", marginBottom: "10px" }}
          data-cy="polygon-filter-chip"
          color="secondary"
          label={<PolygonIcon style={{ marginTop: "5px", width: "14px", height: "14px" }} />}
          onDelete={() => {
            setPolygonSelectionEnabled(false);
            setFilterPolygon(null);
            setFeatureIds([]);
          }}
          deleteIcon={<CircleX style={{ width: "16px", height: "16px" }} />}
        />
      )}
    </Box>
  );
};

export default FilterChips;
