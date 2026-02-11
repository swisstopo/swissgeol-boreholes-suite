import { FC, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { Accordion, AccordionDetails, AccordionSummary, Badge, Box, Button, Stack, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { ChevronDown } from "lucide-react";
import Polygon from "../../../../assets/icons/polygon.svg?react";
import { Filters, ReduxRootState } from "../../../../api-lib/ReduxStateInterfaces.ts";
import { theme } from "../../../../AppTheme.ts";
import { useAuth } from "../../../../auth/useBdmsAuth.tsx";
import { SideDrawerHeader } from "../../layout/sideDrawerHeader.tsx";
import FilterChips from "./FilterChips.tsx";
import { FilterContext } from "./filterContext.tsx";
import { boreholeSearchData } from "./filterData/boreholeSearchData.js";
import { Filter, FilterComponentProps, FilterInputConfig } from "./filterData/filterInterfaces.ts";
import { LocationSearchData } from "./filterData/LocationSearchData.js";
import { registrationSearchData } from "./filterData/registrationSearchData.js";
import { FilterReset } from "./filterReset.tsx";
import { ListFilter } from "./listFilter.tsx";
import { StatusFilter } from "./statusFilter.tsx";
import { WorkgroupFilter } from "./workgroupFilter.tsx";

export const FilterComponent: FC<FilterComponentProps> = ({ toggleDrawer, formMethods }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const {
    filterPolygon,
    polygonSelectionEnabled,
    setPolygonSelectionEnabled,
    setFeatureIds,
    setFilterPolygon,
    setActiveFilterLength,
  } = useContext(FilterContext);

  const filters = useSelector((state: ReduxRootState) => state.filters);
  const user = useSelector((state: ReduxRootState) => state.core_user);
  const settings = useSelector((state: ReduxRootState) => state.setting);
  const auth = useAuth();

  const [activeFilters, setActiveFilters] = useState<Filter[]>();
  const [searchList, setSearchList] = useState<FilterInputConfig[]>([
    {
      id: 0,
      name: "workgroup",
      translationId: "workgroup",
      isSelected: false,
      searchData: [{ value: "workgroup", hideShowAllFields: true }],
      isHidden: auth.anonymousModeEnabled,
    },
    {
      id: 1,
      name: "status",
      translationId: "status",
      isSelected: false,
      searchData: [{ value: "workflow", hideShowAllFields: true }],
      isHidden: auth.anonymousModeEnabled,
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
      id: 7,
      name: "registration",
      translationId: "registration",
      isSelected: false,
      searchData: registrationSearchData,
      isHidden: auth.anonymousModeEnabled,
    },
  ]);

  useEffect(() => {
    const getActiveFilters = (filters: Filters) => {
      const af = Object.entries(filters.filter)
        .filter(
          ([key, value]) =>
            (value != null && value !== "" && value !== -1 && !["refresh"].includes(key) && value !== "all") ||
            (["national_interest", "groundwater", "striae"].includes(key) && value === null),
        )
        .map(([key, value]): { key: string; value: number | boolean | string | null } => ({
          key: key,
          value: value as number | boolean | string | null,
        }));
      setActiveFilterLength(af.length);
      setActiveFilters(af);
    };
    getActiveFilters(filters);
  }, [filters, setActiveFilterLength]);

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

  const handlePolygonFilterClick = () => {
    setPolygonSelectionEnabled(!polygonSelectionEnabled);
  };
  const handleFilterReset = () => {
    setPolygonSelectionEnabled(false);
    setFilterPolygon(null);
    setFeatureIds([]);
    formMethods.reset();
    dispatch({ type: "SEARCH_EDITOR_FILTER_RESET" });
  };

  const setFilter = (key: string, value: string | number | boolean | null) =>
    dispatch({ type: "SEARCH_EDITOR_FILTER_CHANGED", key, value });

  return (
    <Stack direction="column" sx={{ height: "100%" }}>
      <SideDrawerHeader title={t("searchfilters")} toggleDrawer={toggleDrawer} />
      <FilterChips
        activeFilters={activeFilters}
        setFilter={setFilter}
        setActiveFilters={setActiveFilters}
        formMethods={formMethods}
      />
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
        {searchList?.map(filter => {
          const currentFilterInputConfig = searchList.find(l => l.name === filter.name);
          const activeFilterLength = activeFilters?.filter(f =>
            currentFilterInputConfig?.searchData.some(d => d.value === f.key),
          )?.length;
          return filter.isHidden ? null : (
            <StyledAccordion key={filter.id} expanded={filter?.isSelected}>
              <AccordionSummary
                expandIcon={<ChevronDown />}
                onClick={() => {
                  setSearchList(previousSearchlist =>
                    previousSearchlist.map(obj =>
                      obj.id === filter.id ? { ...obj, isSelected: !obj.isSelected } : { ...obj, isSelected: false },
                    ),
                  );
                }}>
                <Typography variant="h6">{t(filter?.translationId)} </Typography>
                <Badge badgeContent={activeFilterLength} sx={{ marginLeft: "18px", marginTop: "10px" }} />
              </AccordionSummary>
              {filter?.name === "workgroup" && filter?.isSelected && (
                <StyledAccordionDetails>
                  <WorkgroupFilter
                    onChange={workgroup => {
                      setFilter("workgroup", workgroup);
                    }}
                    workgroups={user.data.workgroups}
                    selectedWorkgroup={filters.filter.workgroup as string}
                  />
                </StyledAccordionDetails>
              )}
              {filter?.name === "status" && filter?.isSelected && (
                <StyledAccordionDetails>
                  <StatusFilter selectedRole={filters.filter.workflow as string} setFilter={setFilter} />
                </StyledAccordionDetails>
              )}
              <StyledAccordionDetails>
                {!!currentFilterInputConfig && filter?.isSelected && (
                  <ListFilter
                    inputConfig={currentFilterInputConfig}
                    filters={filters}
                    setFilter={setFilter}
                    settings={settings.data.efilter}
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
