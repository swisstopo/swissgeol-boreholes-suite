import React, { Fragment } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { withTranslation } from "react-i18next";
import _ from "lodash";
import { Checkbox, Form, Icon } from "semantic-ui-react";
import TranslationText from "../../form/translationText";
import WorkgroupRadioGroup from "../../form/workgroup/radio";
import * as Styled from "./searchEditorStyles";
import ListFilter from "../components/listFilter";
import StatusFilter from "../components/statusFilter";
import { LocationSearchData } from "../data/LocationSearchData";
import { boreholeSearchData } from "../data/boreholeSearchData";
import { lithologySearchData } from "../data/lithologySearchData";
import { registrationSearchData } from "../data/registrationSearchData";
import { chronostratigraphySearchData } from "../data/chronostratigraphySearchData";
import { lithostratigraphySearchData } from "../data/lithostratigraphySearchData";
import { MenuItems } from "../../menu/editor/menuComponents/menuItems";
import { Stack, Typography } from "@mui/material";

class SearchEditorComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      accordionIdx: 0,
      isBoreholeSelectorOpen: false,
      isStratigraphySelectorOpen: false,
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
    if (_.get(settings.data.efilter, filter) === true) {
      return true;
    }
    return false;
  }

  handleButtonSelected() {
    let selectedData = null;
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

  render() {
    const { search, user, settings } = this.props;
    const filter = settings.data.filter;
    return (
      <Stack direction="column">
        <Styled.Container>
          <Typography variant="h5">
            <TranslationText id={"searchfilters"} />
          </Typography>

          <div style={{ padding: 10 }}>
            <Form size="tiny">
              <Form.Field
                key="msc-1"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                }}>
                <label>
                  <TranslationText id="filterbymap" />
                </label>
                <Checkbox
                  checked={search.mapfilter}
                  onChange={(e, d) => {
                    this.props.setmapfilter(d.checked);
                  }}
                  toggle
                />
              </Form.Field>
              <Form.Group
                key="msc-2"
                style={{
                  display: search.advanced === true || filter.zoom2selected === true ? null : "none",
                }}
                widths="equal"></Form.Group>
            </Form>
          </div>

          <div>
            {this.state?.searchList?.map((filter, idx) => (
              <Fragment key={idx}>
                <Styled.FilterContainer>
                  <Styled.FilterButton
                    isLast={idx === this.state?.searchList?.length - 1}
                    isSelected={filter?.isSelected}
                    onClick={() => {
                      this.setState(prevState => ({
                        ...prevState,
                        // update an array of objects:
                        searchList: prevState.searchList.map(obj =>
                          obj.id === idx ? { ...obj, isSelected: !obj.isSelected } : { ...obj, isSelected: false },
                        ),
                      }));
                    }}>
                    <div>
                      <Icon name={`caret ${filter?.isSelected ? "down" : "right"}`} />
                      <span>
                        <TranslationText id={filter?.translationId} />
                      </span>
                    </div>
                  </Styled.FilterButton>
                </Styled.FilterContainer>
                {filter?.name === "workgroup" && filter?.isSelected && (
                  <WorkgroupRadioGroup
                    filter={search.filter.workgroup}
                    onChange={workgroup => {
                      this.props.setFilter("workgroup", workgroup);
                    }}
                    workgroups={user.data.workgroups}
                  />
                )}
                {filter?.name === "status" && filter?.isSelected && (
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
                )}
                {this.handleButtonSelected() !== null && filter?.isSelected && (
                  <Styled.FormFilterContainer>
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
                  </Styled.FormFilterContainer>
                )}
              </Fragment>
            ))}
          </div>
        </Styled.Container>
        <MenuItems boreholes={this.props.boreholes} reset={this.props.reset} refresh={this.props.refresh} />
      </Stack>
    );
  }
}

SearchEditorComponent.propTypes = {
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
    search: state.searchEditor,
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
    setmapfilter: active => {
      dispatch({
        type: "SEARCH_EDITOR_MAPFILTER_CHANGED",
        active: active,
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
    refresh: () => {
      dispatch({
        type: "SEARCH_EDITOR_FILTER_REFRESH",
      });
    },
    reset: () => {
      dispatch({
        type: "SEARCH_EDITOR_FILTER_RESET",
      });
    },
  };
};

const ConnectedSearchEditorComponent = connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslation(["common"])(SearchEditorComponent));
export default ConnectedSearchEditorComponent;
