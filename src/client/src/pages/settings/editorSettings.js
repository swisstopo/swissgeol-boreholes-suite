import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { withTranslation } from "react-i18next";
import { Button, Divider, Segment } from "semantic-ui-react";
import { patchCodeConfig, patchSettings } from "../../api-lib/index";

import IdentifierSettings from "./editor/identifierSettings";
import CodeListSettings from "./editor/codeListSettings";

import TranslationText from "../../commons/form/translationText";
import EditorSettingList from "./components/editorSettingList/editorSettingList";
import { boreholeEditorData } from "./data/boreholeEditorData";
import { stratigraphyFilterEditorData } from "./data/stratigraphyFilterEditorData";
import { stratigraphyFieldEditorData } from "./data/stratigraphyFieldEditorData";
import { casingEditorData } from "./data/casingEditorData";
import { locationEditorData } from "./data/locationEditorData";
import { instrumentEditorData } from "./data/instrumentEditorData";
import { fillingEditorData } from "./data/fillingEditorData";
import { registrationEditorData } from "./data/registrationEditorData";

export const fields = [];

class EditorSettings extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fields: false,
      identifiers: false,
      codeLists: false,
      searchList: [
        {
          id: 0,
          name: "location",
          translationId: "searchFilterLocation",
          isSelected: false,
        },
        {
          id: 1,
          name: "borehole",
          translationId: "searchFiltersBoreholes",
          isSelected: false,
        },

        {
          id: 2,
          name: "stratigraphy",
          translationId: "searchFiltersLayers",
          isSelected: false,
        },
        {
          id: 3,
          name: "casing",
          translationId: "searchFilterCasing",
          isSelected: false,
        },
        {
          id: 4,
          name: "instrument",
          translationId: "searchFilterInstrument",
          isSelected: false,
        },
        {
          id: 5,
          name: "filling",
          translationId: "searchFilterFilling",
          isSelected: false,
        },
        {
          id: 6,
          name: "stratigraphyfields",
          translationId: "stratigraphyfields",
          isSelected: false,
        },
        {
          id: 7,
          name: "registration",
          translationId: "searchFilterRegistration",
          isSelected: false,
        },
      ],
    };
  }
  handleButtonSelected(name, isSelected) {
    let selectedData = null;
    if (name === "location" && isSelected) {
      selectedData = locationEditorData;
    } else if (name === "borehole" && isSelected) {
      selectedData = boreholeEditorData;
    } else if (name === "stratigraphy" && isSelected) {
      selectedData = stratigraphyFilterEditorData;
    } else if (name === "casing" && isSelected) {
      selectedData = casingEditorData;
    } else if (name === "instrument" && isSelected) {
      selectedData = instrumentEditorData;
    } else if (name === "filling" && isSelected) {
      selectedData = fillingEditorData;
    } else if (name === "stratigraphyfields" && isSelected) {
      selectedData = stratigraphyFieldEditorData;
    } else if (name === "registration" && isSelected) {
      selectedData = registrationEditorData;
    } else {
      selectedData = null;
    }
    return selectedData;
  }
  render() {
    const {
      setting,
      toggleField,
      toggleFilter,
      toggleFieldArray,
      toggleFilterArray,
    } = this.props;
    return (
      <div
        style={{
          padding: "1em",
          flex: 1,
        }}>
        {this.state?.searchList?.map((filter, idx) => (
          <div key={idx}>
            <div
              onClick={() => {
                this.setState(prevState => ({
                  ...prevState,
                  // update an array of objects:
                  searchList: prevState.searchList.map(
                    obj =>
                      obj.id === idx
                        ? { ...obj, isSelected: !obj.isSelected }
                        : { ...obj },
                    // : { ...obj, isSelected: false }, if you want to select only one filter
                  ),
                }));
              }}
              style={{
                flexDirection: "row",
                display: "flex",
                cursor: "pointer",
                backgroundColor: filter.isSelected ? "#f5f5f5" : "#fff",
                padding: 10,
              }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: 18,
                  fontWeight: "bold",
                }}>
                <TranslationText id={filter.translationId} />
              </div>
              <div
                style={{
                  flex: 1,
                  textAlign: "right",
                }}>
                <Button color="red" size="small">
                  {filter.isSelected === true ? (
                    <TranslationText id="collapse" />
                  ) : (
                    <TranslationText id="expand" />
                  )}
                </Button>
              </div>
            </div>
            {filter.isSelected === true &&
            this.handleButtonSelected(filter.name, filter.isSelected) !==
              null ? (
              <EditorSettingList
                attribute={this.handleButtonSelected(
                  filter.name,
                  filter.isSelected,
                )}
                codes={this.props.codes}
                data={setting.data.efilter}
                geocode={this.props.geocode}
                listName={filter.name}
                toggleField={toggleField}
                toggleFilter={toggleFilter}
                toggleFieldArray={toggleFieldArray}
                toggleFilterArray={toggleFilterArray}
                type={"editor"}
              />
            ) : (
              <Divider style={{ margin: 0 }} />
            )}
          </div>
        ))}

        {this.props.user.data.admin === true && (
          <div>
            <div>
              <div
                onClick={() => {
                  this.setState({
                    identifiers: !this.state.identifiers,
                  });
                }}
                style={{
                  flexDirection: "row",
                  display: "flex",
                  cursor: "pointer",
                  backgroundColor: this.state.identifiers ? "#f5f5f5" : "#fff",
                  padding: 10,
                }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    fontSize: 18,
                    fontWeight: "bold",
                  }}>
                  <TranslationText id="identifierManager" />
                </div>
                <div
                  style={{
                    flex: 1,
                    textAlign: "right",
                  }}>
                  <Button color="red" size="small">
                    {this.state.identifiers === true ? (
                      <TranslationText id="collapse" />
                    ) : (
                      <TranslationText id="expand" />
                    )}
                  </Button>
                </div>
              </div>
              {this.state.identifiers === true ? (
                <Segment style={{ margin: 0 }}>
                  <IdentifierSettings />
                </Segment>
              ) : (
                <Divider style={{ margin: 0 }} />
              )}
            </div>
            <div>
              <div
                onClick={() => {
                  this.setState({
                    codeLists: !this.state.codeLists,
                  });
                }}
                style={{
                  flexDirection: "row",
                  display: "flex",
                  cursor: "pointer",
                  backgroundColor: this.state.codeLists ? "#f5f5f5" : "#fff",
                  padding: 10,
                }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    fontSize: 18,
                    fontWeight: "bold",
                  }}>
                  <TranslationText id="codeListTranslations" />
                </div>
                <div
                  style={{
                    flex: 1,
                    textAlign: "right",
                  }}>
                  <Button color="red" size="small">
                    {this.state.codeLists === true ? (
                      <TranslationText id="collapse" />
                    ) : (
                      <TranslationText id="expand" />
                    )}
                  </Button>
                </div>
              </div>
              {this.state.codeLists === true ? (
                <Segment style={{ margin: 0 }}>
                  <CodeListSettings />
                </Segment>
              ) : (
                <Divider style={{ margin: 0 }} />
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
}

EditorSettings.propTypes = {
  codes: PropTypes.object,
  geocode: PropTypes.string,
  setting: PropTypes.object,
  t: PropTypes.func,
  toggleField: PropTypes.func,
  toggleFieldArray: PropTypes.func,
  toggleFilter: PropTypes.func,
  toggleFilterArray: PropTypes.func,
};

EditorSettings.defaultProps = {
  geocode: "Geol",
};

const mapStateToProps = state => {
  return {
    setting: state.setting,
    codes: state.core_domain_list,
    user: state.core_user,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    dispatch: dispatch,
    toggleFieldArray: (filter, enabled) => {
      const newFilter = [];
      filter.forEach(element => {
        newFilter.push(`fields.${element}`);
      });
      dispatch(patchCodeConfig(newFilter, enabled));
    },
    toggleFilterArray: (filter, enabled) => {
      const newFilter = [];
      filter.forEach(element => {
        newFilter.push(`efilter.${element}`);
      });
      dispatch(patchSettings(newFilter, enabled));
    },
    toggleField: (filter, enabled) => {
      dispatch(patchCodeConfig(`fields.${filter}`, enabled));
    },
    toggleFilter: (filter, enabled) => {
      dispatch(patchSettings(`efilter.${filter}`, enabled));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslation("common")(EditorSettings));
