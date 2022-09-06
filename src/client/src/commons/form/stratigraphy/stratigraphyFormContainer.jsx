import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import _ from 'lodash';
import LayerForm from '../layer/layerForm';
import LayersList from '../../layers/layerList';
import DateField from '../dateField';
import TranslationText from '../translationText';
import {
  Button,
  Checkbox,
  Input,
  Segment,
  Form,
  Icon,
  Popup
} from 'semantic-ui-react';
import {
  getStratigraphy,
  getLayers,
  deleteLayer,
  addBedrock,
  gapLayer,
  createLayer,
  patchStratigraphy,
  deleteStratigraphy,
  cloneStratigraphy
} from '../../lib/index';


class StratigraphyFormContainer extends React.Component {

  constructor(props) {
    super(props);
    this.load = this.load.bind(this);
    this.updateAttributeDelay = {};
    this.state = {
      consistency: {},
      stratigraphy: null,
      isPatching: false,
      stratigraphyEmpty: false,
      fetchingStratigraphy: false,
      layers: null,
      layer: null,
      viewas: null
    };
  }
 
  componentDidMount() {
    const { id } = this.props;
    if (!_.isNil(id)) {
      this.load(id);
    }
  }

  componentDidUpdate(prevProps) {
    const { id, refresh } = this.props;
    if (
      id !== null 
      && (
        id !== prevProps.id
        || refresh !== prevProps.refresh
      )
    ) {
      this.load(id);
    }
  }

  load(id, keepselected = false) {
    // Get Stratigraphy by borehole and stratigraphy kind
    this.setState({
      consistency: {},
      stratigraphyEmpty: false,
      fetchingStratigraphy: true,
      layers: null,
      ...(
        keepselected === false?
          {
            layer: null,
            stratigraphy: null,
          }: null
      ),
      viewas: null,
    },() => {
      
      getStratigraphy(id).then(
        (response) => {
          if (
            response.data.success
          ) {
            const stratigraphy = response.data.data;
            this.setState({
              stratigraphy: stratigraphy,
              viewas: stratigraphy.kind
            }, () => {
              // Load Stratigraphy Layers
              getLayers(
                this.state.stratigraphy.id
              ).then(
                (response) => {
                  if (response.data.success){
                    this.setState({
                      layers: response.data.data
                    }, ()=>{
                      this.checkConsistency();
                    });
                  }
                }
              ).catch((error) => {
                console.log(error);
              });
            });
          } else {
            // Stratigraphy not created yet
            this.setState({
              stratigraphyEmpty: true
            });
          }
        }
      ).catch((err) => {
        console.log(err);
      });
    });
  }

  updateChange(attribute, value, to = true){
    if (this.props.borehole.data.role !== 'EDIT'){
      alert("Borehole status not editable");
      return;
    }
    if (
      this.props.borehole.data.lock === null
      || this.props.borehole.data.lock.username !== this.props.user.data.username
    ){
      alert("Borehole not locked");
      return;
    }

    const {
      onUpdated
    } = this.props;
    const state = {
      ...this.state,
      isPatching: true,
      stratigraphy: {
        ...this.state.stratigraphy
      }
    };
    _.set(state.stratigraphy, attribute, value);
    this.setState(state, () => {
      if (
        this.updateAttributeDelay.hasOwnProperty(attribute) &&
        this.updateAttributeDelay[attribute]
      ){
        clearTimeout(this.updateAttributeDelay[attribute]);
        this.updateAttributeDelay[attribute] = false;
      }
      this.updateAttributeDelay[attribute] = setTimeout(function(){
        patchStratigraphy(
          this.state.stratigraphy.id,
          attribute,
          value
        ).then(function(response) {
          if (response.data.success){
            this.setState({
              isPatching: false
            }, () => {
              if (_.isFunction(onUpdated)){
                onUpdated(this.state.stratigraphy.id, attribute, value);
              }
            });
          }
        }.bind(this)).catch(function (error) {
          console.error(error);
        });
      }.bind(this), to? 500: 0);
    });
  }

  checkConsistency(){
    const {
      layers
    } = this.state;

    const borehole = this.props.borehole.data;

    const consistency = {};

    const isDepthDefined = !_.isNil(borehole.length);
    let wrongDepth = false;
    
    //   Bedrock defined the top bedrock is set
    // const isBedrockDefined = (
    //   borehole.custom.lithology_top_bedrock !== null
    // );
    let missingBedrock = true;
    let bedrockLitPetWrong = false;
    let bedrockLitStratiWrong = false;
    let bedrockChronoWrong = false;

    for (let idx = 0, len = layers.length; idx < len; idx++) {
      const item = layers[idx];

      // Check if this item is the bedrock
      const isBedrock = (
        item.depth_from === borehole.extended.top_bedrock
        // Only top_bedrock: meeting 20191017
        // item.lithostratigraphy === borehole.custom.lithostratigraphy_top_bedrock
        // && item.lithology === borehole.custom.lithology_top_bedrock
        // && item.chronostratigraphy === borehole.custom.chronostratigraphy_top_bedrock
        // && item.depth_from === borehole.extended.top_bedrock
      );

      // Space between surface and bedrock not filled
      const missingLayers = (
        isBedrock === true
        && (
          (
            // Is the first layer inserted (maybe using the auto fill feature)
            idx === 0
            && item.depth_from > 0
          ) || (
            // Is not the first and there is some space
            idx > 0
            && item.depth_from > layers[(idx-1)].depth_to
          )
        )
      );

      if (isBedrock === true){
        bedrockLitPetWrong = (
          item.lithology !== borehole.custom.lithology_top_bedrock
        );
  
        bedrockLitStratiWrong = (
          item.lithostratigraphy !== borehole.custom.lithostratigraphy_top_bedrock
        );
  
        bedrockChronoWrong = (
          item.chronostratigraphy !== borehole.custom.chronostratigraphy_top_bedrock
        );
      }

      // First layer not starting from 0 meters
      const errorStartWrong = (
        isBedrock === false
        && idx === 0
        && item.depth_from !== 0
      );

      // Bottom higher then top
      const errorInverted = (
        item.depth_from > item.depth_to
      );

      // There is a gap between two layers
      const errorGap = (
        len > 0
        && isBedrock === false
        && idx > 0
        && layers[(idx-1)].depth_to < item.depth_from
      );

      // There is an overlapping between two layers
      const errorOverlap = (
        idx > 0
        && errorInverted === false
        && item.depth_from < layers[(idx-1)].depth_to
      );

      // Check if bedrock is missing
      if (
        // isBedrockDefined === true &&
        isBedrock === true
        && missingBedrock === true
      ) {
        missingBedrock = !isBedrock;
      }

      if (
        idx === (layers.length - 1)
        && isDepthDefined
      ) {
        wrongDepth = `${item.depth_to}` !== `${borehole.length}`;
      }

      const error = (
        errorStartWrong
        || missingLayers
        || errorGap
        || errorOverlap
      );

      // const message = (
      //   errorStartWrong === true?
      //     'First layer not starting from the surface':
      //     errorOverlap === true?
      //       'Overlapping layers':
      //       'Non continuos data found'
      // );

      if (error === true){
        consistency[item.id] = {
          errorStartWrong: errorStartWrong,
          missingLayers: missingLayers,
          errorInverted: errorInverted,
          errorGap: errorGap,
          errorOverlap: errorOverlap,
          // message: message
        };
      }

    }
    
    if (missingBedrock === true) {
      consistency.missingBedrock = missingBedrock;
    }
    if (wrongDepth === true) {
      consistency.wrongDepth = wrongDepth;
    }
    
    if (bedrockLitPetWrong === true) {
      consistency.bedrockLitPetWrong = bedrockLitPetWrong;
    }
    if (bedrockLitStratiWrong === true) {
      consistency.bedrockLitStratiWrong = bedrockLitStratiWrong;
    }
    if (bedrockChronoWrong === true) {
      consistency.bedrockChronoWrong = bedrockChronoWrong;
    }

    this.setState({
      consistency: consistency
    });

    console.log(consistency);
  }

  render() {
    const { stratigraphy } = this.state;
    const {
      domains,
      onDeleted,
      onClone
    } = this.props;
    
    if (this.state.stratigraphyEmpty || _.isNil(stratigraphy)) {
      return (
        <div
          style={{
            flex: '1 1 0%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <div>
            Nothing selected
          </div>
        </div>
      );
    }
    return (
      <div
        style={{
          padding: '1em',
          display: 'flex',
          flexDirection: 'column',
          height: '100%'
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            height: '100%'
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              flex: '0 0 0%',
            }}
          >
            <Form
              size='small'
            >
              <Form.Group widths='equal'>
                <Form.Field
                  required
                  style={{
                    width: '50%'
                  }}
                >
                  <label>  
                    <TranslationText
                      id='stratigraphy_name'
                    />  
                  </label>
                  <Input
                    autoCapitalize="off"
                    autoComplete="off"
                    autoCorrect="off"
                    onChange={(e)=>{
                      this.updateChange(
                        'name', e.target.value
                      );
                    }}
                    ref={this.depthToRef}
                    spellCheck="false"
                    value={stratigraphy.name}
                  />
                </Form.Field>
                {/* <Form.Field
                  required
                  style={{
                    width: '50%'
                  }}
                >
                  <label>{t('stratigraphy')}</label>
                  <DomainDropdown
                    onSelected={(selected)=>{
                      this.updateChange(
                        'kind', selected.id, false
                      );
                    }}
                    reset={false}
                    schema='layer_kind'
                    selected={stratigraphy.kind}
                  />
                </Form.Field> */}
                <Form.Field
                  error={_.isNil(stratigraphy.date)}
                  required
                  style={{
                    width: '50%'
                  }}
                >
                  <label>  
                    <TranslationText
                      id='date'
                    />  
                  </label>
                  <DateField
                    date={stratigraphy.date}
                    onChange={(selected)=>{
                      this.updateChange(
                        'date', selected, false
                      );
                    }}
                  />
                </Form.Field>
              </Form.Group>
            </Form>
            <div
              style={{
                alignItems: 'baseline',
                display: 'flex',
                flexDirection: 'row',
                marginBottom: '0.5em'
              }}
            >
              <div
                style={{
                  flex: '1 1 100%'
                }}
              >
                <Form
                  size='small'
                  style={{
                    marginBottom: '1em'
                  }}
                >
                  <Checkbox
                    checked={stratigraphy.primary}
                    label=''
                    onChange={(ev, data)=>{
                      if (data.checked===true){
                        this.updateChange(
                          'primary', data.checked, false
                        );
                      }
                    }}
                    toggle
                  />
                  <TranslationText
                    id='mainStratigraphy'
                  />  
                </Form>
              </div>
              {
                this.props.borehole.data.lock === null
                || this.props.borehole.data.lock.username !== this.props.user.data.username
                || this.props.borehole.data.role !== 'EDIT'?
                  null:
                  <div
                    style={{
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <Button
                      disabled={!_.isEmpty(this.state.consistency)}
                      icon
                      onClick={()=>{
                        cloneStratigraphy(
                          stratigraphy.id
                        ).then((response)=>{
                          if (_.isFunction(onClone)){
                            onClone(stratigraphy.id);
                          }
                          this.setState({
                            stratigraphy: null
                          });
                        });
                      }}
                      size='tiny'
                    >
                      <Icon name='clone outline' />
                    </Button>
                    <Popup
                      flowing
                      hoverable
                      on='click'
                      position='right center'
                      trigger={
                        <Button
                          icon
                          size='tiny'
                        >
                          <Icon name='trash alternate' />
                        </Button>
                      }
                    >
                      <TranslationText
                        id='deleteForever'
                      />?
                      <br />
                      <Button
                        icon
                        onClick={()=>{
                          deleteStratigraphy(
                            stratigraphy.id
                          ).then((response)=>{
                            if (_.isFunction(onDeleted)){
                              onDeleted(stratigraphy.id);
                            }
                            this.setState({
                              stratigraphy: null
                            });
                          });
                        }}
                        secondary
                        size='tiny'
                      >
                        <TranslationText
                          id='yes'
                        />
                      </Button>
                    </Popup>
                  </div>
              }
            </div>
            {
              _.isNil(this.state.layers)?
                null:
                <div
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                  }}
                >
                  {
                    this.props.borehole.data.lock === null
                    || this.props.borehole.data.lock.username !== this.props.user.data.username
                    || this.props.borehole.data.role !== 'EDIT'?
                      null:
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'row',
                          marginBottom: '0.5em'
                        }}
                      >
                        <Button
                          // disabled={!_.isEmpty(this.state.consistency)}
                          disabled={(()=>{
                            const keys = _.remove(
                              _.keys(this.state.consistency),
                              (k) => {
                                if (
                                  [
                                    'missingBedrock',
                                    'wrongDepth'
                                  ].indexOf(k)>=0
                                ) {
                                  return false;
                                } else {
                                  const layer = this.state.consistency[k];
                                  return (
                                    layer.missingLayers === false
                                  );
                                }
                              }
                            );
                            return keys.length > 0;
                          })()}
                          fluid
                          onClick={()=>{
                            createLayer(
                              this.state.stratigraphy.id
                            ).then(
                              function(response) {
                                if (response.data.success){
                                  let layerId = response.data.id;
                                  getLayers(
                                    this.state.stratigraphy.id
                                  ).then(function(response) {
                                    if (response.data.success){
                                      this.setState({
                                        consistency: {},
                                        layers: response.data.data,
                                        layer: layerId
                                      }, ()=>{
                                        this.checkConsistency();
                                      });
                                    }
                                  }.bind(this)).catch(function (error) {
                                    console.log(error);
                                  });
                                }
                              }.bind(this)
                            ).catch(function (error) {
                              console.log(error);
                            });
                          }}
                          secondary
                          size='tiny'
                        >
                          <TranslationText
                            id='add'
                          />
                        </Button>
                      </div>
                  }
                  <div
                    className='flex_row'
                    style={{
                      paddingBottom: '0.5em',
                    }}
                  >
                    <div className='flex_fill' />
                    {
                      _.isEmpty(this.state.consistency)?
                        null:
                        <div
                          style={{
                            color: 'red',
                            fontSize: '0.9em',
                            textAlign: 'right',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          <Icon
                            name='warning sign'
                          /> {(()=>{
                            const l = Object.keys(this.state.consistency).length;
                            if (l === 1) {
                              return (
                                <TranslationText
                                  id='errorOneerror'
                                />
                              );
                            }
                            return (
                              <TranslationText
                                extra={{ number: l }}
                                id='errorMoreerror'
                              />
                            );
                          })()}
                        </div>
                    }
                  </div>
                  <div
                    style={{
                      flex: 1,
                      overflowY: 'auto'
                    }}
                  >
                    <LayersList
                      consistency={this.state.consistency}
                      layers={this.state.layers}
                      onAddBedrock={()=>{
                        addBedrock(
                          this.state.stratigraphy.id
                        ).then(
                          (response) => {
                            if (response.data.success){
                              getLayers(
                                this.state.stratigraphy.id
                              ).then(function(response) {
                                if (response.data.success){
                                  this.setState({
                                    layers: response.data.data,
                                    layer: null
                                  }, () => {
                                    this.checkConsistency();
                                  });
                                }
                              }.bind(this)).catch(function (error) {
                                console.log(error);
                              });
                            }
                          }
                        );
                      }}
                      onDelete={(layer, solution, value = null) => {
                        if (this.props.borehole.data.role !== 'EDIT'){
                          alert("Borehole status not editable");
                          return;
                        }
                        if (
                          this.props.borehole.data.lock === null
                          || this.props.borehole.data.lock.username !== this.props.user.data.username
                        ){
                          alert("Borehole not locked");
                          return;
                        }
                        deleteLayer(
                          layer.id, solution, value
                        ).then(
                          (response) => {
                            if (response.data.success){
                              getLayers(
                                this.state.stratigraphy.id
                              ).then((response) => {
                                if (response.data.success){
                                  this.setState({
                                    layers: response.data.data,
                                    layer: null
                                  }, () => {
                                    this.checkConsistency();
                                  });
                                }
                              }).catch(function (error) {
                                console.log(error);
                              });
                            }
                          }).catch(function (error) {
                          console.log(error);
                        });
                      }}
                      onResolve={(layer, solution) => {
                        if (this.props.borehole.data.role !== 'EDIT'){
                          alert("Borehole status not editable");
                          return;
                        }
                        if (
                          this.props.borehole.data.lock === null
                          || this.props.borehole.data.lock.username !== this.props.user.data.username
                        ){
                          alert("Borehole not locked");
                          return;
                        }
                        gapLayer(
                          layer.id, solution
                        ).then(
                          function(response) {
                            if (response.data.success){
                              getLayers(
                                this.state.stratigraphy.id
                              ).then(function(response) {
                                if (response.data.success){
                                  this.setState({
                                    consistency: {},
                                    layers: response.data.data,
                                    layer: null
                                  }, () => {
                                    this.checkConsistency();
                                  });
                                }
                              }.bind(this)).catch(function (error) {
                                console.log(error);
                              });
                            }
                          }.bind(this)).catch(function (error) {
                          console.log(error);
                        });
                      }}
                      onSelected={layer => {
                        this.setState({
                          layer: layer.id
                        });
                      }}
                      selected={this.state.layer}
                      style={{
                        color:(
                          domains.data.layer_kind.find(
                            element => element.id === this.state.viewas
                          ).conf.color
                        ),
                        colorNS: (
                          domains.data.layer_kind.find(
                            element => element.id === this.state.viewas
                          ).conf.colorNS
                        ),
                        pattern: (
                          domains.data.layer_kind.find(
                            element => element.id === this.state.viewas
                          ).conf.pattern
                        ),
                        patternNS: (
                          domains.data.layer_kind.find(
                            element => element.id === this.state.viewas
                          ).conf.patternNS
                        ),
                      }}
                    />
                  </div>
                </div>
            }
          </div>
          <Segment
            style={{
              flex: '1 1 0%',
              overflowY: 'auto',
              margin: '0px 1em'
            }}
          >
            {
              this.state.layer !== null?
                <LayerForm
                  borehole={this.props.borehole}
                  conf={
                    domains.data.hasOwnProperty('layer_kind')?
                      (()=>{
                        const filtered = domains.data.layer_kind.filter(
                          kind => stratigraphy.kind === kind.id
                        );
                        let fields = { ...filtered[0].conf.fields };
                        if (filtered.length > 1) {
                          for (let index = 1; index < filtered.length; index++) {
                            const element = filtered[index];
                            fields = _.mergeWith(
                              fields,
                              element.conf.fields,
                              (objValue, srcValue) => {
                                return objValue || srcValue;
                              }
                            );
                          }
                        }
                        return {
                          "fields": fields
                        };
                      })(): null
                  }
                  id={this.state.layer}
                  onUpdated={(id, attribute, value) => {
                    const layers = [...this.state.layers];
                    for (var i = 0; i < layers.length; i++) {
                      if (id === layers[i].id){
                        layers[i][attribute] = value;
                        break;
                      }
                    }
                    this.setState({
                      layers: layers
                    }, () => {
                      if (
                        attribute === 'depth_to'
                        || attribute === 'depth_from'
                        || attribute === 'lithostratigraphy'
                        || attribute === 'lithology'
                        || attribute === 'chronostratigraphy'
                      ){
                        this.checkConsistency();
                        this.load(this.props.id, true);
                      }
                    });
                  }}
                  user={this.props.user}
                />: null
            }
          </Segment>
        </div>
      </div>
    );
  }
}

StratigraphyFormContainer.propTypes = {
  borehole: PropTypes.object,
  domains: PropTypes.shape({
    data: PropTypes.object
  }),
  i18n: PropTypes.shape({
    language: PropTypes.string
  }),
  id: PropTypes.number,
  onClone: PropTypes.func,
  onDeleted: PropTypes.func,
  onUpdated: PropTypes.func,
  refresh: PropTypes.number,
  setting: PropTypes.shape({
    data: PropTypes.object
  }),
  t: PropTypes.func,
  user: PropTypes.object,
};

StratigraphyFormContainer.defaultProps = {
  borehole: undefined,
  kind: undefined,
  id: undefined,
  refresh: undefined
};

const mapStateToProps = (state) => {
  return {
    borehole: state.core_borehole,
    domains: state.core_domain_list,
    user: state.core_user,
    setting: state.setting,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch: dispatch
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)((
  withTranslation(['common'])(StratigraphyFormContainer)
));
