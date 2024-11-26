import React from "react";
import { withTranslation } from "react-i18next";
import { connect } from "react-redux";
import { Accordion, AccordionDetails, AccordionSummary, Badge, Box, Button, Stack, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { ChevronDown } from "lucide-react";
import Polygon from "../../../../assets/icons/polygon.svg?react";
import _ from "lodash";
import PropTypes from "prop-types";
import { theme } from "../../../../AppTheme.ts";
import { SideDrawerHeader } from "../../layout/sideDrawerHeader.tsx";
import FilterChips from "./FilterChips.tsx";
import { FilterContext } from "./filterContext.tsx";
import { boreholeSearchData } from "./filterData/boreholeSearchData.js";
import { chronostratigraphySearchData } from "./filterData/chronostratigraphySearchData.js";
import { lithologySearchData } from "./filterData/lithologySearchData.js";
import { lithostratigraphySearchData } from "./filterData/lithostratigraphySearchData.js";
import { LocationSearchData } from "./filterData/LocationSearchData.js";
import { registrationSearchData } from "./filterData/registrationSearchData.js";
import { FilterReset } from "./filterReset.tsx";
import ListFilter from "./listFilter.jsx";
import StatusFilter from "./statusFilter.jsx";
import WorkgroupRadioGroup from "./workgroupRadioGroup.jsx";

class FilterComponent extends React.Component {
  static contextType = FilterContext;

  constructor(props) {
    super(props);
    this.handleFilterReset = this.handleFilterReset.bind(this);
    this.state = {
      accordionIdx: 0,
      isBoreholeSelectorOpen: false,
      isStratigraphySelectorOpen: false,
      activeFilters: [],
      searchList: [
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
      ],
    };
  }

  componentDidMount() {
    this.getActiveFilters(this.props.search);
  }

  componentDidUpdate(prevProps) {
    const { search, onChange } = this.props;
    {
      if (!_.isEqual(search.filter, prevProps.search.filter)) {
        this.getActiveFilters(search);

        if (onChange !== undefined) {
          onChange({ ...search.filter });
        }
      }
    }
  }

  getActiveFilters(search) {
    const activeFilters = Object.entries(search.filter)
      .filter(
        ([key, value]) =>
          (value != null && value !== "" && value !== -1 && !["refresh"].includes(key) && value !== "all") ||
          (["national_interest", "groundwater", "striae"].includes(key) && value === null),
      )
      .map(([key, value]) => ({ key: key, value: value }));
    this.context.setActiveFilterLength(activeFilters.length);
    this.setState({ activeFilters: activeFilters });
  }

  isVisible(filter) {
    const { search, settings } = this.props;
    if (search.advanced === true) {
      return true;
    }
    return _.get(settings.data.efilter, filter) === true;
  }

  handleButtonSelected() {
    return this.state.searchList.find(s => s.isSelected === true)?.searchData;
  }

  handlePolygonFilterClick() {
    this.context.setPolygonSelectionEnabled(!this.context.polygonSelectionEnabled);
  }

  handleFilterReset() {
    this.context.setPolygonSelectionEnabled(false);
    this.context.setFilterPolygon(null);
    this.context.setFeatureIds([]);
    this.props.reset();
  }

  StyledAccordion = styled(Accordion)(() => ({
    marginBottom: "6px",
    borderRadius: "4px",
    boxShadow: "none !important",
    border: "none",
    padding: "12px, 16px, 12px, 16px",
    "&.MuiAccordion-root:before": {
      backgroundColor: theme.palette.background.default,
    },
  }));

  StyledAccordionDetails = styled(AccordionDetails)(() => ({
    overflow: "visible",
    flexGrow: 1,
  }));

  render() {
    const {
      toggleDrawer,
      search,
      user,
      t,
      setFilter,
      settings,
      resetBoreInc,
      resetBoreIncDir,
      resetDrillDiameter,
      resetDrilling,
      resetElevation,
      resetRestriction,
      resetTotBedrock,
      resetDepth,
      onChange,
      resetCreatedDate,
    } = this.props;
    const { filterPolygon, polygonSelectionEnabled, setPolygonSelectionEnabled } = this.context;

    return (
      <Stack direction="column" sx={{ height: "100%" }}>
        <SideDrawerHeader title={t("searchfilters")} toggleDrawer={toggleDrawer} />
        <FilterChips
          setPolygonSelectionEnabled={setPolygonSelectionEnabled}
          activeFilters={this.state.activeFilters}
          setFilter={setFilter}
        />
        <Box sx={{ flexGrow: 1, overflow: "auto", scrollbarGutter: "stable" }}>
          <Button
            onClick={() => {
              this.handlePolygonFilterClick();
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
          {this.state?.searchList?.map((filter, idx) => {
            const currentSearchList = this.state.searchList.find(l => l.name === filter.name);
            const activeFilterLength = this.state.activeFilters.filter(f =>
              currentSearchList?.searchData.some(d => d.value === f.key),
            ).length;
            return (
              <this.StyledAccordion key={idx} expanded={filter?.isSelected}>
                <AccordionSummary
                  expandIcon={<ChevronDown />}
                  onClick={() => {
                    this.setState(prevState => ({
                      ...prevState,
                      searchList: prevState.searchList.map(obj =>
                        obj.id === idx ? { ...obj, isSelected: !obj.isSelected } : { ...obj, isSelected: false },
                      ),
                    }));
                  }}>
                  <Typography variant="h6">{t(filter?.translationId)} </Typography>
                  <Badge badgeContent={activeFilterLength} sx={{ marginLeft: "18px", marginTop: "10px" }} />
                </AccordionSummary>
                {filter?.name === "workgroup" && filter?.isSelected && (
                  <this.StyledAccordionDetails>
                    <WorkgroupRadioGroup
                      filter={search.filter.workgroup}
                      onChange={workgroup => {
                        setFilter("workgroup", workgroup);
                      }}
                      workgroups={user.data.workgroups}
                    />
                  </this.StyledAccordionDetails>
                )}
                {filter?.name === "status" && filter?.isSelected && (
                  <this.StyledAccordionDetails>
                    <StatusFilter
                      onChange={onChange}
                      resetBoreInc={resetBoreInc}
                      resetBoreIncDir={resetBoreIncDir}
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
                  </this.StyledAccordionDetails>
                )}
                <this.StyledAccordionDetails>
                  {this.handleButtonSelected() !== null && filter?.isSelected && (
                    <ListFilter
                      attribute={this.handleButtonSelected()}
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
                </this.StyledAccordionDetails>
              </this.StyledAccordion>
            );
          })}
        </Box>
        <FilterReset reset={this.handleFilterReset} />
      </Stack>
    );
  }
}

FilterComponent.propTypes = {
  onChange: PropTypes.func,
  resetBoreInc: PropTypes.func,
  resetBoreIncDir: PropTypes.func,
  resetDrillDiameter: PropTypes.func,
  resetDrilling: PropTypes.func,
  resetElevation: PropTypes.func,
  resetRestriction: PropTypes.func,
  resetTotBedrock: PropTypes.func,
  search: PropTypes.object,
  setFilter: PropTypes.func,
  settings: PropTypes.object,
  resetCreatedDate: PropTypes.func,
};

const mapStateToProps = state => {
  return {
    search: state.filters,
    settings: state.setting,
    boreholes: state.core_borehole_editor_list,
    user: state.core_user,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    dispatch: dispatch,
    setFilter: (key, value) => {
      dispatch({
        type: "SEARCH_EDITOR_FILTER_CHANGED",
        key: key,
        value: value,
      });
    },
    resetRestriction: () => {
      dispatch({
        type: "SEARCH_EDITOR_FILTER_RESET_RESTRICTION",
      });
    },
    resetElevation: () => {
      dispatch({
        type: "SEARCH_EDITOR_FILTER_RESET_ELEVATION",
      });
    },
    resetTotBedrock: () => {
      dispatch({
        type: "SEARCH_EDITOR_FILTER_RESET_TOP_BEDROCK",
      });
    },
    resetDrilling: () => {
      dispatch({
        type: "SEARCH_EDITOR_FILTER_RESET_DRILLING",
      });
    },
    resetDrillDiameter: () => {
      dispatch({
        type: "SEARCH_EDITOR_FILTER_RESET_DRILL_DIAMETER",
      });
    },
    resetBoreInc: () => {
      dispatch({
        type: "SEARCH_EDITOR_FILTER_RESET_BORE_INC",
      });
    },
    resetBoreIncDir: () => {
      dispatch({
        type: "SEARCH_EDITOR_FILTER_RESET_BORE_INC_DIR",
      });
    },
    resetDepth: () => {
      dispatch({
        type: "SEARCH_EDITOR_FILTER_RESET_DEPTH",
      });
    },
    resetCreatedDate: () => {
      dispatch({
        type: "SEARCH_EDITOR_FILTER_RESET_CREATED_DATE",
      });
    },
    reset: () => {
      dispatch({
        type: "SEARCH_EDITOR_FILTER_RESET",
      });
    },
  };
};

const ConnectedFilter = connect(mapStateToProps, mapDispatchToProps)(withTranslation(["common"])(FilterComponent));
export default ConnectedFilter;
