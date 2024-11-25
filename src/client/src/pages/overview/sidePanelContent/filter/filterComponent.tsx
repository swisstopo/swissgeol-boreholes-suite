import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { Accordion, AccordionDetails, AccordionSummary, Badge, Box, Button, Stack, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { ChevronDown } from "lucide-react";
import Polygon from "../../../../assets/icons/polygon.svg?react";
import { ReduxRootState, User } from "../../../../api-lib/ReduxStateInterfaces.ts";
import { theme } from "../../../../AppTheme.ts";
import { SideDrawerHeader } from "../../layout/sideDrawerHeader.tsx";
import FilterChips from "./FilterChips.tsx";
import { FilterContext } from "./filterContext.tsx";
import { FilterAccordionValue, filterAccordionValues } from "./filterData/filterAccordionValues.ts";
import { Filter } from "./FilterInterface.ts";
import { FilterReset } from "./filterReset.tsx";
import ListFilter from "./listFilter";
import { StatusFilter } from "./statusFilter.js";
import WorkgroupRadioGroup from "./workgroupRadioGroup.jsx";

export const FilterComponent = ({ toggleDrawer }: { toggleDrawer: (open: boolean) => void }) => {
  const {
    setActiveFilterLength,
    filterPolygon,
    polygonSelectionEnabled,
    setFilterPolygon,
    setFeatureIds,
    setPolygonSelectionEnabled,
  } = useContext(FilterContext);
  const { t } = useTranslation();
  const user: User = useSelector((state: ReduxRootState) => state.core_user);
  const search: { filter: Filter } = useSelector((state: ReduxRootState) => state.filters);
  const dispatch = useDispatch();

  const reset = () => {
    dispatch({
      type: "SEARCH_EDITOR_FILTER_RESET",
    });
  };

  const setFilter = (key: string, value: string | number | boolean | null) => {
    dispatch({
      type: "SEARCH_EDITOR_FILTER_CHANGED",
      key: key,
      value: value,
    });
  };

  const [activeFilters, setActiveFilters] = useState<Filter[]>([]);
  const [showAllForAccordion, setShowAllForAccordion] = useState<{ id: number; showAll: boolean }[]>(
    filterAccordionValues.map(f => {
      return { id: f.id, showAll: false };
    }),
  );
  const [expandedFilterAccordion, setExpandedFilterAccordion] = useState<FilterAccordionValue | null>(null);

  useEffect(() => {
    const af = Object.entries(search.filter)
      .filter(
        ([key, value]) =>
          value != null && value !== "" && value !== -1 && !["refresh"].includes(key) && value !== "all",
      )
      .map(([key, value]) => ({ key: key, value: value }));
    setActiveFilterLength(af.length);
    setActiveFilters(af);
  }, [search, setActiveFilterLength, setActiveFilters]);

  const handlePolygonFilterClick = () => {
    setPolygonSelectionEnabled(!polygonSelectionEnabled);
  };

  const handleFilterReset = () => {
    setPolygonSelectionEnabled(false);
    setFilterPolygon(null);
    setFeatureIds([]);
    reset();
  };

  const StyledAccordion = styled(Accordion)(() => ({
    marginBottom: "6px",
    borderRadius: "4px",
    boxShadow: "none !important",
    border: "none",
    padding: "12px, 16px, 12px, 16px",
    "&.MuiAccordion-root:before": {
      backgroundColor: theme.palette.background.default,
    },
  }));

  const StyledAccordionDetails = styled(AccordionDetails)(() => ({
    overflow: "visible",
    flexGrow: 1,
  }));

  return (
    <Stack direction="column" sx={{ height: "100%" }}>
      <SideDrawerHeader title={t("searchfilters")} toggleDrawer={toggleDrawer} />
      <FilterChips activeFilters={activeFilters} setFilter={setFilter} />
      <Box sx={{ flexGrow: 1, overflow: "auto", scrollbarGutter: "stable" }}>
        <Button
          onClick={() => {
            handlePolygonFilterClick();
          }}
          variant="text"
          data-cy="polygon-filter-button"
          sx={{
            backgroundColor:
              polygonSelectionEnabled && !filterPolygon
                ? theme.palette.background.filterItemActive
                : theme.palette.background.default,
            color:
              polygonSelectionEnabled && !filterPolygon
                ? theme.palette.primary.contrastText
                : theme.palette.primary.main,
            width: "100%",
            marginLeft: 0,
            height: "48px",
            marginBottom: "24px",
            display: "flex",
            justifyContent: "flex-start",
            padding: 0,
          }}>
          <Polygon
            style={{
              marginLeft: "18px",
              marginRight: "14px",
            }}
          />
          <Typography
            variant="h6"
            sx={{
              color:
                polygonSelectionEnabled && !filterPolygon
                  ? theme.palette.primary.contrastText
                  : theme.palette.primary.main,
            }}>
            {t("polygon_selection")}
          </Typography>
          {filterPolygon !== null && (
            <Badge data-cy="polygon-filter-badge" badgeContent={1} sx={{ marginLeft: "18px" }} />
          )}
        </Button>

        {filterAccordionValues.map(filterAccordionValue => {
          const activeFilterLength = activeFilters.filter(f =>
            filterAccordionValue?.searchData.some(d => d.value === f.key),
          ).length;
          const isAccordionExpanded = filterAccordionValue.id === expandedFilterAccordion?.id;
          return (
            <>
              <StyledAccordion key={filterAccordionValue.id} expanded={isAccordionExpanded}>
                <AccordionSummary
                  expandIcon={<ChevronDown />}
                  onClick={() => {
                    if (isAccordionExpanded) {
                      setExpandedFilterAccordion(null);
                    } else {
                      setExpandedFilterAccordion(filterAccordionValue);
                    }
                  }}>
                  <Typography variant="h6">{t(filterAccordionValue?.translationId)} </Typography>
                  <Badge badgeContent={activeFilterLength} sx={{ marginLeft: "18px", marginTop: "10px" }} />
                </AccordionSummary>
                {filterAccordionValue?.name === "workgroup" && isAccordionExpanded && (
                  <StyledAccordionDetails>
                    <WorkgroupRadioGroup
                      filter={search.filter.workgroup}
                      onChange={(workgroup: string) => {
                        setFilter("workgroup", workgroup);
                      }}
                      workgroups={user.data.workgroups}
                    />
                  </StyledAccordionDetails>
                )}
                {filterAccordionValue?.name === "status" && isAccordionExpanded && (
                  <StyledAccordionDetails>
                    <StatusFilter search={search} setFilter={setFilter} />
                  </StyledAccordionDetails>
                )}
                <StyledAccordionDetails>
                  <ListFilter
                    attributeId={expandedFilterAccordion?.id}
                    showAllForAccordion={showAllForAccordion}
                    setShowAllForAccordion={setShowAllForAccordion}
                  />
                </StyledAccordionDetails>
              </StyledAccordion>
            </>
          );
        })}
      </Box>
      <FilterReset reset={handleFilterReset} />
    </Stack>
  );
};
