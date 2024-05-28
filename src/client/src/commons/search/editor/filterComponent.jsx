import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { withTranslation } from "react-i18next";
import _ from "lodash";
import WorkgroupRadioGroup from "../../form/workgroup/radio";
import StatusFilter from "../components/statusFilter";
import { LocationSearchData } from "../data/LocationSearchData";
import { boreholeSearchData } from "../data/boreholeSearchData";
import { lithologySearchData } from "../data/lithologySearchData";
import { registrationSearchData } from "../data/registrationSearchData";
import { chronostratigraphySearchData } from "../data/chronostratigraphySearchData";
import { lithostratigraphySearchData } from "../data/lithostratigraphySearchData";
import { MenuItems } from "../../menu/editor/menuComponents/menuItems";
import { Accordion, AccordionDetails, AccordionSummary, Badge, Box, Button, Stack, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ListFilter from "../components/listFilter.jsx";
import { SideDrawerHeader } from "../../menu/editor/sideDrawerHeader.tsx";
import Polygon from "../../../../public/icons/polygon.svg?react";
import { theme } from "../../../AppTheme.ts";
import FilterChips from "./FilterChips.tsx";
import { FilterContext } from "../../../components/filter/filterContext.tsx";

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
        },
        {
          id: 1,
          name: "status",
          translationId: "status",
          isSelected: false,
        },
        {
          id: 2,
          name: "location",
          translationId: "location",
          isSelected: false,
        },
        {
          id: 3,
          name: "borehole",
          translationId: "borehole",
          isSelected: false,
        },
        {
          id: 4,
          name: "lithology",
          translationId: "lithology",
          isSelected: false,
        },
        {
          id: 5,
          name: "chronostratigraphy",
          translationId: "chronostratigraphy",
          isSelected: false,
        },
        {
          id: 6,
          name: "lithostratigraphy",
          translationId: "lithostratigraphy",
          isSelected: false,
        },
        {
          id: 7,
          name: "registration",
          translationId: "registration",
          isSelectedd: false,
        },
      ],
    };
  }

  componentDidUpdate(prevProps) {
    const { search, onChange } = this.props;
    if (onChange !== undefined && !_.isEqual(search.filter, prevProps.search.filter)) {
      onChange({ ...search.filter });
    }
  }

  isVisible(filter) {
    const { search, settings } = this.props;
    if (search.advanced === true) {
      return true;
    }
    return _.get(settings.data.efilter, filter) === true;
  }

  handleButtonSelected() {
    let selectedData;
    if (this.state?.searchList?.[2]?.name === "location" && this.state?.searchList?.[2]?.isSelected) {
      selectedData = LocationSearchData;
    } else if (this.state?.searchList?.[3]?.name === "borehole" && this.state?.searchList?.[3]?.isSelected) {
      selectedData = boreholeSearchData;
    } else if (this.state?.searchList?.[4]?.name === "lithology" && this.state?.searchList?.[4]?.isSelected) {
      selectedData = lithologySearchData;
    } else if (this.state?.searchList?.[5]?.name === "chronostratigraphy" && this.state?.searchList?.[5]?.isSelected) {
      selectedData = chronostratigraphySearchData;
    } else if (this.state?.searchList?.[6]?.name === "lithostratigraphy" && this.state?.searchList?.[6]?.isSelected) {
      selectedData = lithostratigraphySearchData;
    } else if (this.state?.searchList?.[7]?.name === "registration" && this.state?.searchList?.[7]?.isSelected) {
      selectedData = registrationSearchData;
    } else {
      selectedData = null;
    }
    return selectedData;
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
    boxShadow: "none",
    border: "none",
    maxHeight: "100%",
    padding: "12px, 16px, 12px, 16px",
    "&.MuiAccordion-root:before": {
      backgroundColor: theme.palette.background.default,
    },
  }));

  StyledAccordionDetails = styled(AccordionDetails)(() => ({
    overflow: "hidden",
    flexGrow: 1,
  }));

  render() {
    const { toggleDrawer, search, user, t } = this.props;
    const { filterPolygon, polygonSelectionEnabled, setPolygonSelectionEnabled } = this.context;
    const activeFilters = Object.entries(this.props.search.filter)
      .filter(
        ([key, value]) =>
          value != null && value !== "" && value !== -1 && !["refresh"].includes(key) && value !== "all",
      )
      .map(([key, value]) => ({ key: key, value: value }));
    return (
      <Stack direction="column" sx={{ height: "100%" }}>
        <Box sx={{ flexGrow: 1, overflow: "auto", scrollbarGutter: "stable" }}>
          <SideDrawerHeader title={t("searchfilters")} toggleDrawer={toggleDrawer} />
          <FilterChips
            setPolygonSelectionEnabled={setPolygonSelectionEnabled}
            activeFilters={activeFilters}
            setFilter={this.props.setFilter}
          />
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
              <Badge data-cy="polygon-filter-badge" color="error" badgeContent={1} sx={{ marginLeft: "18px" }}></Badge>
            )}
          </Button>
          {this.state?.searchList?.map((filter, idx) => (
            <this.StyledAccordion key={idx} expanded={filter?.isSelected}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                onClick={() => {
                  this.setState(prevState => ({
                    ...prevState,
                    // update an array of objects:
                    searchList: prevState.searchList.map(obj =>
                      obj.id === idx ? { ...obj, isSelected: !obj.isSelected } : { ...obj, isSelected: false },
                    ),
                  }));
                }}>
                <Typography variant="h6">{t(filter?.translationId)}</Typography>
              </AccordionSummary>

              {filter?.name === "workgroup" && filter?.isSelected && (
                <this.StyledAccordionDetails>
                  <WorkgroupRadioGroup
                    filter={search.filter.workgroup}
                    onChange={workgroup => {
                      this.props.setFilter("workgroup", workgroup);
                    }}
                    workgroups={user.data.workgroups}
                  />
                </this.StyledAccordionDetails>
              )}
              {filter?.name === "status" && filter?.isSelected && (
                <this.StyledAccordionDetails>
                  <StatusFilter
                    onChange={this.props.onChange}
                    resetBoreInc={this.props.resetBoreInc}
                    resetBoreIncDir={this.props.resetBoreIncDir}
                    resetDrillDiameter={this.props.resetDrillDiameter}
                    resetDrilling={this.props.resetDrilling}
                    resetElevation={this.props.resetElevation}
                    resetRestriction={this.props.resetRestriction}
                    resetTotBedrock={this.props.resetTotBedrock}
                    search={this.props.search}
                    setFilter={this.props.setFilter}
                    settings={this.props.settings.data.efilter}
                    resetCreatedDate={this.props.resetCreatedDate}
                  />
                </this.StyledAccordionDetails>
              )}
              <this.StyledAccordionDetails>
                {this.handleButtonSelected() !== null && filter?.isSelected && (
                  <ListFilter
                    attribute={this.handleButtonSelected()}
                    resetBoreInc={this.props.resetBoreInc}
                    resetBoreIncDir={this.props.resetBoreIncDir}
                    resetDepth={this.props.resetDepth}
                    resetDrillDiameter={this.props.resetDrillDiameter}
                    resetDrilling={this.props.resetDrilling}
                    resetElevation={this.props.resetElevation}
                    resetRestriction={this.props.resetRestriction}
                    resetTotBedrock={this.props.resetTotBedrock}
                    search={this.props.search}
                    setFilter={this.props.setFilter}
                    settings={this.props.settings.data.efilter}
                    resetCreatedDate={this.props.resetCreatedDate}
                  />
                )}
              </this.StyledAccordionDetails>
            </this.StyledAccordion>
          ))}
        </Box>
        <MenuItems reset={this.handleFilterReset} />
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
    resetIdentifier: () => {
      dispatch({
        type: "SEARCH_EDITOR_FILTER_RESET_IDENTIFIER",
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
    setProject: id => {
      dispatch({
        type: "SEARCH_EDITOR_PROJECT_CHANGED",
        id: id,
      });
    },
    setLastUpdate: date => {
      dispatch({
        type: "SEARCH_EDITOR_LASTUPDATE_CHANGED",
        date: date,
      });
    },
    setCreation: date => {
      dispatch({
        type: "SEARCH_EDITOR_CREATION_CHANGED",
        date: date,
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
