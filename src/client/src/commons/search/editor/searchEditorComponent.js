import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import _ from 'lodash';
import { Icon } from 'semantic-ui-react';
import TranslationText from '../../form/translationText';
import WorkgroupRadioGroup from '../../form/workgroup/radio';
import * as Styled from './searchEditorStyles';
import ListFilter from '../components/listFilter';
import StatusFilter from '../components/statusFilter';
import { casingSearchData } from '../data/casingSearchData';
import { InstrumentSearchData } from '../data/InstrumentSearchData';
import { fillingSearchData } from '../data/fillingSearchData';
import { LocationSearchData } from '../data/LocationSearchData';
import { boreholeSearchData } from '../data/boreholeSearchData';
import { stratigraphySearchData } from '../data/stratigraphySearchData';

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
          name: 'workgroup',
          translationId: 'workgroup',
          isSelected: false,
        },
        {
          id: 1,
          name: 'status',
          translationId: 'status',
          isSelected: false,
        },
        {
          id: 2,
          name: 'location',
          translationId: 'location',
          isSelected: false,
        },
        {
          id: 3,
          name: 'borehole',
          translationId: 'borehole',
          isSelected: false,
        },
        {
          id: 4,
          name: 'stratigraphy',
          translationId: 'stratigraphy',
          isSelected: false,
        },
        {
          id: 5,
          name: 'casing',
          translationId: 'casing',
          isSelected: false,
        },
        {
          id: 6,
          name: 'instrument',
          translationId: 'instrument',
          isSelected: false,
        },
        {
          id: 7,
          name: 'filling',
          translationId: 'filling',
          isSelected: false,
        },
      ],
    };
  }
  componentDidUpdate(prevProps) {
    const { search, onChange } = this.props;
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
    if (_.get(settings.data.efilter, filter) === true) {
      return true;
    }
    return false;
  }

  handleButtonSelected() {
    let selectedData = null;
    if (
      this.state?.searchList?.[2]?.name === 'location' &&
      this.state?.searchList?.[2]?.isSelected
    ) {
      selectedData = LocationSearchData;
    } else if (
      this.state?.searchList?.[3]?.name === 'borehole' &&
      this.state?.searchList?.[3]?.isSelected
    ) {
      selectedData = boreholeSearchData;
    } else if (
      this.state?.searchList?.[4]?.name === 'stratigraphy' &&
      this.state?.searchList?.[4]?.isSelected
    ) {
      selectedData = stratigraphySearchData;
    } else if (
      this.state?.searchList?.[5]?.name === 'casing' &&
      this.state?.searchList?.[5]?.isSelected
    ) {
      selectedData = casingSearchData;
    } else if (
      this.state?.searchList?.[6]?.name === 'instrument' &&
      this.state?.searchList?.[6]?.isSelected
    ) {
      selectedData = InstrumentSearchData;
    } else if (
      this.state?.searchList?.[7]?.name === 'filling' &&
      this.state?.searchList?.[7]?.isSelected
    ) {
      selectedData = fillingSearchData;
    } else {
      selectedData = null;
    }
    return selectedData;
  }
  render() {
    const { search, user } = this.props;
    return (
      <Styled.Container>
        <Styled.SearchFilterLabel>
          <TranslationText id={'searchfilters'} />:
        </Styled.SearchFilterLabel>
        <div>
          {this.state?.searchList?.map((filter, idx) => (
            <Styled.FilterContainer key={idx}>
              {!filter?.isSelected && (
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
                      name={`caret ${filter?.isSelected ? 'down' : 'right'}`}
                    />
                    <span>
                      <TranslationText id={filter?.translationId} />
                    </span>
                  </div>
                </Styled.FilterButton>
              )}
            </Styled.FilterContainer>
          ))}
          {this.state?.searchList?.map((filter, idx) => (
            <Styled.FilterContainer key={idx}>
              {filter?.isSelected && (
                <Styled.FilterButton
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
                      name={`caret ${filter?.isSelected ? 'down' : 'right'}`}
                    />{' '}
                    <span>
                      <TranslationText id={filter?.translationId} />
                    </span>
                  </div>
                  <Icon name={'close'} />
                </Styled.FilterButton>
              )}
            </Styled.FilterContainer>
          ))}

          {this.state?.searchList?.[0]?.name === 'workgroup' &&
            this.state?.searchList?.[0]?.isSelected && (
              <WorkgroupRadioGroup
                filter={search.filter.workgroup}
                onChange={workgroup => {
                  this.props.setFilter('workgroup', workgroup);
                }}
                workgroups={user.data.workgroups}
              />
            )}
          {this.state?.searchList?.[1]?.name === 'status' &&
            this.state?.searchList?.[1]?.isSelected && (
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
              />
            )}

          {this.handleButtonSelected() !== null && (
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
              />
            </Styled.FormFilterContainer>
          )}
        </div>
      </Styled.Container>
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
};

const mapStateToProps = (state, ownProps) => {
  return {
    developer: state.developer,
    search: state.searchEditor,
    settings: state.setting,
    user: state.core_user,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    dispatch: dispatch,
    setFilter: (key, value) => {
      dispatch({
        type: 'SEARCH_EDITOR_FILTER_CHANGED',
        key: key,
        value: value,
      });
    },
    resetIdentifier: () => {
      dispatch({
        type: 'SEARCH_EDITOR_FILTER_RESET_IDENTIFIER',
      });
    },
    resetRestriction: () => {
      dispatch({
        type: 'SEARCH_EDITOR_FILTER_RESET_RESTRICTION',
      });
    },
    resetElevation: () => {
      dispatch({
        type: 'SEARCH_EDITOR_FILTER_RESET_ELEVATION',
      });
    },
    resetTotBedrock: () => {
      dispatch({
        type: 'SEARCH_EDITOR_FILTER_RESET_TOP_BEDROCK',
      });
    },
    resetDrilling: () => {
      dispatch({
        type: 'SEARCH_EDITOR_FILTER_RESET_DRILLING',
      });
    },
    resetDrillDiameter: () => {
      dispatch({
        type: 'SEARCH_EDITOR_FILTER_RESET_DRILL_DIAMETER',
      });
    },
    resetBoreInc: () => {
      dispatch({
        type: 'SEARCH_EDITOR_FILTER_RESET_BORE_INC',
      });
    },
    resetBoreIncDir: () => {
      dispatch({
        type: 'SEARCH_EDITOR_FILTER_RESET_BORE_INC_DIR',
      });
    },

    setCompletness: completness => {
      dispatch({
        type: 'SEARCH_EDITOR_COMPLETNESS_CHANGED',
        completness: completness,
      });
    },
    setProject: id => {
      dispatch({
        type: 'SEARCH_EDITOR_PROJECT_CHANGED',
        id: id,
      });
    },
    setLastUpdate: date => {
      dispatch({
        type: 'SEARCH_EDITOR_LASTUPDATE_CHANGED',
        date: date,
      });
    },
    setCreation: date => {
      dispatch({
        type: 'SEARCH_EDITOR_CREATION_CHANGED',
        date: date,
      });
    },
    resetDepth: () => {
      dispatch({
        type: 'SEARCH_EDITOR_FILTER_RESET_DEPTH',
      });
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslation(['common'])(SearchEditorComponent));
