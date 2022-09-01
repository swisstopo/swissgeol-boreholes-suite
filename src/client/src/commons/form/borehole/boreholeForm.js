import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import _ from 'lodash';
import moment from 'moment';

import { Route, Switch, withRouter } from 'react-router-dom';

import {
  addIdentifier,
  removeIdentifier,
  updateBorehole,
  loadBorehole,
  checkBorehole,
  patchBorehole,
} from '../../../lib/index';

import PointComponent from '../../map/pointComponent';
import DomainDropdown from '../domain/dropdown/domainDropdown';
import DomainTree from '../domain/tree/domainTree';
import MunicipalityDropdown from '../municipality/dropdown/municipalityDropdown';
import DateField from '../dateField';
import DomainText from '../domain/domainText';
import EditorBoreholeFilesTable from '../../files/table/editorBoreholeFilesTable';
import TranslationText from '../translationText';

import {
  Form,
  Input,
  Segment,
  Message,
  Dimmer,
  Loader,
  // Progress,
  TextArea,
  Icon,
} from 'semantic-ui-react';
import Profile from '../profile';

class BoreholeForm extends React.Component {
  constructor(props) {
    super(props);
    this.checkattribute = false;
    this.updateAttributeDelay = {};
    this.state = {
      tab: 0,
      loadingFetch: false,
      patchFetch: false,
      creationFetch: false,
      'extended.original_name_check': true,
      'extended.original_name_fetch': false,
      'custom.alternate_name_check': true,
      'custom.alternate_name_fetch': false,

      identifier: null,
      identifierValue: '',

      // Stratigraphy
      newStartModal: false,
      stratigraphy_id: null,
      layer: null,
      layers: [],
      layerUpdated: null,

      // Finish
      note: '',
    };
    this.loadOrCreate = this.loadOrCreate.bind(this);
    this.check = this.check.bind(this);
    this.checkLock = this.checkLock.bind(this);
    this.isNumber = this.isNumber.bind(this);
    this.updateNumber = this.updateNumber.bind(this);
    this.updateChange = this.updateChange.bind(this);
    this.patch = this.patch.bind(this);
  }

  componentDidMount() {
    const { match } = this.props;
    if (!_.isNil(match.params.id)) {
      this.loadOrCreate(parseInt(match.params.id, 10));
    }
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.match.params.id !== null &&
      this.props.match.params.id !== prevProps.match.params.id
    ) {
      this.loadOrCreate(parseInt(this.props.match.params.id, 10));
    }
  }

  // componentWillUnmount() {
  //   const {
  //     borehole,
  //     user,
  //   } = this.props;
  //   if (
  //     borehole.data.lock === null
  //     || borehole.data.lock.username === user.data.username
  //   ){
  //     this.props.unlockBorehole(
  //       borehole.data.id
  //     );
  //   }
  // }

  loadOrCreate(id) {
    const self = this;
    if (_.isInteger(id)) {
      // request to edit a borehole
      this.setState(
        {
          loadingFetch: true,
          stratigraphy_id: null,
          layers: [],
          layer: null,
          borehole: this.empty,
        },
        () => {
          this.props
            .getBorehole(id)
            .then(response => {
              if (response.success) {
                self.setState({
                  loadingFetch: false,
                  stratigraphy_id:
                    _.isArray(response.data.stratigraphy) &&
                    response.data.stratigraphy.length > 0
                      ? response.data.stratigraphy[0].id
                      : null,
                });
              }
            })
            .catch(function (error) {
              console.log(error);
            });
        },
      );
    }
  }

  check(attribute, value) {
    if (this.props.borehole.data.role !== 'EDIT') {
      alert(`Borehole status (${this.props.borehole.data.role}) not editable`);
      return;
    }
    if (
      this.props.borehole.data.lock === null ||
      this.props.borehole.data.lock.username !== this.props.user.data.username
    ) {
      alert('Borehole not locked');
      return;
    }
    // Check for uniqueness and patch
    const state = {
      ...this.state,
      patchFetch: true,
    };

    const borehole = {
      ...this.props.borehole.data,
    };
    _.set(borehole, attribute, value);
    state[attribute + '_fetch'] = true;

    // update state
    this.setState(state, () => {
      if (this.checkattribute) {
        clearTimeout(this.checkattribute);
        this.checkattribute = false;
      }
      // this.props.updateBorehole(borehole);

      this.checkattribute = setTimeout(() => {
        checkBorehole(attribute, value)
          .then(response => {
            if (response.data.success) {
              let state = {};
              state[attribute + '_check'] = response.data.check;
              state[attribute + '_fetch'] = false;
              this.setState(state);
              if (response.data.check) {
                // patch attribute
                patchBorehole(borehole.id, attribute, value)
                  .then(response => {
                    if (response.data.success) {
                      this.setState(
                        {
                          patchFetch: false,
                        },
                        () => {
                          borehole.percentage = response.data.percentage;
                          borehole.lock = response.data.lock;
                          borehole.updater = response.data.updater;
                          this.props.updateBorehole(borehole);
                        },
                      );
                    } else if (response.status === 200) {
                      alert(response.data.message);
                      if (response.data.error === 'E-900') {
                        this.setState(
                          {
                            patchFetch: false,
                          },
                          () => {
                            borehole.lock = null;
                            this.props.updateBorehole(borehole);
                          },
                        );
                      } else {
                        window.location.reload();
                      }
                    }
                  })
                  .catch(error => {
                    console.error(error);
                  });
              }
            }
          })
          .catch(function (error) {
            console.error(error);
          });
      }, 250);
    });
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

  isNumber(value) {
    return /^-?\d*[.,]?\d*$/.test(value);
  }

  updateNumber(attribute, value, to = true) {
    if (this.checkLock() === false) {
      return;
    }
    const state = {
      ...this.state,
      patchFetch: true,
    };
    const borehole = {
      ...this.props.borehole,
    };
    _.set(borehole.data, attribute, value);

    if (value === null) {
      this.setState(state, () => {
        this.patch(borehole.data, attribute, value, to);
      });
    } else if (/^-?\d*[.,]?\d*$/.test(value)) {
      this.setState(state, () => {
        this.patch(borehole.data, attribute, _.toNumber(value), to);
      });
    }
  }

  updateChange(attribute, value, to = true) {
    if (this.checkLock() === false) {
      return;
    }
    const state = {
      ...this.state,
      patchFetch: true,
    };
    const borehole = {
      ...this.props.borehole,
    };
    if (attribute === 'location') {
      if (!this.isNumber(value[0])) {
        return;
      }
      if (!this.isNumber(value[1])) {
        return;
      }
      _.set(borehole.data, 'location_x', value[0]);
      _.set(borehole.data, 'location_y', value[1]);
      _.set(borehole.data, 'custom.canton', value[2]);
      _.set(borehole.data, 'custom.city', value[3]);
      if (value[4] !== null) {
        if (!this.isNumber(value[4])) {
          return;
        }
        _.set(borehole.data, 'elevation_z', value[4]);
      }
    } else if (attribute === 'geocoding') {
      _.set(borehole.data, 'custom.canton', value[0]);
      _.set(borehole.data, 'custom.city', value[1]);
    } else {
      _.set(borehole.data, attribute, value);
    }
    this.setState(state, () => {
      this.patch(borehole.data, attribute, value, to);
    });
  }

  patch(borehole, attribute, value, to = true) {
    // this.props.updateBorehole(borehole);
    if (
      this.updateAttributeDelay.hasOwnProperty(attribute) &&
      this.updateAttributeDelay[attribute]
    ) {
      clearTimeout(this.updateAttributeDelay[attribute]);
      this.updateAttributeDelay[attribute] = false;
    }
    this.updateAttributeDelay[attribute] = setTimeout(
      () => {
        patchBorehole(borehole.id, attribute, value)
          .then(response => {
            if (response.data.success) {
              this.setState(
                {
                  patchFetch: false,
                },
                () => {
                  borehole.percentage = response.data.percentage;
                  borehole.lock = response.data.lock;
                  borehole.updater = response.data.updater;
                  if (response.data.location) {
                    borehole.custom.canton = response.data.location.canton;
                    borehole.custom.city = response.data.location.city;
                  }
                  this.props.updateBorehole(borehole);
                },
              );
            } else if (response.status === 200) {
              alert(response.data.message);
              if (response.data.error === 'errorLocked') {
                this.setState(
                  {
                    patchFetch: false,
                  },
                  () => {
                    borehole.lock = null;
                    this.props.updateBorehole(borehole);
                  },
                );
              } else {
                window.location.reload();
              }
            }
          })
          .catch(error => {
            console.error(error);
          });
      },
      to ? 500 : 0,
    );
  }

  render() {
    const { t, workflow } = this.props;

    if (this.props.borehole.error !== null) {
      return (
        <div>{t(this.props.borehole.error, this.props.borehole.data)}</div>
      );
    }

    const borehole = this.props.borehole.data;
    const size = null; // 'small'

    // Handle highlithing of mentions in comments
    const mentions =
      workflow.previous !== null ? workflow.previous.mentions : [];

    return (
      <Dimmer.Dimmable
        as={'div'}
        dimmed={
          this.props.borehole.isFetching === true ||
          this.state.loadingFetch === true ||
          this.state.creationFetch === true
        }
        style={{
          flex: 1,
          overflowY: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}>
        <Dimmer
          active={
            this.props.borehole.isFetching === true ||
            this.state.loadingFetch === true ||
            this.state.creationFetch === true
          }
          inverted>
          <Loader>
            {(() => {
              if (
                this.props.borehole.isFetching ||
                this.state.loadingFetch === true
              ) {
                return <TranslationText id="layer_loading_fetch" />;
              } else if (this.state.creationFetch === true) {
                return <TranslationText id="layer_creation_fetch" />;
              }
            })()}
          </Loader>
        </Dimmer>
        <Switch>
          <Route
            exact
            path={process.env.PUBLIC_URL + '/editor/:id'}
            render={() => (
              <div
                style={{
                  flex: '1 1 0%',
                  padding: '1em',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                }}>
                <Segment>
                  <div
                    className="flex_row bdms_bold"
                    style={{
                      borderBottom: 'thin solid #d2d2d2',
                      paddingBottom: '0.4em',
                    }}>
                    <div className="flex_fill">
                      <TranslationText id="borehole_identifier" />
                    </div>
                    <div className="flex_fill">
                      <TranslationText id="borehole_identifier_value" />
                    </div>
                    <div>
                      {this.props.borehole.data.lock !== null ? (
                        <TranslationText id="delete" />
                      ) : null}
                    </div>
                  </div>
                  {borehole.custom.identifiers
                    ? borehole.custom.identifiers.map((identifier, idx) => (
                        <div
                          className="flex_row"
                          key={'bhfbi-' + idx}
                          style={{
                            paddingTop: '0.5em',
                          }}>
                          <div className="flex_fill">
                            <DomainText
                              id={identifier.id}
                              schema="borehole_identifier"
                            />
                          </div>
                          <div className="flex_fill">{identifier.value}</div>
                          <div>
                            {this.props.borehole.data.lock !== null ? (
                              <div
                                className="linker"
                                onClick={() => {
                                  removeIdentifier(
                                    borehole.id,
                                    identifier.id,
                                  ).then(response => {
                                    if (response.data.success) {
                                      const tmp = _.cloneDeep(borehole);
                                      if (tmp.custom.identifiers.length === 1) {
                                        tmp.custom.identifiers = [];
                                      } else {
                                        tmp.custom.identifiers =
                                          tmp.custom.identifiers.filter(
                                            el => el.id !== identifier.id,
                                          );
                                      }
                                      this.props.updateBorehole(tmp);
                                    }
                                  });
                                }}>
                                <TranslationText id="delete" />
                              </div>
                            ) : null}
                          </div>
                        </div>
                      ))
                    : null}
                  {this.props.borehole.data.lock !== null ? (
                    <Form autoComplete="off" size="tiny">
                      <Form.Group widths="equal">
                        <Form.Field
                          error={
                            this.state.identifier === null &&
                            borehole?.custom?.identifiers?.length === 0
                          }>
                          <label>&nbsp;</label>
                          <DomainDropdown
                            // exclude={
                            //   this.props.borehole.data.custom.identifiers?
                            //   this.props.borehole.data.custom.identifiers.map(el => el.id): []
                            // }
                            onSelected={selected => {
                              this.setState({
                                identifier: selected.id,
                              });
                            }}
                            schema="borehole_identifier"
                            selected={this.state.identifier}
                          />
                        </Form.Field>
                        <Form.Field
                          error={
                            this.state.identifierValue === '' &&
                            borehole?.custom?.identifiers?.length === 0
                          }>
                          <label>&nbsp;</label>
                          <Input
                            autoCapitalize="off"
                            autoComplete="off"
                            autoCorrect="off"
                            onChange={e => {
                              this.setState({
                                identifierValue: e.target.value,
                              });
                            }}
                            spellCheck="false"
                            value={this.state.identifierValue ?? ''}
                          />
                        </Form.Field>
                        <div
                          style={{
                            flex: '0 0 0% !important',
                          }}>
                          <Form.Button
                            disabled={
                              this.state.identifier === null ||
                              this.state.identifierValue === ''
                            }
                            icon
                            label="&nbsp;"
                            onClick={() => {
                              // Check duplicate
                              const alreadySet = borehole.custom.identifiers
                                ? borehole.custom.identifiers.map(el => el.id)
                                : [];

                              if (alreadySet.includes(this.state.identifier)) {
                                alert(t('msgIdentifierAlreadyUsed'));
                              } else {
                                addIdentifier(
                                  borehole.id,
                                  this.state.identifier,
                                  this.state.identifierValue,
                                ).then(response => {
                                  if (response.data.success) {
                                    this.setState(
                                      {
                                        identifier: null,
                                        identifierValue: '',
                                      },
                                      () => {
                                        const tmp = _.cloneDeep(borehole);
                                        if (tmp.custom.identifiers === null) {
                                          tmp.custom.identifiers = [];
                                        }
                                        tmp.custom.identifiers.push(
                                          response.data.data,
                                        );
                                        this.props.updateBorehole(tmp);
                                      },
                                    );
                                  }
                                });
                              }
                            }}
                            secondary
                            size="tiny">
                            <Icon name="plus" />
                          </Form.Button>
                        </div>
                      </Form.Group>
                    </Form>
                  ) : null}
                </Segment>
                <Segment>
                  <Form autoComplete="off" error size={size}>
                    <Form.Group widths="equal">
                      <Form.Field
                        error={
                          borehole.extended.original_name === '' ||
                          (this.state['extended.original_name_check'] ===
                            false &&
                            this.state['extended.original_name_fetch'] ===
                              false) ||
                          mentions.indexOf('original_name') >= 0
                        }
                        required>
                        <label>
                          <TranslationText id="original_name" />
                        </label>
                        <Input
                          autoCapitalize="off"
                          autoComplete="off"
                          autoCorrect="off"
                          icon={
                            this.state['extended.original_name_check'] ===
                              true &&
                            this.state['extended.original_name_fetch'] === false
                              ? 'check'
                              : 'delete'
                          }
                          iconPosition="left"
                          loading={this.state['extended.original_name_fetch']}
                          onChange={e => {
                            this.check(
                              'extended.original_name',
                              e.target.value,
                            );
                          }}
                          spellCheck="false"
                          value={borehole.extended.original_name ?? ''}
                        />
                      </Form.Field>
                      <Form.Field error={mentions.indexOf('project_name') >= 0}>
                        <label>
                          <TranslationText id="project_name" />
                        </label>
                        <Input
                          autoCapitalize="off"
                          autoComplete="off"
                          autoCorrect="off"
                          onChange={e => {
                            this.updateChange(
                              'custom.project_name',
                              e.target.value,
                            );
                          }}
                          spellCheck="false"
                          value={borehole.custom.project_name ?? ''}
                        />
                      </Form.Field>
                    </Form.Group>
                    {this.state['extended.original_name_check'] === false &&
                    this.state['extended.original_name_fetch'] === false ? (
                      <Message
                        content={
                          <div>
                            <TranslationText id="original_name" />
                            {', '}
                            <TranslationText id="duplicate" />
                          </div>
                        }
                        error
                        size={size}
                      />
                    ) : null}
                    <Form.Group widths="equal">
                      <Form.Field>
                        <label>
                          <TranslationText id="alternate_name" />
                        </label>
                        <Input
                          autoCapitalize="off"
                          autoComplete="off"
                          autoCorrect="off"
                          icon={
                            this.state['custom.alternate_name_check'] ===
                              true &&
                            this.state['custom.alternate_name_fetch'] === false
                              ? 'check'
                              : 'delete'
                          }
                          iconPosition="left"
                          loading={this.state.alternate_name_fetch}
                          onChange={e => {
                            this.check('custom.alternate_name', e.target.value);
                          }}
                          spellCheck="false"
                          value={borehole.custom.alternate_name ?? ''}
                        />
                      </Form.Field>
                      {/* drilling type in Location */}
                      {/* <Form.Field
                        error={
                          borehole.kind === null ||
                          mentions.indexOf('kind') >= 0
                        }
                        required>
                        <label>
                          <TranslationText id="kind" />
                        </label>
                        <DomainDropdown
                          onSelected={selected => {
                            this.updateChange('kind', selected.id, false);
                          }}
                          schema="kind"
                          selected={borehole.kind}
                        />
                      </Form.Field> */}
                    </Form.Group>
                  </Form>
                </Segment>
                <Segment>
                  <Form size={size}>
                    <Form.Group widths="equal">
                      <Form.Field
                        error={
                          mentions.indexOf('restriction') >= 0 ||
                          borehole.restriction === null
                        }
                        required>
                        <label>
                          <TranslationText id="restriction" />
                        </label>
                        <DomainDropdown
                          onSelected={selected => {
                            this.updateChange(
                              'restriction',
                              selected.id,
                              false,
                            );
                          }}
                          schema="restriction"
                          selected={borehole.restriction}
                        />
                      </Form.Field>
                      <Form.Field
                        error={
                          (borehole.restriction === 20111003 &&
                            !moment(borehole.restriction_until).isValid()) ||
                          (borehole.restriction !== 20111003 &&
                            _.isString(borehole.restriction_until) &&
                            borehole.restriction_until !== '' &&
                            moment(borehole.restriction_until).isValid()) ||
                          mentions.indexOf('restriction_until') >= 0
                        }
                        required={borehole.restriction === 20111003}>
                        <label>
                          <TranslationText id="restriction_until" />
                        </label>
                        <DateField
                          date={borehole.restriction_until}
                          onChange={selected => {
                            this.updateChange(
                              'restriction_until',
                              selected,
                              false,
                            );
                          }}
                        />
                      </Form.Field>
                    </Form.Group>
                  </Form>
                </Segment>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                  }}>
                  <div
                    style={{
                      flex: '1',
                    }}>
                    <Segment>
                      <Form size={size}>
                        <Form.Group widths="equal">
                          <Form.Field
                            error={mentions.indexOf('srs') >= 0}
                            // required
                          >
                            <label>
                              <TranslationText id="srs" />
                            </label>
                            <div
                              style={{
                                height: '36px',
                                display: 'flex',
                                alignItems: 'center',
                              }}>
                              <div>
                                <DomainText id={borehole.srs} schema="srs" />
                              </div>
                            </div>
                          </Form.Field>
                          <Form.Field
                            error={mentions.indexOf('qt_location') >= 0}
                            required>
                            <label>
                              <TranslationText id="qt_location" />
                            </label>
                            <DomainDropdown
                              onSelected={selected => {
                                this.updateChange(
                                  'qt_location',
                                  selected.id,
                                  false,
                                );
                              }}
                              schema="qt_location"
                              selected={borehole.qt_location}
                            />
                          </Form.Field>
                        </Form.Group>
                        <Form.Group widths="equal">
                          <Form.Field
                            error={
                              mentions.indexOf('location_x') >= 0 ||
                              borehole.location_x < 2485869.5728 ||
                              borehole.location_x > 2837076.5648
                            }
                            required>
                            <label>
                              <TranslationText id="location_x" />
                            </label>
                            <Input
                              autoCapitalize="off"
                              autoComplete="off"
                              autoCorrect="off"
                              disabled={borehole.srs === null}
                              onChange={e => {
                                this.updateNumber(
                                  'location_x',
                                  e.target.value === '' ? null : e.target.value,
                                );
                              }}
                              spellCheck="false"
                              value={
                                _.isNil(borehole.location_x)
                                  ? ''
                                  : borehole.location_x
                              }
                            />
                          </Form.Field>
                          <Form.Field
                            error={
                              mentions.indexOf('location_y') >= 0 ||
                              borehole.location_y < 1076443.1884 ||
                              borehole.location_y > 1299941.7864
                            }
                            required>
                            <label>
                              <TranslationText id="location_y" />
                            </label>
                            <Input
                              autoCapitalize="off"
                              autoComplete="off"
                              autoCorrect="off"
                              disabled={borehole.srs === null}
                              onChange={e => {
                                this.updateNumber(
                                  'location_y',
                                  e.target.value === '' ? null : e.target.value,
                                );
                                // if (/^-?\d*[.,]?\d*$/.test(e.target.value)){
                                //   this.updateChange(
                                //     'location_y',
                                //     e.target.value === '' ?
                                //       null : _.toNumber(e.target.value)
                                //   );
                                // }
                              }}
                              spellCheck="false"
                              value={
                                _.isNil(borehole.location_y)
                                  ? ''
                                  : borehole.location_y
                              }
                            />
                          </Form.Field>
                        </Form.Group>
                        <Form.Group widths="equal">
                          <Form.Field
                            error={
                              mentions.indexOf('elevation_z') >= 0 ||
                              _.isNil(borehole.elevation_z)
                            }
                            required>
                            <label>
                              <TranslationText id="elevation_z" />
                            </label>
                            <Input
                              autoCapitalize="off"
                              autoComplete="off"
                              autoCorrect="off"
                              onChange={e => {
                                this.updateNumber(
                                  'elevation_z',
                                  e.target.value === '' ? null : e.target.value,
                                );

                                // if (/^-?\d*[.,]?\d*$/.test(e.target.value)){
                                //   this.updateChange(
                                //     'elevation_z',
                                //     e.target.value === '' ?
                                //       null : _.toNumber(e.target.value)
                                //   );
                                // }
                              }}
                              spellCheck="false"
                              value={
                                _.isNil(borehole.elevation_z)
                                  ? ''
                                  : '' + borehole.elevation_z
                              }
                            />
                          </Form.Field>

                          <Form.Field
                            error={mentions.indexOf('qt_elevation') >= 0}
                            required>
                            <label>
                              <TranslationText id="qt_elevation" />
                            </label>
                            <DomainDropdown
                              onSelected={selected => {
                                this.updateChange(
                                  'qt_elevation',
                                  selected.id,
                                  false,
                                );
                              }}
                              schema="qt_elevation"
                              selected={borehole.qt_elevation}
                            />
                          </Form.Field>
                        </Form.Group>
                        <Form.Group widths="equal">
                          <Form.Field
                            error={
                              mentions.indexOf('reference_elevation') >= 0 ||
                              _.isNil(borehole.reference_elevation)
                            }
                            required>
                            <label>
                              <TranslationText id="reference_elevation" />
                            </label>
                            <Input
                              autoCapitalize="off"
                              autoComplete="off"
                              autoCorrect="off"
                              onChange={e => {
                                this.updateNumber(
                                  'reference_elevation',
                                  e.target.value === '' ? null : e.target.value,
                                );

                                if (/^-?\d*[.,]?\d*$/.test(e.target.value)) {
                                  this.updateChange(
                                    'reference_elevation',
                                    e.target.value === ''
                                      ? null
                                      : _.toNumber(e.target.value),
                                  );
                                }
                              }}
                              spellCheck="false"
                              value={
                                _.isNil(borehole.reference_elevation)
                                  ? ''
                                  : '' + borehole.reference_elevation
                              }
                            />
                          </Form.Field>
                          <Form.Field
                            error={
                              mentions.indexOf('qt_reference_elevation') >= 0
                            }
                            required>
                            <label>
                              <TranslationText id="reference_elevation_qt" />
                            </label>
                            <DomainDropdown
                              onSelected={selected => {
                                this.updateChange(
                                  'qt_reference_elevation',
                                  selected.id,
                                  false,
                                );
                              }}
                              schema="qt_elevation"
                              selected={borehole.qt_reference_elevation}
                            />
                          </Form.Field>
                        </Form.Group>
                        <Form.Group widths="equal">
                          <Form.Field
                            error={
                              mentions.indexOf('reference_elevation_type') >=
                                0 || borehole.reference_elevation_type === null
                            }
                            required>
                            <label>
                              <TranslationText id="reference_elevation_type" />
                            </label>
                            <DomainDropdown
                              onSelected={selected => {
                                this.updateChange(
                                  'reference_elevation_type',
                                  selected.id,
                                  false,
                                );
                              }}
                              schema="ibor117"
                              selected={borehole.reference_elevation_type}
                            />
                          </Form.Field>
                          <Form.Field
                            error={mentions.indexOf('hrs') >= 0}
                            required>
                            <label>
                              <TranslationText id="hrs" />
                            </label>
                            {/* <DomainDropdown
                              onSelected={(selected) => {
                                this.updateChange('hrs', selected.id, false);
                              }}
                              schema='hrs'
                              selected={borehole.hrs}
                            /> */}
                            <div
                              style={{
                                height: '36px',
                                display: 'flex',
                                alignItems: 'center',
                              }}>
                              <div>
                                <DomainText id={borehole.hrs} schema="hrs" />
                              </div>
                            </div>
                          </Form.Field>
                        </Form.Group>
                      </Form>
                    </Segment>

                    <Segment>
                      <Form
                        autoCapitalize="off"
                        autoComplete="off"
                        autoCorrect="off"
                        size={size}
                        spellCheck="false">
                        <Form.Group widths="equal">
                          <Form.Field
                            error={mentions.indexOf('country') >= 0}
                            required>
                            <label>
                              <TranslationText id="country" />
                            </label>
                            <Input value={'Switzerland'} />
                          </Form.Field>
                          <Form.Field
                            error={mentions.indexOf('canton') >= 0}
                            required>
                            <label>
                              <TranslationText id="canton" />
                              &nbsp;
                              {borehole.custom.canton !== null ? (
                                <span
                                  className="link"
                                  onClick={() => {
                                    for (
                                      let index = 0;
                                      index < this.props.cantons.length;
                                      index++
                                    ) {
                                      const canton = this.props.cantons[index];
                                      if (
                                        canton.id === borehole.custom.canton
                                      ) {
                                        this.map.zoomtopoly(
                                          canton.geom.coordinates,
                                        );
                                        break;
                                      }
                                    }
                                  }}>
                                  <Icon name="map marker" />
                                  {/* <Icon.Group>
                                      <Icon name='map marker' />
                                      <Icon corner name='search' />
                                    </Icon.Group> */}
                                </span>
                              ) : null}
                            </label>
                            {/* <CantonDropdown
                              onSelected={selected => {
                                if (borehole.custom.city !== null) {
                                  this.updateChange('custom.city', null, false);
                                }
                                this.updateChange(
                                  'custom.canton',
                                  selected.id,
                                  false,
                                );
                              }}
                              selected={borehole.custom.canton}
                            /> */}
                            <Input
                              value={
                                this.props.cantons.filter(
                                  e => e.id === borehole.custom.canton,
                                )?.[0]?.name ?? ''
                              }
                            />
                          </Form.Field>
                          <Form.Field
                            error={mentions.indexOf('city') >= 0}
                            required>
                            <label>
                              <TranslationText id="city" />
                              &nbsp;
                              {borehole.custom.city !== null ? (
                                <span
                                  className="link"
                                  onClick={() => {
                                    for (
                                      let index = 0;
                                      index < this.props.municipalities.length;
                                      index++
                                    ) {
                                      const municipality =
                                        this.props.municipalities[index];
                                      if (
                                        municipality.id === borehole.custom.city
                                      ) {
                                        this.map.zoomtopoly(
                                          municipality.geom.coordinates,
                                        );
                                        break;
                                      }
                                    }
                                  }}>
                                  {/* <Image
                                      avatar
                                      src={
                                        process.env.PUBLIC_URL
                                        + '/img/map-search-outline.svg'
                                      }
                                      style={{
                                        height: '1.5em',
                                        width: 'auto'                                      
                                      }}
                                    /> */}
                                  <Icon name="map marker" />
                                </span>
                              ) : null}
                            </label>
                            <div style={{ display: 'none' }}>
                              <MunicipalityDropdown
                                canton={borehole.custom.canton}
                                disabled={borehole.custom.canton === null}
                                // onSelected={selected => {
                                //   this.updateChange(
                                //     'custom.city',
                                //     selected.id,
                                //     false,
                                //   );
                                // }}
                                selected={borehole.custom.city}
                              />
                            </div>
                            <Input
                              value={
                                this.props.municipalities
                                  ?.filter(
                                    municipality =>
                                      borehole.custom.canton ===
                                      municipality.cid,
                                  )
                                  ?.filter(
                                    e => e.id === borehole.custom.city,
                                  )?.[0]?.name ?? ''
                              }
                            />
                          </Form.Field>
                        </Form.Group>
                      </Form>
                    </Segment>
                  </div>
                  <div
                    style={{
                      flex: '1',
                      marginLeft: '1em',
                    }}>
                    <PointComponent
                      applyChange={(x, y, height, cid, mid) => {
                        this.updateChange(
                          'location',
                          [x, y, cid, mid, height],
                          false,
                        );
                      }}
                      id={borehole.id}
                      ref={pmap => (this.map = pmap)}
                      srs={
                        borehole.srs !== null &&
                        this.props.domains.data.hasOwnProperty('srs')
                          ? (() => {
                              const code = this.props.domains.data.srs.find(
                                element => {
                                  return element.id === borehole.srs;
                                },
                              );
                              if (code !== undefined) {
                                return 'EPSG:' + code['code'];
                              }
                              return null;
                            })()
                          : null
                      }
                      x={
                        _.isNil(borehole.location_x)
                          ? null
                          : _.toNumber(borehole.location_x)
                      }
                      y={
                        _.isNil(borehole.location_y)
                          ? null
                          : _.toNumber(borehole.location_y)
                      }
                    />
                  </div>
                </div>
              </div>
            )}
          />
          <Route
            exact
            path={process.env.PUBLIC_URL + '/editor/:id/borehole'}
            render={() => (
              <div
                style={{
                  flex: '1 1 0%',
                  padding: '1em',
                  overflowY: 'auto',
                }}>
                <Segment>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                    }}>
                    <div
                      style={{
                        flex: '1 1 100%',
                        minWidth: '600px',
                      }}>
                      <Form autoComplete="off" error size={size}>
                        <Form.Group widths="equal">
                          {/* drilling type in Borehole */}
                          <Form.Field
                            error={
                              borehole.kind === null ||
                              mentions.indexOf('kind') >= 0
                            }
                            required>
                            <label>
                              <TranslationText id="kind" />
                            </label>
                            <DomainDropdown
                              onSelected={selected => {
                                this.updateChange('kind', selected.id, false);
                              }}
                              schema="kind"
                              selected={borehole.kind}
                            />
                          </Form.Field>
                          <Form.Field
                            error={mentions.indexOf('method') >= 0}
                            required>
                            <label>
                              <TranslationText id="drilling_method" />
                            </label>
                            <DomainDropdown
                              onSelected={selected => {
                                this.updateChange(
                                  'extended.drilling_method',
                                  selected.id,
                                  false,
                                );
                              }}
                              schema="extended.drilling_method"
                              selected={borehole.extended.drilling_method}
                            />
                          </Form.Field>
                          <Form.Field
                            error={mentions.indexOf('purpose') >= 0}
                            required>
                            <label>
                              <TranslationText id="purpose" />
                            </label>
                            <DomainDropdown
                              onSelected={selected => {
                                this.updateChange(
                                  'extended.purpose',
                                  selected.id,
                                  false,
                                );
                              }}
                              schema="extended.purpose"
                              selected={borehole.extended.purpose}
                            />
                          </Form.Field>
                        </Form.Group>
                        <Form.Group widths="equal">
                          <div
                            style={{
                              width: '34%',
                              paddingRight: '2%',
                              paddingLeft: '1%',
                            }}>
                            <Form.Field
                              error={mentions.indexOf('cuttings') >= 0}
                              required>
                              <label>
                                <TranslationText id="cuttings" />
                              </label>
                              <DomainDropdown
                                onSelected={selected => {
                                  this.updateChange(
                                    'custom.cuttings',
                                    selected.id,
                                    false,
                                  );
                                }}
                                schema="custom.cuttings"
                                selected={borehole.custom.cuttings}
                              />
                            </Form.Field>
                          </div>
                          <div style={{ width: '33%', paddingRight: '1%' }}>
                            <Form.Field
                              // error={
                              //   (_.isString(borehole.drilling_date) &&
                              //     borehole.drilling_date !== '' &&
                              //     !moment(borehole.drilling_date).isValid()) ||
                              //   mentions.indexOf('method') >= 0
                              // }
                              required>
                              <label>
                                <TranslationText id="spud_date" />
                              </label>
                              <DateField
                                date={borehole.spud_date}
                                onChange={selected => {
                                  this.updateChange(
                                    'spud_date',
                                    selected,
                                    false,
                                  );
                                }}
                              />
                            </Form.Field>
                          </div>
                          <div style={{ width: '33%', paddingLeft: '1%' }}>
                            <Form.Field
                              error={
                                (_.isString(borehole.drilling_date) &&
                                  borehole.drilling_date !== '' &&
                                  !moment(borehole.drilling_date).isValid()) ||
                                mentions.indexOf('method') >= 0
                              }
                              required>
                              <label>
                                <TranslationText id="drilling_end_date" />
                              </label>
                              <DateField
                                date={borehole.drilling_date}
                                onChange={selected => {
                                  this.updateChange(
                                    'drilling_date',
                                    selected,
                                    false,
                                  );
                                }}
                              />
                            </Form.Field>
                          </div>
                        </Form.Group>
                        <Form.Group widths="equal">
                          {/* strange bug in Edge fixed with placing
                          a hidden input */}
                          <Form.Field
                            style={{
                              display: 'none',
                            }}>
                            <label>
                              <TranslationText id="drill_diameter" />
                            </label>
                            <Input
                              spellCheck="false"
                              type="number"
                              value={
                                _.isNil(borehole.custom.drill_diameter)
                                  ? ''
                                  : borehole.custom.drill_diameter
                              }
                            />
                          </Form.Field>
                          <Form.Field
                            error={mentions.indexOf('drill_diameter') >= 0}
                            required>
                            <label>
                              <TranslationText id="drill_diameter" />
                            </label>
                            <Input
                              onChange={e => {
                                this.updateNumber(
                                  'custom.drill_diameter',
                                  e.target.value === '' ? null : e.target.value,
                                );
                                // if (/^-?\d*[.,]?\d*$/.test(e.target.value)){
                                //   this.updateChange(
                                //     'custom.drill_diameter',
                                //     e.target.value === '' ?
                                //       null : _.toNumber(e.target.value)
                                //   );
                                // }
                              }}
                              spellCheck="false"
                              value={(() => {
                                const r = _.isNil(
                                  borehole.custom.drill_diameter,
                                )
                                  ? ''
                                  : borehole.custom.drill_diameter;
                                return r;
                              })()}
                            />
                          </Form.Field>
                          <Form.Field
                            error={mentions.indexOf('status') >= 0}
                            required>
                            <label>
                              <TranslationText
                                firstUpperCase
                                id="boreholestatus"
                              />
                            </label>
                            <DomainDropdown
                              onSelected={selected => {
                                this.updateChange(
                                  'extended.status',
                                  selected.id,
                                  false,
                                );
                              }}
                              schema="extended.status"
                              selected={borehole.extended.status}
                            />
                          </Form.Field>
                        </Form.Group>
                        <Form.Group widths="equal">
                          <Form.Field
                            error={mentions.indexOf('inclination') >= 0}
                            required>
                            <label>
                              <TranslationText
                                firstUpperCase
                                id="inclination"
                              />
                            </label>
                            <Input
                              autoCapitalize="off"
                              autoComplete="off"
                              autoCorrect="off"
                              onChange={e => {
                                this.updateNumber(
                                  'inclination',
                                  e.target.value === '' ? null : e.target.value,
                                );
                                // if (/^-?\d*[.,]?\d*$/.test(e.target.value)){
                                //   this.updateChange(
                                //     'inclination',
                                //     e.target.value === '' ?
                                //       null : _.toNumber(e.target.value)
                                //   );
                                // }
                              }}
                              spellCheck="false"
                              value={
                                _.isNil(borehole.inclination)
                                  ? ''
                                  : borehole.inclination
                              }
                            />
                          </Form.Field>
                          <Form.Field
                            error={
                              mentions.indexOf('inclination_direction') >= 0
                            }
                            required>
                            <label>
                              <TranslationText
                                firstUpperCase
                                id="inclination_direction"
                              />
                            </label>
                            <Input
                              autoCapitalize="off"
                              autoComplete="off"
                              autoCorrect="off"
                              onChange={e => {
                                this.updateNumber(
                                  'inclination_direction',
                                  e.target.value === '' ? null : e.target.value,
                                );
                                // if (/^-?\d*[.,]?\d*$/.test(e.target.value)){
                                //   this.updateChange(
                                //     'inclination_direction',
                                //     e.target.value === '' ?
                                //       null : _.toNumber(e.target.value)
                                //   );
                                // }
                              }}
                              spellCheck="false"
                              value={
                                _.isNil(borehole.inclination_direction)
                                  ? ''
                                  : borehole.inclination_direction
                              }
                            />
                          </Form.Field>
                          <Form.Field
                            error={mentions.indexOf('qt_bore_inc_dir') >= 0}
                            required>
                            <label>
                              <TranslationText
                                firstUpperCase
                                id="qt_bore_inc_dir"
                              />
                            </label>
                            <DomainDropdown
                              onSelected={selected => {
                                this.updateChange(
                                  'custom.qt_bore_inc_dir',
                                  selected.id,
                                  false,
                                );
                              }}
                              schema="custom.qt_bore_inc_dir"
                              selected={borehole.custom.qt_bore_inc_dir}
                            />
                          </Form.Field>
                        </Form.Group>
                      </Form>
                    </div>
                    <div
                      style={{
                        flex: '1 1 100%',
                        minWidth: '200px',
                        paddingLeft: '1em',
                      }}>
                      <Form autoComplete="off" error size={size}>
                        <Form.Field>
                          <TranslationText id="remarks" />
                          <TextArea
                            onChange={(e, data) => {
                              this.updateChange(
                                'custom.remarks',
                                e.target.value,
                              );
                            }}
                            rows={14}
                            value={borehole.custom.remarks}
                          />
                        </Form.Field>
                      </Form>
                    </div>
                  </div>
                </Segment>
                <Segment>
                  <Form autoComplete="off" error size={size}>
                    <Form.Group widths="equal">
                      <Form.Field
                        error={mentions.indexOf('total_depth') >= 0}
                        required>
                        <label>
                          <TranslationText id="totaldepth" />
                        </label>
                        <Input
                          autoCapitalize="off"
                          autoComplete="off"
                          autoCorrect="off"
                          onChange={e => {
                            this.updateNumber(
                              'total_depth',
                              e.target.value === '' ? null : e.target.value,
                            );
                            // if (/^-?\d*[.,]?\d*$/.test(e.target.value)){
                            //   this.updateChange(
                            //     'total_depth',
                            //     e.target.value === '' ?
                            //       null : _.toNumber(e.target.value)
                            //   );
                            // }
                          }}
                          spellCheck="false"
                          value={
                            _.isNil(borehole.total_depth)
                              ? ''
                              : borehole.total_depth
                          }
                        />
                      </Form.Field>
                      <Form.Field
                        error={mentions.indexOf('qt_depth') >= 0}
                        required>
                        <label>
                          <TranslationText id="qt_depth" />
                        </label>
                        <DomainDropdown
                          onSelected={selected => {
                            this.updateChange(
                              'custom.qt_depth',
                              selected.id,
                              false,
                            );
                          }}
                          schema="custom.qt_depth"
                          selected={borehole.custom.qt_depth}
                        />
                      </Form.Field>
                    </Form.Group>
                    <Form.Group widths="equal">
                      <Form.Field
                        // error={borehole.extended.top_bedrock_tvd === true}
                        required>
                        <label>
                          <TranslationText id="total_depth_tvd" />
                        </label>
                        <Input
                          autoCapitalize="off"
                          autoComplete="off"
                          autoCorrect="off"
                          onChange={e => {
                            this.updateNumber(
                              'total_depth_tvd',
                              e.target.value === '' ? null : e.target.value,
                            );
                            // if (/^-?\d*[.,]?\d*$/.test(e.target.value)){
                            //   this.updateChange(
                            //     'length',
                            //     e.target.value === '' ?
                            //       null : _.toNumber(e.target.value)
                            //   );
                            // }
                          }}
                          spellCheck="false"
                          value={
                            _.isNil(borehole.total_depth_tvd)
                              ? ''
                              : borehole.total_depth_tvd
                          }
                        />
                      </Form.Field>

                      <Form.Field
                        // error={mentions.indexOf('qt_top_bedrock') >= 0}
                        required>
                        <label>
                          <TranslationText id="total_depth_tvd_qt" />
                        </label>
                        <DomainDropdown
                          onSelected={selected => {
                            this.updateChange(
                              'qt_total_depth_tvd',
                              selected.id,
                              false,
                            );
                          }}
                          schema="custom.qt_top_bedrock"
                          selected={borehole.qt_total_depth_tvd}
                        />
                      </Form.Field>
                    </Form.Group>
                    <Form.Group widths="equal">
                      <Form.Field
                        error={
                          mentions.indexOf('top_bedrock') >= 0
                          // || _.isNil(borehole.extended.top_bedrock)
                        }
                        required>
                        <label>
                          <TranslationText id="top_bedrock" />
                        </label>
                        <Input
                          autoCapitalize="off"
                          autoComplete="off"
                          autoCorrect="off"
                          onChange={e => {
                            this.updateNumber(
                              'extended.top_bedrock',
                              e.target.value === '' ? null : e.target.value,
                            );
                            // if (/^-?\d*[.,]?\d*$/.test(e.target.value)){
                            //   this.updateChange(
                            //     'extended.top_bedrock',
                            //     e.target.value === '' ?
                            //       null : _.toNumber(e.target.value)
                            //   );
                            // }
                          }}
                          spellCheck="false"
                          value={
                            _.isNil(borehole.extended.top_bedrock)
                              ? ''
                              : borehole.extended.top_bedrock
                          }
                        />
                      </Form.Field>
                      <Form.Field
                        error={mentions.indexOf('qt_top_bedrock') >= 0}
                        required>
                        <label>
                          <TranslationText id="qt_top_bedrock" />
                        </label>
                        <DomainDropdown
                          onSelected={selected => {
                            this.updateChange(
                              'custom.qt_top_bedrock',
                              selected.id,
                              false,
                            );
                          }}
                          schema="custom.qt_top_bedrock"
                          selected={borehole.custom.qt_top_bedrock}
                        />
                      </Form.Field>
                    </Form.Group>
                    <Form.Group widths="equal">
                      <Form.Field
                        // error={borehole.extended.top_bedrock_tvd === true}
                        required>
                        <label>
                          <TranslationText id="top_bedrock_tvd" />
                        </label>
                        <Input
                          autoCapitalize="off"
                          autoComplete="off"
                          autoCorrect="off"
                          onChange={e => {
                            this.updateNumber(
                              'extended.top_bedrock_tvd',
                              e.target.value === '' ? null : e.target.value,
                            );
                            // if (/^-?\d*[.,]?\d*$/.test(e.target.value)){
                            //   this.updateChange(
                            //     'length',
                            //     e.target.value === '' ?
                            //       null : _.toNumber(e.target.value)
                            //   );
                            // }
                          }}
                          spellCheck="false"
                          value={
                            _.isNil(borehole.extended.top_bedrock_tvd)
                              ? ''
                              : borehole.extended.top_bedrock_tvd
                          }
                        />
                      </Form.Field>

                      <Form.Field
                        // error={mentions.indexOf('qt_top_bedrock') >= 0}
                        required>
                        <label>
                          <TranslationText id="top_bedrock_tvd_qt" />
                        </label>
                        <DomainDropdown
                          onSelected={selected => {
                            this.updateChange(
                              'custom.qt_top_bedrock_tvd',
                              selected.id,
                              false,
                            );
                          }}
                          schema="custom.qt_top_bedrock"
                          selected={borehole.custom.qt_top_bedrock_tvd}
                        />
                      </Form.Field>
                    </Form.Group>
                    <Form.Field
                      error={mentions.indexOf('groundwater') >= 0}
                      required>
                      <label>
                        <TranslationText id="groundwater" />
                      </label>
                      <Form.Group inline>
                        <Form.Radio
                          checked={borehole.extended.groundwater === true}
                          label={t('yes')}
                          onChange={(e, d) => {
                            this.updateChange(
                              'extended.groundwater',
                              true,
                              false,
                            );
                          }}
                        />
                        <Form.Radio
                          checked={borehole.extended.groundwater === false}
                          label={t('no')}
                          onChange={(e, d) => {
                            this.updateChange(
                              'extended.groundwater',
                              false,
                              false,
                            );
                          }}
                        />
                        <Form.Radio
                          checked={borehole.extended.groundwater === null}
                          label={t('np')}
                          onChange={(e, d) => {
                            this.updateChange(
                              'extended.groundwater',
                              null,
                              false,
                            );
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
                            <div
                              style={{
                                color: 'red',
                              }}>
                              trans=np
                            </div>
                          </div>
                        ) : null}
                      </Form.Group>
                    </Form.Field>
                    <Form.Field
                      error={mentions.indexOf('lithology_top_bedrock') >= 0}
                      required>
                      <label>
                        <TranslationText id="lithology_top_bedrock" />
                      </label>
                      <DomainTree
                        levels={{
                          1: 'rock',
                          2: 'process',
                          3: 'type',
                          // 4: 'specification',
                        }}
                        onSelected={selected => {
                          this.updateChange(
                            'custom.lithology_top_bedrock',
                            selected.id,
                            false,
                          );
                        }}
                        schema="custom.lithology_top_bedrock"
                        selected={borehole.custom.lithology_top_bedrock}
                        title={<TranslationText id="lithology_top_bedrock" />}
                      />
                    </Form.Field>
                    <Form.Field
                      error={
                        mentions.indexOf('lithostratigraphy_top_bedrock') >= 0
                      }
                      required>
                      <label>
                        <TranslationText id="lithostratigraphy_top_bedrock" />
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
                          this.updateChange(
                            'custom.lithostratigraphy_top_bedrock',
                            selected.id,
                            false,
                          );
                        }}
                        schema="custom.lithostratigraphy_top_bedrock"
                        selected={borehole.custom.lithostratigraphy_top_bedrock}
                        title={
                          <TranslationText id="lithostratigraphy_top_bedrock" />
                        }
                      />
                    </Form.Field>
                    <Form.Field
                      error={
                        mentions.indexOf('chronostratigraphy_top_bedrock') >= 0
                      }
                      required>
                      <label>
                        <TranslationText id="chronostratigraphy_top_bedrock" />
                      </label>
                      {/* <DomainDropdown
                        onSelected={(selected) => {
                          this.updateChange(
                            'custom.chronostratigraphy_top_bedrock',
                            selected.id,
                            false
                          );
                        }}
                        schema='custom.chronostratigraphy_top_bedrock'
                        selected={borehole.custom.chronostratigraphy_top_bedrock}
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
                          this.updateChange(
                            'custom.chronostratigraphy_top_bedrock',
                            selected.id,
                            false,
                          );
                        }}
                        schema="custom.chronostratigraphy_top_bedrock"
                        selected={
                          borehole.custom.chronostratigraphy_top_bedrock
                        }
                        title={
                          <TranslationText id="chronostratigraphy_top_bedrock" />
                        }
                      />
                    </Form.Field>
                  </Form>
                </Segment>
              </div>
            )}
          />
          <Route
            exact
            path={process.env.PUBLIC_URL + '/editor/:id/stratigraphy'}
            render={() => (
              <Profile
                id={parseInt(this.props.match.params.id, 10)}
                kind="stratigraphy"
                unlocked={
                  !(
                    this.props.borehole.data.role !== 'EDIT' ||
                    this.props.borehole.data.lock === null ||
                    this.props.borehole.data.lock.username !==
                      this.props.user.data.username
                  )
                }
              />
            )}
          />

          <Route
            exact
            path={process.env.PUBLIC_URL + '/editor/:id/attachments'}
            render={() => (
              <EditorBoreholeFilesTable
                id={parseInt(this.props.match.params.id, 10)}
                unlocked={
                  !(
                    this.props.borehole.data.role !== 'EDIT' ||
                    this.props.borehole.data.lock === null ||
                    this.props.borehole.data.lock.username !==
                      this.props.user.data.username
                  )
                }
              />
            )}
          />
          <Route
            exact
            path={process.env.PUBLIC_URL + '/editor/:id/hydrogeology'}
            render={() => (
              <Profile
                id={parseInt(this.props.match.params.id, 10)}
                kind="hydrogeology"
                unlocked={
                  !(
                    this.props.borehole.data.role !== 'EDIT' ||
                    this.props.borehole.data.lock === null ||
                    this.props.borehole.data.lock.username !==
                      this.props.user.data.username
                  )
                }
              />
            )}
          />
          <Route
            exact
            path={process.env.PUBLIC_URL + '/editor/:id/completion/casing'}
            render={() => (
              <Profile
                id={parseInt(this.props.match.params.id, 10)}
                kind="casing"
                unlocked={
                  !(
                    this.props.borehole.data.role !== 'EDIT' ||
                    this.props.borehole.data.lock === null ||
                    this.props.borehole.data.lock.username !==
                      this.props.user.data.username
                  )
                }
              />
            )}
          />
          <Route
            exact
            path={process.env.PUBLIC_URL + '/editor/:id/completion/instruments'}
            render={() => (
              <Profile
                id={parseInt(this.props.match.params.id, 10)}
                kind="instruments"
                unlocked={
                  !(
                    this.props.borehole.data.role !== 'EDIT' ||
                    this.props.borehole.data.lock === null ||
                    this.props.borehole.data.lock.username !==
                      this.props.user.data.username
                  )
                }
              />
            )}
          />
          <Route
            exact
            path={process.env.PUBLIC_URL + '/editor/:id/completion/filling'}
            render={() => (
              <Profile
                id={parseInt(this.props.match.params.id, 10)}
                kind="filling"
                unlocked={
                  !(
                    this.props.borehole.data.role !== 'EDIT' ||
                    this.props.borehole.data.lock === null ||
                    this.props.borehole.data.lock.username !==
                      this.props.user.data.username
                  )
                }
              />
            )}
          />
        </Switch>
        {/* <Progress
          color={
            borehole.percentage === 100 ? 'green' : 'black'
          }
          percent={borehole.percentage}
          progress
          size='medium'
        /> */}
      </Dimmer.Dimmable>
    );
  }
}

BoreholeForm.propTypes = {
  borehole: PropTypes.object,
  developer: PropTypes.object,
  getBorehole: PropTypes.func,
  id: PropTypes.number,
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string,
    }),
  }),
  t: PropTypes.func,
  updateBorehole: PropTypes.func,
  workflow: PropTypes.object,
};

BoreholeForm.defaultProps = {
  id: undefined,
};

const mapStateToProps = state => {
  return {
    borehole: state.core_borehole,
    developer: state.developer,
    workflow: state.core_workflow,
    domains: state.core_domain_list,
    cantons: state.core_canton_list.data,
    municipalities: state.core_municipality_list.data,
    user: state.core_user,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    dispatch: dispatch,
    getBorehole: id => {
      return dispatch(loadBorehole(id));
    },
    updateBorehole: data => {
      return dispatch(updateBorehole(data));
    },
  };
};

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  )(withTranslation(['common'])(BoreholeForm)),
);
