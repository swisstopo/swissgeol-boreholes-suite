import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { Box, Chip, Tooltip } from "@mui/material";
import { CircleX } from "lucide-react";
import PolygonIcon from "../../../../assets/icons/polygon.svg?react";
import { FilterContext } from "./filterContext.tsx";
import { Filter } from "./FilterInterface.ts";

interface FilterChipsProps {
  activeFilters: Filter[];
  setFilter: (key: string, value: string | boolean | number | null) => void;
}

const FilterChips = ({ activeFilters, setFilter }: FilterChipsProps) => {
  const { t } = useTranslation();
  const { filterPolygon, setFilterPolygon, setFeatureIds, setPolygonSelectionEnabled } = useContext(FilterContext);

  const boolFilterKeys = ["national_interest", "groundwater", "striae"];

  const onRemoveFilter = (filter: Filter) => {
    if (boolFilterKeys.includes(filter.key)) {
      setFilter(filter.key, -1);
    } else if (typeof filter.value === "number") {
      setFilter(filter.key, null);
    } else {
      setFilter(filter.key, "");
    }
    activeFilters = activeFilters.filter(f => f !== filter);
  };

  return (
    <Box sx={{ marginBottom: activeFilters.length > 0 ? "14px" : undefined }}>
      {activeFilters.map((filter, index) => {
        const customFilterLabels: { [key: string]: string } = {
          role: "status",
          status: "boreholeStatus",
          description_quality: "completeness",
          layer_gradation: "gradation",
          layer_depth_from_from: "fromdepth_from",
          layer_depth_from_to: "fromdepth_to",
          layer_depth_to_to: "todepth_to",
          layer_depth_to_from: "todepth_from",
        };

        const filterLabel = t(customFilterLabels[filter.key] || filter.key);

        return (
          <Tooltip key={index} title={filterLabel.length > 15 && filterLabel}>
            <Chip
              sx={{ marginRight: "10px", marginBottom: "10px" }}
              data-cy="filter-chip"
              color="secondary"
              label={filterLabel.length < 15 ? filterLabel : filterLabel.substring(0, 15) + "..."}
              onDelete={() => onRemoveFilter(filter)}
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
