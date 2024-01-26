/* eslint-disable indent */
/* eslint-disable react/prop-types */
/* eslint-disable react/jsx-indent */
import React, { Fragment } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { withTranslation } from "react-i18next";
import _ from "lodash";
import { Icon, Form, Checkbox } from "semantic-ui-react";
import TranslationText from "../form/translationText";
import WorkgroupRadioGroup from "../form/workgroup/radio";
import * as Styled from "./editor/searchEditorStyles.js";
import ListFilter from "./components/listFilter";
import { casingSearchData } from "./data/casingSearchData";
import { InstrumentSearchData } from "./data/InstrumentSearchData";
import { fillingSearchData } from "./data/fillingSearchData";
import { LocationSearchData } from "./data/LocationSearchData";
import { boreholeSearchData } from "./data/boreholeSearchData";
import { lithologySearchData } from "./data/lithologySearchData";
class SearchComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isBoreholeSelectorOpen: false,
      isStratigraphySelectorOpen: false,
      searchList: [
        {
          id: 0,
          name: "location",
          translationId: "location",
          isSelected: false,
        },
        {
          id: 1,
          name: "borehole",
          translationId: "borehole",
          isSelected: false,
        },
        {
          id: 2,
          name: "lithology",
          translationId: "lithology",
          isSelected: false,
        },
        // {
        //   id: 3,
        //   name: "casing",
        //   translationId: "casing",
        //   isSelected: false,
        // },
        // {
        //   id: 4,
        //   name: "instrument",
        //   translationId: "instrument",
        //   isSelected: false,
        // },
        // {
        //   id: 5,
        //   name: "filling",
        //   translationId: "filling",
        //   isSelected: false,
        // },
        {
          id: 6,
          name: "workgroup",
          translationId: "workgroup",
          isSelected: false,
        },
      ],
    };
  }

  componentDidUpdate(prevProps) {
    const { search, onChange } = this.props;
    this.isVisible = this.isVisible.bind(this);
    if (
      onChange !== undefined &&
      !_.isEqual(search.filter, prevProps.search.filter)
    ) {
      onChange({ ...search.filter });
    }
  }
  isVisible(filter) {
    const { search, settings } = this.props;
    if (search.advanced === true) {
      return true;
    }
    if (_.get(settings.data.filter, filter) === true) {
      return true;
    }
    return false;
  }

  handleButtonSelected() {
    let selectedData = null;
    if (
      this.state?.searchList?.[0]?.name === "location" &&
      this.state?.searchList?.[0]?.isSelected
    ) {
      selectedData = LocationSearchData;
    } else if (
      this.state?.searchList?.[1]?.name === "borehole" &&
      this.state?.searchList?.[1]?.isSelected
    ) {
      selectedData = boreholeSearchData;
    } else if (
      this.state?.searchList?.[2]?.name === "lithology" &&
      this.state?.searchList?.[2]?.isSelected
    ) {
      selectedData = lithologySearchData;
    } else if (
      this.state?.searchList?.[3]?.name === "casing" &&
      this.state?.searchList?.[3]?.isSelected
    ) {
      selectedData = casingSearchData;
    } else if (
      this.state?.searchList?.[4]?.name === "instrument" &&
      this.state?.searchList?.[4]?.isSelected
    ) {
      selectedData = InstrumentSearchData;
    } else if (
      this.state?.searchList?.[5]?.name === "filling" &&
      this.state?.searchList?.[5]?.isSelected
    ) {
      selectedData = fillingSearchData;
    } else {
      selectedData = null;
    }
    return selectedData;
  }
  render() {
    const { search, user, settings } = this.props;
    const filter = settings.data.filter;
    return (
      <Styled.Container>
        <Styled.SearchFilterLabel>
          <TranslationText id={"searchfilters"} />:
        </Styled.SearchFilterLabel>
        <div style={{ padding: 10 }}>
          <Form size="tiny">
            {settings.data.appearance.explorer === 0
              ? null
              : [
                  <Form.Field
                    key="msc-1"
                    style={{
                      display:
                        search.advanced === true || filter.mapfilter === true
                          ? "flex"
                          : "none",
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
                  </Form.Field>,
                  <Form.Group
                    key="msc-2"
                    style={{
                      display:
                        search.advanced === true ||
                        filter.zoom2selected === true
                          ? null
                          : "none",
                    }}
                    widths="equal">
                    <Form.Field>
                      <label
                        style={{
                          whiteSpace: "nowrap",
                        }}>
                        <TranslationText id="centerselected" />
                      </label>
                      <Checkbox
                        checked={search.center2selected}
                        onChange={(e, d) => {
                          this.props.setcenter2filter(d.checked);
                        }}
                        toggle
                      />
                    </Form.Field>
                    <Form.Field
                      style={{
                        textAlign: "right",
                        opacity: !search.center2selected && "0.5",
                        pointerEvents: !search.center2selected && "none",
                      }}>
                      <label>
                        <TranslationText id="andzoom" />
                      </label>
                      <Checkbox
                        checked={search.zoom2selected}
                        onChange={(e, d) => {
                          this.props.setzoom2filter(d.checked);
                        }}
                        toggle
                      />
                    </Form.Field>
                  </Form.Group>,
                ]}
          </Form>
        </div>
        {this.state?.searchList?.map((filter, idx) => (
          <Fragment>
            <Styled.FilterContainer key={idx}>
              <Styled.FilterButton
                isLast={idx === this.state?.searchList?.length - 1}
                isSelected={filter?.isSelected}
                onClick={() => {
                  this.setState(prevState => ({
                    ...prevState,
                    // update an array of objects:
                    searchList: prevState.searchList.map(obj =>
                      obj.id === idx
                        ? { ...obj, isSelected: !obj.isSelected }
                        : { ...obj, isSelected: false },
                    ),
                  }));
                }}>
                <div>
                  <Icon
                    name={`caret ${filter?.isSelected ? "down" : "right"}`}
                  />
                  <span>
                    <TranslationText id={filter?.translationId} />
                  </span>
                </div>
              </Styled.FilterButton>
            </Styled.FilterContainer>
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
                  settings={this.props.settings.data.filter}
                />
              </Styled.FormFilterContainer>
            )}
          </Fragment>
        ))}

        {this.state?.searchList?.[6]?.name === "workgroup" &&
          this.state?.searchList?.[6]?.isSelected && (
            <WorkgroupRadioGroup
              filter={search.filter.workgroup}
              onChange={workgroup => {
                this.props.setFilter("workgroup", workgroup);
              }}
              workgroups={user.data.workgroups}
            />
          )}
      </Styled.Container>
    );
  }
}

SearchComponent.propTypes = {
  onChange: PropTypes.func,
  resetBoreInc: PropTypes.func,
  resetBoreIncDir: PropTypes.func,
  resetDrillDiameter: PropTypes.func,
  resetDrilling: PropTypes.func,
  resetTotBedrock: PropTypes.func,
  setFilter: PropTypes.func,
};

const mapStateToProps = (state, ownProps) => {
  return {
    developer: state.developer,
    search: state.search,
    settings: state.setting,
    user: state.core_user,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    dispatch: dispatch,
    setmapfilter: active => {
      dispatch({
        type: "SEARCH_MAPFILTER_CHANGED",
        active: active,
      });
    },
    setzoom2filter: active => {
      dispatch({
        type: "SEARCH_ZOOM2_CHANGED",
        active: active,
      });
    },
    setcenter2filter: active => {
      dispatch({
        type: "SEARCH_CENTER2_CHANGED",
        active: active,
      });
    },
    // Borehole filtering
    setFilter: (key, value) => {
      dispatch({
        type: "SEARCH_FILTER_CHANGED",
        key: key,
        value: value,
      });
    },
    resetIdentifier: () => {
      dispatch({
        type: "SEARCH_FILTER_RESET_IDENTIFIER",
      });
    },
    resetRestriction: () => {
      dispatch({
        type: "SEARCH_FILTER_RESET_RESTRICTION",
      });
    },
    resetElevation: () => {
      dispatch({
        type: "SEARCH_FILTER_RESET_ELEVATION",
      });
    },
    resetDepth: () => {
      dispatch({
        type: "SEARCH_FILTER_RESET_DEPTH",
      });
    },
    resetTotBedrock: () => {
      dispatch({
        type: "SEARCH_FILTER_RESET_TOP_BEDROCK",
      });
    },
    resetDrilling: () => {
      dispatch({
        type: "SEARCH_FILTER_RESET_DRILLING",
      });
    },
    resetDrillDiameter: () => {
      dispatch({
        type: "SEARCH_FILTER_RESET_DRILL_DIAMETER",
      });
    },
    resetBoreInc: () => {
      dispatch({
        type: "SEARCH_FILTER_RESET_BORE_INC",
      });
    },
    resetBoreIncDir: () => {
      dispatch({
        type: "SEARCH_FILTER_RESET_BORE_INC_DIR",
      });
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslation(["common"])(SearchComponent));
