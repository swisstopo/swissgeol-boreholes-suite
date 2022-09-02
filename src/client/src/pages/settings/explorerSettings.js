import React from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import _ from 'lodash';
import Highlight from 'react-highlighter';

import {
  Button,
  Checkbox,
  Divider,
  Dropdown,
  Input,
  Label,
  Popup,
  Segment,
} from 'semantic-ui-react';
import { patchSettings, patchCodeConfig, getWms } from '../../api-lib/index';
import TranslationText from '../../commons/form/translationText';
import WMTSCapabilities from 'ol/format/WMTSCapabilities';
import WMSCapabilities from 'ol/format/WMSCapabilities';
import { optionsFromCapabilities } from 'ol/source/WMTS';
import { register } from 'ol/proj/proj4';
import proj4 from 'proj4';
import { locationEditorData } from './data/locationEditorData';
import { boreholeEditorData } from './data/boreholeEditorData';
import { stratigraphyFilterEditorData } from './data/stratigraphyFilterEditorData';
import { casingEditorData } from './data/casingEditorData';
import { instrumentEditorData } from './data/instrumentEditorData';
import { fillingEditorData } from './data/fillingEditorData';
import { stratigraphyFieldEditorData } from './data/stratigraphyFieldEditorData';
import EditorSettingList from './components/editorSettingList/editorSettingList';
const projections = {
  'EPSG:21781':
    '+proj=somerc +lat_0=46.95240555555556 +lon_0=7.439583333333333 +k_0=1 +x_0=600000 +y_0=200000 +ellps=bessel +towgs84=674.4,15.1,405.3,0,0,0,0 +units=m +no_defs',
  'EPSG:2056':
    '+proj=somerc +lat_0=46.95240555555556 +lon_0=7.439583333333333 +k_0=1 +x_0=2600000 +y_0=1200000 +ellps=bessel +towgs84=674.374,15.056,405.346,0,0,0,0 +units=m +no_defs',
  'EPSG:21782':
    '+proj=somerc +lat_0=46.95240555555556 +lon_0=7.439583333333333 +k_0=1 +x_0=0 +y_0=0 +ellps=bessel +towgs84=674.4,15.1,405.3,0,0,0,0 +units=m +no_defs',
  'EPSG:4149':
    '+proj=longlat +ellps=bessel +towgs84=674.4,15.1,405.3,0,0,0,0 +no_defs',
  'EPSG:4150':
    '+proj=longlat +ellps=bessel +towgs84=674.374,15.056,405.346,0,0,0,0 +no_defs',
};

class ExplorerSettings extends React.Component {
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
      searchWmts: '',
      searchWmtsUser: '',
      wmts: null,

      wmsFetch: false,
      searchWms: '',
      searchWmsUser: '',
      wms: null,
      searchList: [
        {
          id: 0,
          name: 'location',
          translationId: 'searchFilterLocation',
          isSelected: false,
        },
        {
          id: 1,
          name: 'borehole',
          translationId: 'searchFiltersBoreholes',
          isSelected: false,
        },

        {
          id: 2,
          name: 'stratigraphy',
          translationId: 'searchFiltersLayers',
          isSelected: false,
        },
        {
          id: 3,
          name: 'casing',
          translationId: 'searchFilterCasing',
          isSelected: false,
        },
        {
          id: 4,
          name: 'instrument',
          translationId: 'searchFilterInstrument',
          isSelected: false,
        },
        {
          id: 5,
          name: 'filling',
          translationId: 'searchFilterFilling',
          isSelected: false,
        },
        {
          id: 6,
          name: 'stratigraphyfields',
          translationId: 'stratigraphyfields',
          isSelected: false,
        },
      ],
    };
  }

  isVisible(field) {
    const { geocode, codes } = this.props;
    if (_.has(codes, 'data.layer_kind') && _.isArray(codes.data.layer_kind)) {
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
    if (name === 'location' && isSelected) {
      selectedData = locationEditorData;
    } else if (name === 'borehole' && isSelected) {
      selectedData = boreholeEditorData;
    } else if (name === 'stratigraphy' && isSelected) {
      selectedData = stratigraphyFilterEditorData;
    } else if (name === 'casing' && isSelected) {
      selectedData = casingEditorData;
    } else if (name === 'instrument' && isSelected) {
      selectedData = instrumentEditorData;
    } else if (name === 'filling' && isSelected) {
      selectedData = fillingEditorData;
    } else if (name === 'stratigraphyfields' && isSelected) {
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
          padding: '1em',
          flex: 1,
        }}>
        <div
          onClick={() => {
            this.setState({
              appearance: !this.state.appearance,
            });
          }}
          style={{
            flexDirection: 'row',
            display: 'flex',
            cursor: 'pointer',
            backgroundColor: this.state.appearance ? '#f5f5f5' : '#fff',
            padding: 10,
          }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: 18,
              fontWeight: 'bold',
            }}>
            <TranslationText id="appearance" />
          </div>
          <div
            style={{
              flex: 1,
              textAlign: 'right',
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
                  label="List/Details + Map"
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
        <div
          onClick={() => {
            this.setState({
              map: !this.state.map,
            });
          }}
          style={{
            flexDirection: 'row',
            display: 'flex',
            cursor: 'pointer',
            backgroundColor: this.state.map ? '#f5f5f5' : '#fff',
            padding: 10,
          }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: 18,
              fontWeight: 'bold',
            }}>
            <TranslationText id="map" />
          </div>
          <div
            style={{
              flex: 1,
              textAlign: 'right',
            }}>
            <Button color="red" size="small">
              {this.state.map === true ? (
                <TranslationText id="collapse" />
              ) : (
                <TranslationText id="expand" />
              )}
            </Button>
          </div>
        </div>
        {this.state.map === true ? (
          <Segment.Group style={{ margin: 0 }}>
            <Segment>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                }}>
                <div
                  style={{
                    flex: '1 1 100%',
                  }}>
                  <div
                    style={{
                      alignItems: 'center',
                      marginBottom: '1em',
                      display: 'flex',
                      flexDirection: 'row',
                    }}>
                    <div
                      style={{
                        flex: 1,
                      }}>
                      <Dropdown
                        additionLabel=""
                        allowAdditions
                        fluid
                        onAddItem={(e, { value }) => {
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
                        onChange={(e, { value }) => {
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
                        options={setting.WMS}
                        placeholder=""
                        search
                        selection
                        value={setting.selectedWMS}
                      />
                    </div>
                    <Button
                      compact
                      loading={this.state.wmsFetch === true}
                      onClick={() => {
                        this.setState(
                          {
                            wmsFetch: true,
                            wms: null,
                            wmts: null,
                          },
                          () => {
                            getWms(i18n.language, setting.selectedWMS).then(
                              response => {
                                // Check if WMS or WMTS
                                let data = response.data;
                                if (
                                  /<(WMT_MS_Capabilities|WMS_Capabilities)/.test(
                                    data,
                                  )
                                ) {
                                  const wms = new WMSCapabilities().read(data);
                                  this.setState({
                                    wmsFetch: false,
                                    wms: wms,
                                    wmts: null,
                                  });
                                } else if (/<Capabilities/.test(data)) {
                                  const wmts = new WMTSCapabilities().read(
                                    data,
                                  );
                                  this.setState({
                                    wmsFetch: false,
                                    wms: null,
                                    wmts: wmts,
                                  });
                                } else {
                                  this.setState({
                                    wmsFetch: false,
                                    wms: null,
                                    wmts: null,
                                  });
                                  alert(
                                    'Sorry, only Web Map Services (WMS) and ' +
                                      'Web Map Tile Service (WMTS) are supported',
                                  );
                                }
                              },
                            );
                            // getWmts(i18n.language).then((response) => {
                            //   this.setState({
                            //     wmtsFetch: false,
                            //     wmts: (
                            //       new WMTSCapabilities()
                            //     ).read(response.data)
                            //   }, () => {
                            //     console.log(this.state.wmts);
                            //   });
                            // }).catch((error) => {
                            //   console.log(error);
                            // });
                          },
                        );
                      }}
                      secondary
                      style={{
                        marginLeft: '1em',
                      }}
                      // size='mini'
                    >
                      <TranslationText id="load" />
                    </Button>
                  </div>
                  {this.state.wmts !== null ? (
                    <div>
                      <Input
                        icon="search"
                        onChange={e => {
                          this.setState({
                            searchWmts: e.target.value.toLowerCase(),
                          });
                        }}
                        placeholder="Search..."
                      />
                    </div>
                  ) : null}
                  {this.state.wms !== null ? (
                    <div>
                      <Input
                        icon="search"
                        onChange={e => {
                          this.setState({
                            searchWms: e.target.value.toLowerCase(),
                          });
                        }}
                        placeholder="Search..."
                      />
                    </div>
                  ) : null}
                  <div
                    style={{
                      maxHeight: '300px',
                      overflowY: 'auto',
                      border:
                        this.state.wms === null && this.state.wmts === null
                          ? null
                          : 'thin solid #cecece',
                      marginTop:
                        this.state.wms === null && this.state.wmts === null
                          ? null
                          : '1em',
                    }}>
                    {this.state.wms === null
                      ? null
                      : this.state.wms.Capability.Layer.Layer.map(
                          (layer, idx) =>
                            this.state.searchWms === '' ||
                            (layer.hasOwnProperty('Title') &&
                              layer.Title.toLowerCase().search(
                                this.state.searchWms,
                              ) >= 0) ||
                            (layer.hasOwnProperty('Abstract') &&
                              layer.Abstract.toLowerCase().search(
                                this.state.searchWms,
                              ) >= 0) ||
                            (layer.hasOwnProperty('Name') &&
                              layer.Name.toLowerCase().search(
                                this.state.searchWms,
                              ) >= 0) ? (
                              <div
                                className="selectable unselectable"
                                key={'wmts-list-' + idx}
                                style={{
                                  padding: '0.5em',
                                }}>
                                <div
                                  style={{
                                    fontWeight: 'bold',
                                    display: 'flex',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                  }}>
                                  <div
                                    style={{
                                      flex: 1,
                                    }}>
                                    <Highlight search={this.state.searchWms}>
                                      {layer.Title}
                                    </Highlight>
                                  </div>
                                  <div>
                                    <Button
                                      color={
                                        _.has(
                                          setting.data.map.explorer,
                                          layer.Name,
                                        )
                                          ? 'grey'
                                          : 'blue'
                                      }
                                      icon={
                                        _.has(
                                          setting.data.map.explorer,
                                          layer.Name,
                                        )
                                          ? 'trash alternate outline'
                                          : 'add'
                                      }
                                      onClick={e => {
                                        e.stopPropagation();
                                        if (
                                          _.has(
                                            setting.data.map.explorer,
                                            layer.Name,
                                          )
                                        ) {
                                          rmExplorerMap(layer);
                                        } else {
                                          addExplorerMap(
                                            layer,
                                            'WMS',
                                            this.state.wms,
                                            _.values(setting.data.map.explorer)
                                              .length,
                                          );
                                        }
                                      }}
                                      size="mini"
                                    />
                                  </div>
                                </div>
                                <div
                                  style={{
                                    color: '#787878',
                                    fontSize: '0.8em',
                                  }}>
                                  {layer.queryable === true ? (
                                    <Popup
                                      content="Queryable"
                                      on="hover"
                                      trigger={
                                        <Label
                                          circular
                                          color="green"
                                          empty
                                          size="tiny"
                                          style={{
                                            marginRight: '0.5em',
                                          }}
                                        />
                                      }
                                    />
                                  ) : null}
                                  <Highlight search={this.state.searchWms}>
                                    {layer.Name}
                                  </Highlight>
                                </div>
                                <div
                                  style={{
                                    fontSize: '0.8em',
                                  }}>
                                  <Highlight search={this.state.searchWms}>
                                    {layer.Abstract}
                                  </Highlight>
                                </div>
                              </div>
                            ) : null,
                        )}
                    {this.state.wmts === null
                      ? null
                      : this.state.wmts.Contents.Layer.map((layer, idx) => {
                          return this.state.searchWmts === '' ||
                            (layer.hasOwnProperty('Title') &&
                              layer.Title.toLowerCase().search(
                                this.state.searchWmts,
                              ) >= 0) ||
                            (layer.hasOwnProperty('Abstract') &&
                              layer.Abstract.toLowerCase().search(
                                this.state.searchWmts,
                              ) >= 0) ||
                            (layer.hasOwnProperty('Identifier') &&
                              layer.Identifier.toLowerCase().search(
                                this.state.searchWmts,
                              ) >= 0) ? (
                            <div
                              className="selectable unselectable"
                              key={'wmts-list-' + idx}
                              style={{
                                padding: '0.5em',
                              }}>
                              <div
                                style={{
                                  fontWeight: 'bold',
                                  display: 'flex',
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                }}>
                                <div
                                  style={{
                                    flex: 1,
                                  }}>
                                  <Highlight search={this.state.searchWmts}>
                                    {layer.Title}
                                  </Highlight>
                                </div>
                                <div>
                                  <Button
                                    color={
                                      _.has(
                                        setting.data.map.explorer,
                                        layer.Identifier,
                                      )
                                        ? 'grey'
                                        : 'blue'
                                    }
                                    icon={
                                      _.has(
                                        setting.data.map.explorer,
                                        layer.Identifier,
                                      )
                                        ? 'trash alternate outline'
                                        : 'add'
                                    }
                                    onClick={e => {
                                      e.stopPropagation();
                                      if (
                                        _.has(
                                          setting.data.map.explorer,
                                          layer.Identifier,
                                        )
                                      ) {
                                        rmExplorerMap(layer);
                                      } else {
                                        addExplorerMap(
                                          layer,
                                          'WMTS',
                                          this.state.wmts,
                                          _.values(setting.data.map.explorer)
                                            .length,
                                        );
                                      }
                                    }}
                                    size="mini"
                                  />
                                </div>
                              </div>
                              <div
                                style={{
                                  color: '#787878',
                                  fontSize: '0.8em',
                                }}>
                                <Highlight search={this.state.searchWmts}>
                                  {layer.Identifier}
                                </Highlight>
                              </div>
                              <div
                                style={{
                                  fontSize: '0.8em',
                                }}>
                                <Highlight search={this.state.searchWmts}>
                                  {layer.Abstract}
                                </Highlight>
                              </div>
                            </div>
                          ) : null;
                        })}
                  </div>
                </div>
                <div
                  style={{
                    flex: '1 1 100%',
                    marginLeft: '1em',
                  }}>
                  <div
                    style={{
                      alignItems: 'center',
                      marginBottom: '1em',
                      display: 'flex',
                      flexDirection: 'row',
                    }}>
                    <div
                      style={{
                        flex: 1,
                      }}>
                      <TranslationText id="usersMap" />
                    </div>
                    <div>
                      <Input
                        icon="search"
                        onChange={e => {
                          this.setState({
                            searchWmtsUser: e.target.value.toLowerCase(),
                          });
                        }}
                        placeholder="Search..."
                      />
                    </div>
                  </div>
                  <div
                    style={{
                      maxHeight: '300px',
                      overflowY: 'auto',
                      flex: '1 1 100%',
                      border: 'thin solid #cecece',
                    }}>
                    {_.values(setting.data.map.explorer)
                      .sort((a, b) => {
                        if (a.position < b.position) {
                          return 1;
                        } else if (a.position > b.position) {
                          return -1;
                        }
                        return 0;
                      })
                      .map((layer, idx) =>
                        this.state.searchWmtsUser === '' ||
                        (layer.hasOwnProperty('Title') &&
                          layer.Title.toLowerCase().search(
                            this.state.searchWmtsUser,
                          ) >= 0) ||
                        (layer.hasOwnProperty('Abstract') &&
                          layer.Abstract.toLowerCase().search(
                            this.state.searchWmtsUser,
                          ) >= 0) ||
                        (layer.hasOwnProperty('Identifier') &&
                          layer.Identifier.toLowerCase().search(
                            this.state.searchWmtsUser,
                          ) >= 0) ? (
                          <div
                            className="selectable unselectable"
                            key={'wmts-list-' + idx}
                            style={{
                              padding: '0.5em',
                            }}>
                            <div
                              style={{
                                fontWeight: 'bold',
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                              }}>
                              <div
                                style={{
                                  flex: 1,
                                }}>
                                <Highlight search={this.state.searchWmtsUser}>
                                  {layer.Title}
                                </Highlight>
                              </div>
                              <div>
                                <Button
                                  color="grey"
                                  icon="trash alternate outline"
                                  onClick={e => {
                                    e.stopPropagation();
                                    if (
                                      _.has(
                                        setting.data.map.explorer,
                                        layer.Identifier,
                                      )
                                    ) {
                                      rmExplorerMap(layer);
                                    }
                                  }}
                                  size="mini"
                                />
                              </div>
                            </div>
                            <div
                              style={{
                                color: '#787878',
                                fontSize: '0.8em',
                              }}>
                              <Highlight search={this.state.searchWmtsUser}>
                                {layer.Identifier}
                              </Highlight>
                            </div>
                            <div
                              style={{
                                fontSize: '0.8em',
                              }}>
                              <Highlight search={this.state.searchWmtsUser}>
                                {layer.Abstract}
                              </Highlight>
                            </div>
                          </div>
                        ) : null,
                      )}
                  </div>
                </div>
              </div>
            </Segment>
            <Segment>
              <Checkbox
                checked={setting.data.filter.mapfilter}
                label={t('filterbymap')}
                onChange={(e, d) => {
                  toggleFilter('mapfilter', d.checked);
                }}
              />
            </Segment>
          </Segment.Group>
        ) : (
          <Divider style={{ margin: 0 }} />
        )}
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
                flexDirection: 'row',
                display: 'flex',
                cursor: 'pointer',
                backgroundColor: filter.isSelected ? '#f5f5f5' : '#fff',
                padding: 10,
              }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: 18,
                  fontWeight: 'bold',
                }}>
                <TranslationText id={filter.translationId} />
              </div>
              <div
                style={{
                  flex: 1,
                  textAlign: 'right',
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
                type={'viewer'}
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
  geocode: 'Geol',
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
      dispatch(patchSettings('appearance.explorer', mode));
    },
    addExplorerMap: (layer, type, result, position = 0) => {
      if (type === 'WMS') {
        if (!layer.CRS.includes('EPSG:2056')) {
          alert('Only EPSG:2056 is supported');
        } else {
          dispatch(
            patchSettings(
              'map.explorer',
              {
                Identifier: layer.Name,
                Abstract: layer.Abstract,
                position: position,
                Title: layer.Title,
                transparency: 0,
                type: 'WMS',
                url: result.Service.OnlineResource,
                visibility: true,
                queryable: layer.queryable,
              },
              layer.Name,
            ),
          );
        }
      } else if (type === 'WMTS') {
        const conf = optionsFromCapabilities(result, {
          layer: layer.Identifier,
          // projection: 'EPSG:2056'
        });
        if (
          conf.hasOwnProperty('matrixSet') &&
          !conf.matrixSet.includes('2056')
        ) {
          alert('Only EPSG:2056 is supported');
        } else {
          dispatch(
            patchSettings(
              'map.explorer',
              {
                Identifier: layer.Identifier,
                Abstract: layer.Abstract,
                position: position,
                Title: layer.Title,
                transparency: 0,
                type: 'WMTS',
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
      dispatch(patchSettings('map.explorer', null, config.Identifier));
    },
    patchSettings: (filter, enabled) => {
      dispatch(patchSettings(`filter.${filter}`, enabled));
    },
    handleAddItem: value => {
      dispatch({
        type: 'WMS_ADDED',
        url: value,
      });
    },
    handleOnChange: value => {
      dispatch({
        type: 'WMS_SELECTED',
        url: value,
      });
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslation('common')(ExplorerSettings));
