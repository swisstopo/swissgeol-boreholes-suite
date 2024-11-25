import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { Accordion, AccordionDetails, AccordionSummary, Badge, Box, Button, Stack, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { ChevronDown } from "lucide-react";
import Polygon from "../../../../assets/icons/polygon.svg?react";
import { ReduxRootState, Setting, User } from "../../../../api-lib/ReduxStateInterfaces.ts";
import { theme } from "../../../../AppTheme.ts";
import { SideDrawerHeader } from "../../layout/sideDrawerHeader.tsx";
import FilterChips from "./FilterChips.tsx";
import { FilterContext } from "./filterContext.tsx";
import { boreholeSearchData } from "./filterData/boreholeSearchData.js";
import { chronostratigraphySearchData } from "./filterData/chronostratigraphySearchData.js";
import { lithologySearchData } from "./filterData/lithologySearchData.ts";
import { lithostratigraphySearchData } from "./filterData/lithostratigraphySearchData.js";
import { LocationSearchData } from "./filterData/LocationSearchData.js";
import { registrationSearchData } from "./filterData/registrationSearchData.js";
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
  const settings: Setting = useSelector((state: ReduxRootState) => state.setting);
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
  const resetRestriction = () => {
    dispatch({
      type: "SEARCH_EDITOR_FILTER_RESET_RESTRICTION",
    });
  };
  const resetElevation = () => {
    dispatch({
      type: "SEARCH_EDITOR_FILTER_RESET_ELEVATION",
    });
  };
  const resetTotBedrock = () => {
    dispatch({
      type: "SEARCH_EDITOR_FILTER_RESET_TOP_BEDROCK",
    });
  };
  const resetDrilling = () => {
    dispatch({
      type: "SEARCH_EDITOR_FILTER_RESET_DRILLING",
    });
  };
  const resetDrillDiameter = () => {
    dispatch({
      type: "SEARCH_EDITOR_FILTER_RESET_DRILL_DIAMETER",
    });
  };
  const resetBoreInc = () => {
    dispatch({
      type: "SEARCH_EDITOR_FILTER_RESET_BORE_INC",
    });
  };
  const resetBoreIncDir = () => {
    dispatch({
      type: "SEARCH_EDITOR_FILTER_RESET_BORE_INC_DIR",
    });
  };
  const resetDepth = () => {
    dispatch({
      type: "SEARCH_EDITOR_FILTER_RESET_DEPTH",
    });
  };
  const resetCreatedDate = () => {
    dispatch({
      type: "SEARCH_EDITOR_FILTER_RESET_CREATED_DATE",
    });
  };

  const [activeFilters, setActiveFilters] = useState<Filter[]>([]);
  const [searchList, setSearchList] = useState([
    {
      id: 0,
      name: "workgroup",
      translationId: "workgroup",
      isSelected: false,
      searchData: [{ value: "workgroup", hideShowAllFields: true }],
    },
    {
      id: 1,
      name: "status",
      translationId: "status",
      isSelected: false,
      searchData: [{ value: "role", hideShowAllFields: true }],
    },
    {
      id: 2,
      name: "location",
      translationId: "location",
      isSelected: false,
      searchData: LocationSearchData,
    },
    {
      id: 3,
      name: "borehole",
      translationId: "borehole",
      isSelected: false,
      searchData: boreholeSearchData,
    },
    {
      id: 4,
      name: "lithology",
      translationId: "lithology",
      isSelected: false,
      searchData: lithologySearchData,
    },
    {
      id: 5,
      name: "chronostratigraphy",
      translationId: "chronostratigraphy",
      isSelected: false,
      searchData: chronostratigraphySearchData,
    },
    {
      id: 6,
      name: "lithostratigraphy",
      translationId: "lithostratigraphy",
      isSelected: false,
      searchData: lithostratigraphySearchData,
    },
    {
      id: 7,
      name: "registration",
      translationId: "registration",
      isSelected: false,
      searchData: registrationSearchData,
    },
  ]);

  // on mount
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

  const handleButtonSelected = () => {
    return searchList.find(s => s.isSelected)?.searchData;
  };

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
        {searchList?.map((filter, idx) => {
          const currentSearchList = searchList.find(l => l.name === filter.name);
          const activeFilterLength = activeFilters.filter(f =>
            currentSearchList?.searchData.some(d => d.value === f.key),
          ).length;
          return (
            <StyledAccordion key={idx} expanded={filter?.isSelected}>
              <AccordionSummary
                expandIcon={<ChevronDown />}
                onClick={() => {
                  setSearchList(
                    searchList.map(obj => ({ ...obj, isSelected: obj.id === idx ? !obj.isSelected : false })),
                  );
                }}>
                <Typography variant="h6">{t(filter?.translationId)} </Typography>
                <Badge badgeContent={activeFilterLength} sx={{ marginLeft: "18px", marginTop: "10px" }} />
              </AccordionSummary>
              {filter?.name === "workgroup" && filter?.isSelected && (
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
              {filter?.name === "status" && filter?.isSelected && (
                <StyledAccordionDetails>
                  <StatusFilter search={search} setFilter={setFilter} />
                </StyledAccordionDetails>
              )}
              <StyledAccordionDetails>
                {handleButtonSelected() !== null && filter?.isSelected && (
                  <ListFilter
                    attribute={handleButtonSelected()}
                    resetBoreInc={resetBoreInc}
                    resetBoreIncDir={resetBoreIncDir}
                    resetDepth={resetDepth}
                    resetDrillDiameter={resetDrillDiameter}
                    resetDrilling={resetDrilling}
                    resetElevation={resetElevation}
                    resetRestriction={resetRestriction}
                    resetTotBedrock={resetTotBedrock}
                    search={search}
                    setFilter={setFilter}
                    settings={settings.data.efilter}
                    resetCreatedDate={resetCreatedDate}
                  />
                )}
              </StyledAccordionDetails>
            </StyledAccordion>
          );
        })}
      </Box>
      <FilterReset reset={handleFilterReset} />
    </Stack>
  );
};
