import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { Box, Chip, Tooltip } from "@mui/material";
import { CircleX } from "lucide-react";
import PolygonIcon from "../../../../assets/icons/polygon.svg?react";
import { filterParsers, useBoreholeUrlParams } from "../../useBoreholeUrlParams.ts";
import { FilterChipsProps } from "./filterData/filterInterfaces.ts";
import { PolygonFilterContext } from "./polygonFilterContext.tsx";

const FilterChips = ({ formMethods }: FilterChipsProps) => {
  const { t } = useTranslation();
  const { filterPolygon, setFilterPolygon, setFeatureIds, setPolygonSelectionEnabled } =
    useContext(PolygonFilterContext);
  const { setFilterField, filterParams, setTableParams } = useBoreholeUrlParams();

  const activeFilters = Object.entries(filterParams).filter(([, value]) => value !== null);
  if (!activeFilters) return;

  const onRemoveFilter = (filterKey: string) => {
    formMethods.resetField(filterKey);
    setFilterField(filterKey as keyof typeof filterParsers, null);
    setTableParams({ page: 0 });
  };

  return (
    <Box sx={{ marginBottom: activeFilters?.length > 0 ? "14px" : undefined }}>
      {activeFilters?.map((filter, index) => {
        const filterKey = filter[0];
        const filterLabel = t(filterKey);
        return (
          <Tooltip key={index} title={filterLabel.length > 15 && filterLabel}>
            <Chip
              sx={{ marginRight: "10px", marginBottom: "10px" }}
              data-cy={`filter-chip-${filterKey}`}
              color="secondary"
              label={filterLabel.length < 15 ? filterLabel : filterLabel.substring(0, 15) + "..."}
              onDelete={() => onRemoveFilter(filterKey)}
              deleteIcon={<CircleX style={{ width: "16px", height: "16px" }} />}
            />
          </Tooltip>
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
