import { useTranslation } from "react-i18next";
import { Box, Chip, Tooltip } from "@mui/material";
import { CircleX } from "lucide-react";
import { useWorkgroups } from "../../../../api/workgroup.ts";
import { CodelistLabelStyle, useCodelistLabel, useCodelists } from "../../../../components/codelist.ts";
import { useBoreholeUrlParams } from "../../useBoreholeUrlParams.ts";
import { buildFilterChipDescriptors } from "./filterChipDescriptors.ts";

const FilterChips = () => {
  const { t } = useTranslation();
  const { setFilterField, clearFilterField, activeFilters } = useBoreholeUrlParams();
  const { data: codelists } = useCodelists();
  const getCodelistLabel = useCodelistLabel(CodelistLabelStyle.TextOnly);
  const { data: workgroups } = useWorkgroups();

  const descriptors = buildFilterChipDescriptors({
    activeFilters,
    codelists: codelists ?? [],
    getCodelistLabel,
    workgroups: workgroups ?? [],
    t,
    setField: setFilterField,
    clearField: clearFilterField,
  });

  const hasAnyChip = descriptors.length > 0;

  return (
    <Box sx={{ marginBottom: hasAnyChip ? "14px" : undefined }}>
      {descriptors.map(descriptor => {
        const Icon = descriptor.icon;
        const chip = (
          <Chip
            key={descriptor.id}
            sx={{ marginRight: "10px", marginBottom: "10px" }}
            data-cy={descriptor.testId}
            color="primary"
            label={Icon ? <Icon style={{ marginTop: "5px", width: "14px", height: "14px" }} /> : descriptor.label}
            aria-label={Icon ? descriptor.label : undefined}
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
    </Box>
  );
};

export default FilterChips;
