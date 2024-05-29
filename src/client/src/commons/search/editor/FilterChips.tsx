import { Box, Chip } from "@mui/material";
import { Filter, FilterChipsProps } from "./FilterInterfaces";
import { useTranslation } from "react-i18next";
import DeleteIcon from "../../../../public/icons/delete.svg?react";
import PolygonIcon from "../../../../public/icons/polygon.svg?react";
import { useContext } from "react";
import { FilterContext } from "../../../components/filter/filterContext";

const FilterChips = ({ activeFilters, setFilter }: FilterChipsProps) => {
  const { t } = useTranslation();
  const { filterPolygon, setFilterPolygon, setFeatureIds, setPolygonSelectionEnabled } = useContext(FilterContext);

  const onRemoveFilter = (filter: Filter) => {
    if (typeof filter.value === "boolean") {
      setFilter(filter.key, -1);
    } else if (typeof filter.value === "number") {
      setFilter(filter.key, null);
    } else {
      setFilter(filter.key, "");
    }
    activeFilters = activeFilters.filter(f => f !== filter);
  };

  return (
    <Box sx={{ marginTop: "24px", marginBottom: "14px" }}>
      {activeFilters.map((filter, index) => {
        const filterLabel = t(filter.key);
        return (
          <Chip
            sx={{ marginRight: "10px", marginBottom: "10px" }}
            data-cy="filter-chip"
            color="secondary"
            key={index}
            label={filterLabel.length < 15 ? filterLabel : filterLabel.substring(0, 15) + "..."}
            onDelete={() => onRemoveFilter(filter)}
            deleteIcon={<DeleteIcon style={{ width: "16px", height: "16px" }} />}
          />
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
          deleteIcon={<DeleteIcon style={{ width: "16px", height: "16px" }} />}
        />
      )}
    </Box>
  );
};

export default FilterChips;
