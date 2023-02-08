import React from "react";
import { connect } from "react-redux";
import { withTranslation } from "react-i18next";
import _ from "lodash";
import { Button, Checkbox, Divider, Segment } from "semantic-ui-react";
import { patchSettings, patchCodeConfig } from "../../api-lib/index";
import TranslationText from "../../commons/form/translationText";
import { optionsFromCapabilities } from "ol/source/WMTS";
import { register } from "ol/proj/proj4";
import proj4 from "proj4";
import { locationEditorData } from "./data/locationEditorData";
import { boreholeEditorData } from "./data/boreholeEditorData";
import { stratigraphyFilterEditorData } from "./data/stratigraphyFilterEditorData";
import { casingEditorData } from "./data/casingEditorData";
import { instrumentEditorData } from "./data/instrumentEditorData";
import { fillingEditorData } from "./data/fillingEditorData";
import { stratigraphyFieldEditorData } from "./data/stratigraphyFieldEditorData";
import EditorSettingList from "./components/editorSettingList/editorSettingList";
import MapSettings from "./components/editorSettingList/mapSettings";
import { AlertContext } from "../../commons/alert/alertContext";

const projections = {
  "EPSG:21781":
    "+proj=somerc +lat_0=46.95240555555556 +lon_0=7.439583333333333 +k_0=1 +x_0=600000 +y_0=200000 +ellps=bessel +towgs84=674.4,15.1,405.3,0,0,0,0 +units=m +no_defs",
  "EPSG:2056":
    "+proj=somerc +lat_0=46.95240555555556 +lon_0=7.439583333333333 +k_0=1 +x_0=2600000 +y_0=1200000 +ellps=bessel +towgs84=674.374,15.056,405.346,0,0,0,0 +units=m +no_defs",
  "EPSG:21782":
    "+proj=somerc +lat_0=46.95240555555556 +lon_0=7.439583333333333 +k_0=1 +x_0=0 +y_0=0 +ellps=bessel +towgs84=674.4,15.1,405.3,0,0,0,0 +units=m +no_defs",
  "EPSG:4149":
    "+proj=longlat +ellps=bessel +towgs84=674.4,15.1,405.3,0,0,0,0 +no_defs",
  "EPSG:4150":
    "+proj=longlat +ellps=bessel +towgs84=674.374,15.056,405.346,0,0,0,0 +no_defs",
};

class ExplorerSettings extends React.Component {
  static contextType = AlertContext;
  constructor(props) {
    super(props);
    _.forEach(projections, function (proj, srs) {
      proj4.defs(srs, proj);
    });
    register(proj4);
    this.state = {
      fields: false,

      appearance: false,
      searchFiltersBoreholes: false,
      searchFiltersLayers: false,
      map: false,

      wmtsFetch: false,
      searchWmts: "",
      searchWmtsUser: "",
      wmts: null,

      wmsFetch: false,
      searchWms: "",
      searchWmsUser: "",
      wms: null,
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
      ],
    };
  }

  isVisible(field) {
    const { geocode, codes } = this.props;
    if (_.has(codes, "data.layer_kind") && _.isArray(codes.data.layer_kind)) {
      for (let idx = 0; idx < codes.data.layer_kind.length; idx++) {
        const element = codes.data.layer_kind[idx];
        if (element.code === geocode) {
          if (
            _.isObject(element.conf) &&
            _.has(element.conf, `fields.${field}`)
          ) {
            return element.conf.fields[field];
          } else {
            return false;
          }
        }
      }
    }
    return false;
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
    } else {
      selectedData = null;
    }
    return selectedData;
  }
  render() {
    const {
      addExplorerMap,
      patchAppearance,
      rmExplorerMap,
      setting,
      t,
      toggleFilter,
      toggleField,
      toggleFilterArray,
      toggleFieldArray,
      i18n,
    } = this.props;

    return (
      <div
        style={{
          padding: "1em",
          flex: 1,
        }}>
        <div
          onClick={() => {
            this.setState({
              appearance: !this.state.appearance,
            });
          }}
          style={{
            flexDirection: "row",
            display: "flex",
            cursor: "pointer",
            backgroundColor: this.state.appearance ? "#f5f5f5" : "#fff",
            padding: 10,
          }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: 18,
              fontWeight: "bold",
            }}>
            <TranslationText id="appearance" />
          </div>
          <div
            style={{
              flex: 1,
              textAlign: "right",
            }}>
            <Button color="red" size="small">
              {this.state.appearance === true ? (
                <TranslationText id="collapse" />
              ) : (
                <TranslationText id="expand" />
              )}
            </Button>
          </div>
        </div>
        {this.state.appearance === true ? (
          <Segment.Group style={{ margin: 0 }}>
            <Segment>
              <div>
                <Checkbox
                  checked={setting.data.appearance.explorer === 0}
                  label=""
                  onChange={(e, d) => {
                    patchAppearance(0);
                  }}
                  radio
                />
                <TranslationText id="appearanceBigMap" />
              </div>
              <div>
                <Checkbox
                  checked={setting.data.appearance.explorer === 1}
                  label=""
                  onChange={(e, d) => {
                    patchAppearance(1);
                  }}
                  radio
                />
                <TranslationText id="appearanceFull" />
              </div>
              <div>
                <Checkbox
                  checked={setting.data.appearance.explorer === 2}
                  label=""
                  onChange={(e, d) => {
                    patchAppearance(2);
                  }}
                  radio
                />
                <TranslationText id="appearanceMapListDetails" />
              </div>
              <div>
                <Checkbox
                  checked={setting.data.appearance.explorer === 3}
                  label=""
                  onChange={(e, d) => {
                    patchAppearance(3);
                  }}
                  radio
                />
                <TranslationText id="appearanceListMapDetails" />
              </div>

              <div>
                <Checkbox
                  checked={setting.data.appearance.explorer === 4}
                  label=""
                  onChange={(e, d) => {
                    patchAppearance(4);
                  }}
                  radio
                />
                <TranslationText id="appearanceMapDetailsList" />
              </div>
              <div>
                <Checkbox
                  checked={setting.data.appearance.explorer === 5}
                  label=""
                  onChange={(e, d) => {
                    patchAppearance(5);
                  }}
                  radio
                />
                <TranslationText id="appearanceListDetailsMap" />
              </div>
            </Segment>
          </Segment.Group>
        ) : (
          <Divider style={{ margin: 0 }} />
        )}
        <MapSettings
          setting={setting}
          i18n={i18n}
          rmExplorerMap={rmExplorerMap}
          addExplorerMap={addExplorerMap}
          toggleFilter={toggleFilter}
          t={t}
          handleAddItem={value => {
            this.setState(
              {
                wmsFetch: false,
                wms: null,
                wmts: null,
              },
              () => {
                this.props.handleAddItem(value);
              },
            );
          }}
          handleOnChange={value => {
            this.setState(
              {
                wmsFetch: false,
                wms: null,
                wmts: null,
              },
              () => {
                this.props.handleOnChange(value);
              },
            );
          }}
          state={this.state}
          setState={this.setState.bind(this)}></MapSettings>

        {this.state?.searchList?.map((filter, idx) => (
          <div key={idx}>
            <div
              onClick={() => {
                this.setState(prevState => ({
                  ...prevState,
                  // update an array of objects:
                  searchList: prevState.searchList.map(obj =>
                    obj.id === idx
                      ? { ...obj, isSelected: !obj.isSelected }
                      : { ...obj },
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
                data={setting.data.filter}
                geocode={this.props.geocode}
                listName={filter.name}
                toggleField={toggleField}
                toggleFilter={toggleFilter}
                toggleFieldArray={toggleFieldArray}
                toggleFilterArray={toggleFilterArray}
                type={"viewer"}
              />
            ) : (
              <Divider style={{ margin: 0 }} />
            )}
          </div>
        ))}
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    setting: state.setting,
    codes: state.core_domain_list,
    user: state.core_user,
  };
};

ExplorerSettings.defaultProps = {
  geocode: "Geol",
};
const mapDispatchToProps = (dispatch, state) => {
  return {
    dispatch: dispatch,
    toggleFieldArray: (filter, enabled) => {
      const newFilter = [];
      filter.forEach(element => {
        newFilter.push(`viewerFields.${element}`);
      });
      dispatch(patchCodeConfig(newFilter, enabled));
    },
    toggleFilterArray: (filter, enabled) => {
      const newFilter = [];
      filter.forEach(element => {
        newFilter.push(`filter.${element}`);
      });
      dispatch(patchSettings(newFilter, enabled));
    },
    toggleField: (filter, enabled) => {
      dispatch(patchCodeConfig(`viewerFields.${filter}`, enabled));
    },
    toggleFilter: (filter, enabled) => {
      dispatch(patchSettings(`filter.${filter}`, enabled));
    },
    patchAppearance: mode => {
      dispatch(patchSettings("appearance.explorer", mode));
    },
    addExplorerMap: (layer, type, result, position = 0) => {
      if (type === "WMS") {
        if (!layer.CRS.includes("EPSG:2056")) {
          this.context.error("Only EPSG:2056 is supported");
        } else {
          dispatch(
            patchSettings(
              "map.explorer",
              {
                Identifier: layer.Name,
                Abstract: layer.Abstract,
                position: position,
                Title: layer.Title,
                transparency: 0,
                type: "WMS",
                url: result.Service.OnlineResource,
                visibility: true,
                queryable: layer.queryable,
              },
              layer.Name,
            ),
          );
        }
      } else if (type === "WMTS") {
        const conf = optionsFromCapabilities(result, {
          layer: layer.Identifier,
          // projection: 'EPSG:2056'
        });
        if (
          conf.hasOwnProperty("matrixSet") &&
          !conf.matrixSet.includes("2056")
        ) {
          this.context.error("Only EPSG:2056 is supported");
        } else {
          dispatch(
            patchSettings(
              "map.explorer",
              {
                Identifier: layer.Identifier,
                Abstract: layer.Abstract,
                position: position,
                Title: layer.Title,
                transparency: 0,
                type: "WMTS",
                url: conf.urls,
                visibility: true,
                queryable: false,
                conf: {
                  ...conf,
                  projection: {
                    code: conf.projection.code_,
                    units: conf.projection.units_,
                    extent: conf.projection.extent_,
                    axisOrientation: conf.projection.axisOrientation_,
                    global: conf.projection.global_,
                    metersPerUnit: conf.projection.metersPerUnit_,
                    worldExtent: conf.projection.worldExtent_,
                  },
                  tileGrid: {
                    extent: conf.tileGrid.extent_,
                    origin: conf.tileGrid.origin_,
                    origins: conf.tileGrid.origins_,
                    resolutions: conf.tileGrid.resolutions_,
                    matrixIds: conf.tileGrid.matrixIds_,
                    // sizes: conf.tileGrid.sizes,
                    tileSize: conf.tileGrid.tileSize_,
                    tileSizes: conf.tileGrid.tileSizes_,
                    // widths: conf.tileGrid.widths
                  },
                },
              },
              layer.Identifier,
            ),
          );
        }
      }
    },
    rmExplorerMap: config => {
      dispatch(patchSettings("map.explorer", null, config.Identifier));
    },
    patchSettings: (filter, enabled) => {
      dispatch(patchSettings(`filter.${filter}`, enabled));
    },
    handleAddItem: value => {
      dispatch({
        type: "WMS_ADDED",
        url: value,
      });
    },
    handleOnChange: value => {
      dispatch({
        type: "WMS_SELECTED",
        url: value,
      });
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslation("common")(ExplorerSettings));
