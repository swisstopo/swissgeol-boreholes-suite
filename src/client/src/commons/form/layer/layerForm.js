import React, { createRef } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import _ from 'lodash';

import {
  getLayer,
  patchLayer,
} from '@ist-supsi/bmsjs';

import DomainDropdown from '../domain/dropdown/domainDropdown';
import DomainTree from '../domain/tree/domainTree';
import TranslationText from '../translationText';

import {
  // Segment,
  Dimmer,
  Loader,
  Form,
  Input,
  TextArea,
  Checkbox,
} from 'semantic-ui-react';

class LayerForm extends React.Component {
  constructor(props) {
    super(props);
    this.isVisible = this.isVisible.bind(this);
    this.checkLock = this.checkLock.bind(this);
    this.updateNumber = this.updateNumber.bind(this);
    this.updateChange = this.updateChange.bind(this);
    this.patch = this.patch.bind(this);
    this.depthToRef = createRef();
    this.empty = {
      id: props.hasOwnProperty('id') ? props.id : null,
      kind: null,
      depth_from: null,
      depth_to: null,
      description: '',
      geology: '',
      last: null,
      qt_description: null,
      lithology: null,
      lithostratigraphy: null,
      chronostratigraphy: null,
      tectonic_unit: null,
      // symbol: null,
      color: [],
      plasticity: null,
      humidity: null,
      consistance: null,
      alteration: null,
      compactness: null,
      jointing: [], // hidden
      soil_state: null, // hidden
      organic_component: [],
      striae: null,
      grain_size_1: null,
      grain_size_2: null,
      grain_shape: [],
      grain_granularity: [],
      cohesion: null,
      further_properties: [],
      uscs_1: null,
      uscs_2: null,
      uscs_3: [],
      uscs_original: '',
      uscs_determination: [],
      unconrocks: null,
      debris: [],
      lithology_top_bedrock: [],
      lithok: null,
      kirost: null,
      notes: '',
    };
    this.checkattribute = false;
    this.updateAttributeDelay = {};
    this.state = {
      isFetching: false,
      isPatching: false,
      allfields: false,
      layer: {
        ...this.empty,
      },
    };
  }

  componentDidMount() {
    const { id } = this.props;
    this.load(id);
  }

  componentDidUpdate(prevProps) {
    if (this.props.id !== prevProps.id) {
      this.load(this.props.id);
    }
  }

  load(id) {
    if (_.isInteger(id)) {
      this.setState(
        {
          isFetching: true,
          layer: this.empty,
        },
        () => {
          getLayer(id)
            .then(
              function (response) {
                if (response.data.success) {
                  this.setState(
                    {
                      isFetching: false,
                      layer: response.data.data,
                    },
                    () => {
                      if (_.isNil(this.state.layer.depth_to)) {
                        this.depthToRef.current.focus();
                      }
                    },
                  );
                }
              }.bind(this),
            )
            .catch(function (error) {
              console.log(error);
            });
        },
      );
    }
  }

  checkLock() {
    if (this.props.borehole.data.role !== 'EDIT') {
      alert('Borehole status not editable');
      return false;
    }
    if (
      this.props.borehole.data.lock === null ||
      this.props.borehole.data.lock.username !== this.props.user.data.username
    ) {
      alert('Borehole not locked');
      return false;
    }
    return true;
  }

  updateNumber(attribute, value, to = true) {
    if (this.checkLock() === false) {
      return;
    }
    const state = {
      ...this.state,
      isPatching: true,
      layer: {
        ...this.state.layer,
      },
    };
    _.set(state.layer, attribute, value);

    if (value === null) {
      this.setState(state, () => {
        this.patch(attribute, value, to);
      });
    } else if (/^-?\d*[.,]?\d*$/.test(value)) {
      this.setState(state, () => {
        this.patch(attribute, _.toNumber(value), to);
      });
    }
  }

  updateChange(attribute, value, to = true) {
    if (this.checkLock() === false) {
      return;
    }
    const state = {
      ...this.state,
      isPatching: true,
      layer: {
        ...this.state.layer,
      },
    };
    _.set(state.layer, attribute, value);
    this.setState(state, () => {
      this.patch(attribute, value, to);
    });
  }

  patch(attribute, value, to = true) {
    const { onUpdated } = this.props;
    if (
      this.updateAttributeDelay.hasOwnProperty(attribute) &&
      this.updateAttributeDelay[attribute]
    ) {
      clearTimeout(this.updateAttributeDelay[attribute]);
      this.updateAttributeDelay[attribute] = false;
    }
    this.updateAttributeDelay[attribute] = setTimeout(
      function () {
        patchLayer(this.state.layer.id, attribute, value)
          .then(
            function (response) {
              if (response.data.success) {
                this.setState(
                  {
                    isPatching: false,
                  },
                  () => {
                    if (_.isFunction(onUpdated)) {
                      onUpdated(this.state.layer.id, attribute, value);
                    }
                  },
                );
              } else {
                alert(response.data.message);
                window.location.reload();
              }
            }.bind(this),
          )
          .catch(function (error) {
            console.error(error);
          });
      }.bind(this),
      to ? 500 : 0,
    );
  }

  isVisible(name, field) {
    const { conf } = this.props;
    if (
      this.state.allfields === false &&
      _.isObject(conf) &&
      _.has(conf, `fields.${name}`)
    ) {
      if (conf.fields[name] === true) {
        return field;
      }
      return null;
    }
    return field;
  }

  render() {
    const { t } = this.props;
    const size = 'small';
    // let fields = false;
    // if (conf!==null && conf.hasOwnProperty('fields')){
    //   fields = conf.fields;
    // }

    return (
      <Dimmer.Dimmable dimmed={this.state.isFetching === true}>
        <Dimmer active={this.state.isFetching === true} inverted>
          <Loader>
            {(() => {
              if (this.state.loading_fetch === true) {
                return t('loading_fetch');
              } else if (this.state.creation_fetch === true) {
                return t('creation_fetch');
              }
            })()}
          </Loader>
        </Dimmer>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            textAlign: 'right',
            whiteSpace: 'nowrap',
            justifyContent: 'space-between',
          }}>
          <TranslationText id="showallfields" />
          <Checkbox
            checked={this.state.allfields}
            onChange={(ev, data) => {
              this.setState({
                allfields: data.checked,
              });
            }}
            toggle
          />
          &nbsp;
        </div>
        <Form autoComplete="off" error size={size}>
          <Form.Field error={this.state.layer.depth_from === null} required>
            <label>
              <TranslationText id="layer_depth_from" />
            </label>
            <Input
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              onChange={e => {
                this.updateNumber(
                  'depth_from',
                  e.target.value === '' ? null : e.target.value,
                );
              }}
              spellCheck="false"
              value={
                _.isNil(this.state.layer.depth_from)
                  ? ''
                  : this.state.layer.depth_from
              }
            />
          </Form.Field>
          <Form.Field
            error={
              this.state.layer.depth_to === null ||
              (this.state.layer.depth_from !== null &&
                this.state.layer.depth_from >= this.state.layer.depth_to)
            }
            required>
            <label>
              <TranslationText id="layer_depth_to" />
            </label>
            <Input
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              onChange={e => {
                this.updateNumber(
                  'depth_to',
                  e.target.value === '' ? null : e.target.value,
                );
              }}
              ref={this.depthToRef}
              spellCheck="false"
              value={
                _.isNil(this.state.layer.depth_to)
                  ? ''
                  : this.state.layer.depth_to
              }
            />
          </Form.Field>
          {this.isVisible(
            'description',
            <Form.Field>
              <label>
                <TranslationText id="description" />
              </label>
              <TextArea
                // autoHeight
                onChange={e => {
                  this.updateChange('description', e.target.value);
                }}
                value={this.state.layer.description}
              />
            </Form.Field>,
          )}
          {this.isVisible(
            'geology',
            <Form.Field>
              <label>
                <TranslationText id="layer_geology" />
              </label>
              <TextArea
                // autoHeight
                onChange={e => {
                  this.updateChange('geology', e.target.value);
                }}
                value={this.state.layer.geology}
              />
            </Form.Field>,
          )}
          {this.isVisible(
            'last',
            <Form.Field>
              <label>
                <TranslationText id="layer_last" />
              </label>
              <Form.Group inline>
                <Form.Radio
                  checked={this.state.layer.last === true}
                  label={t('common:yes')}
                  onChange={(e, d) => {
                    this.updateChange('last', true, false);
                  }}
                />
                <Form.Radio
                  checked={this.state.layer.last === false}
                  label={t('common:no')}
                  onChange={(e, d) => {
                    this.updateChange('last', false, false);
                  }}
                />
                {this.props.developer.debug === true ? (
                  <div>
                    <div
                      style={{
                        color: 'red',
                      }}>
                      trans=yes
                    </div>
                    <div
                      style={{
                        color: 'red',
                      }}>
                      trans=no
                    </div>
                  </div>
                ) : null}
              </Form.Group>
            </Form.Field>,
          )}
          {this.isVisible(
            'qt_description',
            <Form.Field>
              <label>
                <TranslationText id="layer_qt_description" />
              </label>
              <DomainDropdown
                onSelected={selected => {
                  this.updateChange('qt_description', selected.id, false);
                }}
                schema="qt_description"
                selected={this.state.layer.qt_description}
              />
            </Form.Field>,
          )}
          {this.isVisible(
            'lithology',
            <Form.Field required>
              <label>
                <TranslationText id="layer_lithology" />
              </label>
              <DomainTree
                levels={{
                  1: 'rock',
                  2: 'process',
                  3: 'type',
                }}
                onSelected={selected => {
                  this.updateChange('lithology', selected.id, false);
                }}
                schema="custom.lithology_top_bedrock"
                selected={this.state.layer.lithology}
                title={<TranslationText id="layer_lithology" />}
              />
            </Form.Field>,
          )}
          {this.isVisible(
            'lithostratigraphy',
            <Form.Field required>
              <label>
                <TranslationText id="layer_lithostratigraphy" />
              </label>
              <DomainTree
                levels={{
                  1: 'super',
                  2: 'group',
                  3: 'subgroup',
                  4: 'superformation',
                  5: 'formation',
                }}
                onSelected={selected => {
                  this.updateChange('lithostratigraphy', selected.id, false);
                }}
                schema="custom.lithostratigraphy_top_bedrock"
                selected={this.state.layer.lithostratigraphy}
                title={<TranslationText id="layer_lithostratigraphy" />}
              />
            </Form.Field>,
          )}
          {this.isVisible(
            'chronostratigraphy',
            <Form.Field>
              <label>
                <TranslationText id="layer_chronostratigraphy" />
              </label>
              {/* <DomainDropdown
                  onSelected={(selected)=>{
                    this.updateChange(
                      'chronostratigraphy', selected.id, false
                    );
                  }}
                  schema='custom.chronostratigraphy_top_bedrock'
                  selected={this.state.layer.chronostratigraphy}
                /> */}
              <DomainTree
                levels={{
                  1: '1st_order_eon',
                  2: '2nd_order_era',
                  3: '3rd_order_period',
                  4: '4th_order_epoch',
                  5: '5th_order_sub_epoch',
                  6: '6th_order_sub_stage',
                }}
                onSelected={selected => {
                  this.updateChange('chronostratigraphy', selected.id, false);
                }}
                schema="custom.chronostratigraphy_top_bedrock"
                selected={this.state.layer.chronostratigraphy}
                title={<TranslationText id="layer_chronostratigraphy" />}
              />
            </Form.Field>,
          )}
          {
            // this.isVisible(
            //   'tectonic_unit',
            //   <Form.Field>
            //     <label>{t('tectonic_unit')}</label>
            //     <DomainDropdown
            //       onSelected={(selected)=>{
            //         this.updateChange(
            //           'tectonic_unit', selected.id, false
            //         );
            //       }}
            //       schema='vtec400'
            //       selected={this.state.layer.tectonic_unit}
            //     />
            //   </Form.Field>
            // )
          }
          {this.isVisible(
            'color',
            <Form.Field>
              <label>
                <TranslationText id="layer_color" />
              </label>
              <DomainDropdown
                multiple
                onSelected={selected => {
                  this.updateChange(
                    'color',
                    selected.map(mlpr => mlpr.id),
                    false,
                  );
                }}
                schema="mlpr112"
                search
                selected={this.state.layer.color}
              />
            </Form.Field>,
          )}
          {this.isVisible(
            'plasticity',
            <Form.Field>
              <label>
                <TranslationText id="layer_plasticity" />
              </label>
              <DomainDropdown
                onSelected={selected => {
                  this.updateChange('plasticity', selected.id, false);
                }}
                schema="mlpr101"
                selected={this.state.layer.plasticity}
              />
            </Form.Field>,
          )}
          {this.isVisible(
            'humidity',
            <Form.Field>
              <label>
                <TranslationText id="layer_humidity" />
              </label>
              <DomainDropdown
                onSelected={selected => {
                  this.updateChange('humidity', selected.id, false);
                }}
                schema="mlpr105"
                selected={this.state.layer.humidity}
              />
            </Form.Field>,
          )}
          {this.isVisible(
            'consistance',
            <Form.Field>
              <label>
                <TranslationText id="layer_consistance" />
              </label>
              <DomainDropdown
                onSelected={selected => {
                  this.updateChange('consistance', selected.id, false);
                }}
                schema="mlpr103"
                selected={this.state.layer.consistance}
              />
            </Form.Field>,
          )}
          {this.isVisible(
            'alteration',
            <Form.Field>
              <label>
                <TranslationText id="layer_alteration" />
              </label>
              <DomainDropdown
                onSelected={selected => {
                  this.updateChange('alteration', selected.id, false);
                }}
                schema="mlpr106"
                selected={this.state.layer.alteration}
              />
            </Form.Field>,
          )}
          {this.isVisible(
            'compactness',
            <Form.Field>
              <label>
                <TranslationText id="layer_compactness" />
              </label>
              <DomainDropdown
                onSelected={selected => {
                  this.updateChange('compactness', selected.id, false);
                }}
                schema="mlpr102"
                selected={this.state.layer.compactness}
              />
            </Form.Field>,
          )}
          {
            // this.isVisible(
            //   'jointing',
            //   <Form.Field>
            //     <label>{t('jointing')}</label>
            //     <DomainDropdown
            //       multiple
            //       onSelected={(selected)=>{
            //         this.updateChange(
            //           'jointing',
            //           selected.map(jng=>jng.id),
            //           false
            //         );
            //       }}
            //       schema='mlpr113'
            //       search
            //       selected={this.state.layer.jointing}
            //     />
            //   </Form.Field>
            // )
          }
          {
            // this.isVisible(
            //   'soil_state',
            //   <Form.Field>
            //     <label>{t('soil_state')}</label>
            //     <DomainDropdown
            //       onSelected={(selected)=>{
            //         this.updateChange(
            //           'soil_state', selected.id, false
            //         );
            //       }}
            //       schema='mlpr108'
            //       selected={this.state.layer.soil_state}
            //     />
            //   </Form.Field>
            // )
          }
          {this.isVisible(
            'organic_component',
            <Form.Field>
              <label>
                <TranslationText id="layer_organic_component" />
              </label>
              <DomainDropdown
                multiple
                onSelected={selected => {
                  this.updateChange(
                    'organic_component',
                    selected.map(jng => jng.id),
                    false,
                  );
                }}
                schema="mlpr108"
                search
                selected={this.state.layer.organic_component}
              />
            </Form.Field>,
          )}
          {this.isVisible(
            'striae',
            <Form.Field>
              <label>
                <TranslationText id="layer_striae" />
              </label>
              <Form.Group inline>
                <Form.Radio
                  checked={this.state.layer.striae === true}
                  label={t('common:yes')}
                  onChange={(e, d) => {
                    this.updateChange('striae', true, false);
                  }}
                />
                <Form.Radio
                  checked={this.state.layer.striae === false}
                  label={t('common:no')}
                  onChange={(e, d) => {
                    this.updateChange('striae', false, false);
                  }}
                />
                {this.props.developer.debug === true ? (
                  <div>
                    <div
                      style={{
                        color: 'red',
                      }}>
                      trans=yes
                    </div>
                    <div
                      style={{
                        color: 'red',
                      }}>
                      trans=no
                    </div>
                  </div>
                ) : null}
              </Form.Group>
            </Form.Field>,
          )}
          {this.isVisible(
            'grain_size_1',
            <Form.Field>
              <label>
                <TranslationText id="layer_grain_size_1" />
              </label>
              <DomainDropdown
                onSelected={selected => {
                  this.updateChange('grain_size_1', selected.id, false);
                }}
                schema="mlpr109"
                selected={this.state.layer.grain_size_1}
              />
            </Form.Field>,
          )}
          {this.isVisible(
            'grain_size_2',
            <Form.Field>
              <label>
                <TranslationText id="layer_grain_size_2" />
              </label>
              <DomainDropdown
                onSelected={selected => {
                  this.updateChange('grain_size_2', selected.id, false);
                }}
                schema="mlpr109"
                selected={this.state.layer.grain_size_2}
              />
            </Form.Field>,
          )}
          {this.isVisible(
            'grain_shape',
            <Form.Field>
              <label>
                <TranslationText id="layer_grain_shape" />
              </label>
              <DomainDropdown
                multiple
                onSelected={selected => {
                  this.updateChange(
                    'grain_shape',
                    selected.map(gsh => gsh.id),
                    false,
                  );
                }}
                schema="mlpr110"
                search
                selected={this.state.layer.grain_shape}
              />
            </Form.Field>,
          )}
          {this.isVisible(
            'grain_granularity',
            <Form.Field>
              <label>
                <TranslationText id="layer_grain_granularity" />
              </label>
              <DomainDropdown
                multiple
                onSelected={selected => {
                  this.updateChange(
                    'grain_granularity',
                    selected.map(ggr => ggr.id),
                    false,
                  );
                }}
                schema="mlpr115"
                search
                selected={this.state.layer.grain_granularity}
              />
            </Form.Field>,
          )}
          {this.isVisible(
            'cohesion',
            <Form.Field>
              <label>
                <TranslationText id="layer_cohesion" />
              </label>
              <DomainDropdown
                onSelected={selected => {
                  this.updateChange('cohesion', selected.id, false);
                }}
                schema="mlpr116"
                selected={this.state.layer.cohesion}
              />
            </Form.Field>,
          )}
          {this.isVisible(
            'further_properties',
            <Form.Field>
              <label>
                <TranslationText id="layer_further_properties" />
              </label>
              <DomainDropdown
                multiple
                onSelected={selected => {
                  this.updateChange(
                    'further_properties',
                    selected.map(ftp => ftp.id),
                    false,
                  );
                }}
                schema="mlpr117"
                search
                selected={this.state.layer.further_properties}
              />
            </Form.Field>,
          )}
          {this.isVisible(
            'uscs_1',
            <Form.Field>
              <label>
                <TranslationText id="layer_uscs_1" />
              </label>
              <DomainDropdown
                onSelected={selected => {
                  this.updateChange('uscs_1', selected.id, false);
                }}
                schema="mcla101"
                selected={this.state.layer.uscs_1}
              />
            </Form.Field>,
          )}
          {this.isVisible(
            'uscs_2',
            <Form.Field>
              <label>
                <TranslationText id="layer_uscs_2" />
              </label>
              <DomainDropdown
                onSelected={selected => {
                  this.updateChange('uscs_2', selected.id, false);
                }}
                schema="mcla101"
                selected={this.state.layer.uscs_2}
              />
            </Form.Field>,
          )}
          {this.isVisible(
            'uscs_3',
            <Form.Field>
              <label>
                <TranslationText id="layer_uscs_3" />
              </label>
              <DomainDropdown
                multiple
                onSelected={selected => {
                  this.updateChange(
                    'uscs_3',
                    selected.map(ftp => ftp.id),
                    false,
                  );
                }}
                schema="mcla101"
                search
                selected={this.state.layer.uscs_3}
              />
            </Form.Field>,
          )}
          {this.isVisible(
            'uscs_original',
            <Form.Field>
              <label>
                <TranslationText id="layer_uscs_original" />
              </label>
              <Input
                autoCapitalize="off"
                autoComplete="off"
                autoCorrect="off"
                onChange={e => {
                  this.updateChange('uscs_original', e.target.value);
                }}
                spellCheck="false"
                value={this.state.layer.uscs_original}
              />
            </Form.Field>,
          )}
          {this.isVisible(
            'uscs_determination',
            <Form.Field>
              <label>
                <TranslationText id="layer_uscs_determination" />
              </label>
              <DomainDropdown
                multiple
                onSelected={selected => {
                  this.updateChange(
                    'uscs_determination',
                    selected.map(ftp => ftp.id),
                    false,
                  );
                }}
                schema="mcla104"
                search
                selected={this.state.layer.uscs_determination}
              />
            </Form.Field>,
          )}
          {/*<Form.Field>
            <label>{t('unconrocks')}</label>
            <DomainDropdown
              schema='mcla102'
              selected={this.state.layer.unconrocks}
              onSelected={(selected)=>{
                this.updateChange(
                  'unconrocks', selected.id, false
                )
              }}/>
          </Form.Field>
          */}
          {this.isVisible(
            'debris',
            <Form.Field>
              <label>
                <TranslationText id="layer_debris" />
              </label>
              <DomainDropdown
                multiple
                onSelected={selected => {
                  this.updateChange(
                    'debris',
                    selected.map(gsh => gsh.id),
                    false,
                  );
                }}
                schema="mcla107"
                search
                selected={this.state.layer.debris}
              />
            </Form.Field>,
          )}
          {this.isVisible(
            'lithology_top_bedrock',
            <Form.Field>
              <label>
                <TranslationText id="layer_lithology_top_bedrock" />
              </label>
              <DomainDropdown
                multiple
                onSelected={selected => {
                  this.updateChange(
                    'lithology_top_bedrock',
                    selected.map(gsh => gsh.id),
                    false,
                  );
                }}
                schema="custom.lithology_top_bedrock"
                search
                selected={this.state.layer.lithology_top_bedrock}
              />
            </Form.Field>,
          )}
          {/*
            <Form.Field>
              <label>{t('lithok')}</label>
              <DomainDropdown
                schema='mcla105'
                selected={this.state.layer.lithok}
                onSelected={(selected)=>{
                  this.updateChange(
                    'lithok', selected.id, false
                  )
                }}/>
            </Form.Field>
            <Form.Field>
              <label>{t('kirost')}</label>
              <DomainDropdown
                schema='mcla106'
                selected={this.state.layer.kirost}
                onSelected={(selected)=>{
                  this.updateChange(
                    'kirost', selected.id, false
                  )
                }}/>
            </Form.Field>
            */}
          {this.isVisible(
            'notes',
            <Form.Field>
              <label>
                <TranslationText id="remarks" />
              </label>
              <TextArea
                // autoHeight
                onChange={e => {
                  this.updateChange('notes', e.target.value);
                }}
                value={this.state.layer.notes}
              />
            </Form.Field>,
          )}
        </Form>
      </Dimmer.Dimmable>
    );
  }
}

LayerForm.propTypes = {
  borehole: PropTypes.object,
  conf: PropTypes.object,
  developer: PropTypes.shape({
    debug: PropTypes.bool,
  }),
  id: PropTypes.number,
  onUpdated: PropTypes.func,
  user: PropTypes.object,
};

LayerForm.defaultProps = {
  id: undefined,
  conf: {},
};

const mapStateToProps = state => {
  return {
    developer: state.developer,
  };
};

export default connect(
  mapStateToProps,
  null,
)(withTranslation('common')(LayerForm));
