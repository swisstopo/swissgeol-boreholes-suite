import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import _ from 'lodash';
import { Form, Input } from 'semantic-ui-react';

import TranslationText from '../../form/translationText';
import LabelReset from '../../form/labelReset';
import DomainDropdown from '../../form/domain/dropdown/domainDropdown';
import DomainTree from '../../form/domain/tree/domainTree';

class StratigraphyFilter extends Component {
  isVisible(filter) {
    const { settings } = this.props;
    if (_.get(settings, filter) === true) {
      return true;
    }
    return false;
  }

  render() {
    const { search, t } = this.props;
    return (
      <Form size="tiny">
        {this.isVisible('layer.depth') ? (
          <Form.Field>
            <label>
              <TranslationText id="layer_depth" />
            </label>
            <Input
              onChange={eve => {
                this.props.setFilter('layer_depth_from', eve.target.value);
              }}
              placeholder={t('fromdepth')}
              type="number"
              value={search.filter.layer_depth_from}
            />
            {this.props.developer.debug === true ? (
              <div
                style={{
                  color: 'red',
                }}>
                trans=fromdepth
              </div>
            ) : null}
            <div style={{ margin: '1em' }} />
            <Input
              onChange={eve => {
                this.props.setFilter('layer_depth_to', eve.target.value);
              }}
              placeholder={t('todepth')}
              type="number"
              value={search.filter.layer_depth_to}
            />
            {this.props.developer.debug === true ? (
              <div
                style={{
                  color: 'red',
                }}>
                trans=todepth
              </div>
            ) : null}
            <LabelReset
              onClick={() => {
                this.props.setFilter(
                  ['layer_depth_from', 'layer_depth_to'],
                  '',
                );
              }}
            />
          </Form.Field>
        ) : null}
        {this.isVisible('layer.depth_from') ? (
          <Form.Field>
            <label>
              <TranslationText id="layer_depth_from" />
            </label>
            <Input
              onChange={eve => {
                this.props.setFilter('layer_depth_from_from', eve.target.value);
              }}
              placeholder={t('fromdepth')}
              type="number"
              value={search.filter.layer_depth_from_from}
            />
            {this.props.developer.debug === true ? (
              <div
                style={{
                  color: 'red',
                }}>
                trans=fromdepth
              </div>
            ) : null}
            <div style={{ margin: '1em' }} />
            <Input
              onChange={eve => {
                this.props.setFilter('layer_depth_from_to', eve.target.value);
              }}
              placeholder={t('todepth')}
              type="number"
              value={search.filter.layer_depth_from_to}
            />
            {this.props.developer.debug === true ? (
              <div
                style={{
                  color: 'red',
                }}>
                trans=todepth
              </div>
            ) : null}
            <LabelReset
              onClick={() => {
                this.props.setFilter(
                  ['layer_depth_from_from', 'layer_depth_from_to'],
                  '',
                );
              }}
            />
          </Form.Field>
        ) : null}
        {this.isVisible('layer.depth_to') ? (
          <Form.Field>
            <label>
              <TranslationText id="layer_depth_to" />
            </label>
            <Input
              onChange={eve => {
                this.props.setFilter('layer_depth_to_from', eve.target.value);
              }}
              placeholder={t('fromdepth')}
              type="number"
              value={search.filter.layer_depth_to_from}
            />
            {this.props.developer.debug === true ? (
              <div
                style={{
                  color: 'red',
                }}>
                trans=fromdepth
              </div>
            ) : null}
            <Input
              onChange={eve => {
                this.props.setFilter('layer_depth_to_to', eve.target.value);
              }}
              placeholder={t('todepth')}
              type="number"
              value={search.filter.layer_depth_to_to}
            />
            {this.props.developer.debug === true ? (
              <div
                style={{
                  color: 'red',
                }}>
                trans=todepth
              </div>
            ) : null}
            <LabelReset
              onClick={() => {
                this.props.setFilter(
                  ['layer_depth_to_from', 'layer_depth_to_to'],
                  '',
                );
              }}
            />
          </Form.Field>
        ) : null}
        {this.isVisible('layer.description') ? (
          <Form.Field>
            <label>
              <TranslationText id="description" />
            </label>
            <Input
              onChange={eve => {
                this.props.setFilter('layer_description', eve.target.value);
              }}
              value={search.filter.layer_description}
            />
            <LabelReset
              onClick={() => {
                this.props.setFilter('layer_description', '');
              }}
            />
          </Form.Field>
        ) : null}
        {this.isVisible('layer.geology') ? (
          <Form.Field>
            <label>
              <TranslationText id="layer_geology" />
            </label>
            <Input
              onChange={eve => {
                this.props.setFilter('layer_geology', eve.target.value);
              }}
              value={search.filter.layer_geology}
            />
            <LabelReset
              onClick={() => {
                this.props.setFilter('layer_geology', '');
              }}
            />
          </Form.Field>
        ) : null}
        {this.isVisible('layer.lithology') ? (
          <Form.Field>
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
                this.props.setFilter('layer_lithology', selected.id);
              }}
              schema="custom.lithology_top_bedrock"
              selected={search.filter.layer_lithology}
              title={<TranslationText id="layer_lithology" />}
            />
            <LabelReset
              onClick={() => {
                this.props.setFilter('layer_lithology', null);
              }}
            />
          </Form.Field>
        ) : null}
        {this.isVisible('layer.lithostratigraphy') ? (
          <Form.Field>
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
                this.props.setFilter('layer_lithostratigraphy', selected.id);
              }}
              schema="custom.lithostratigraphy_top_bedrock"
              selected={search.filter.layer_lithostratigraphy}
              title={<TranslationText id="layer_lithostratigraphy" />}
            />
            <LabelReset
              onClick={() => {
                this.props.setFilter('layer_lithostratigraphy', null);
              }}
            />
          </Form.Field>
        ) : null}
        {this.isVisible('layer.chronostratigraphy') ? (
          <Form.Field>
            <label>
              <TranslationText id="layer_chronostratigraphy" />
            </label>
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
                this.props.setFilter('layer_chronostratigraphy', selected.id);
              }}
              schema="custom.chronostratigraphy_top_bedrock"
              selected={search.filter.layer_chronostratigraphy}
              title={<TranslationText id="layer_chronostratigraphy" />}
            />
            <LabelReset
              onClick={() => {
                this.props.setFilter('layer_chronostratigraphy', null);
              }}
            />
          </Form.Field>
        ) : null}
        {this.isVisible('layer.color') ? (
          <Form.Field>
            <label>
              <TranslationText id="layer_color" />
            </label>
            <DomainDropdown
              onSelected={selected => {
                this.props.setFilter('layer_color', selected.id);
              }}
              reset={false}
              schema="mlpr112"
              selected={search.filter.layer_color}
            />
            <LabelReset
              onClick={() => {
                this.props.setFilter('layer_color', null);
              }}
            />
          </Form.Field>
        ) : null}
        {this.isVisible('layer.plasticity') ? (
          <Form.Field>
            <label>
              <TranslationText id="layer_plasticity" />
            </label>
            <DomainDropdown
              onSelected={selected => {
                this.props.setFilter('layer_plasticity', selected.id);
              }}
              reset={false}
              schema="mlpr101"
              selected={search.filter.layer_plasticity}
            />
            <LabelReset
              onClick={() => {
                this.props.setFilter('layer_plasticity', null);
              }}
            />
          </Form.Field>
        ) : null}
        {this.isVisible('layer.humidity') ? (
          <Form.Field>
            <label>
              <TranslationText id="layer_humidity" />
            </label>
            <DomainDropdown
              onSelected={selected => {
                this.props.setFilter('layer_humidity', selected.id);
              }}
              reset={false}
              schema="mlpr105"
              selected={search.filter.layer_humidity}
            />
            <LabelReset
              onClick={() => {
                this.props.setFilter('layer_humidity', null);
              }}
            />
          </Form.Field>
        ) : null}
        {this.isVisible('layer.consistance') ? (
          <Form.Field>
            <label>
              <TranslationText id="layer_consistance" />
            </label>
            <DomainDropdown
              onSelected={selected => {
                this.props.setFilter('layer_consistance', selected.id);
              }}
              reset={false}
              schema="mlpr103"
              selected={search.filter.layer_consistance}
            />
            <LabelReset
              onClick={() => {
                this.props.setFilter('layer_consistance', null);
              }}
            />
          </Form.Field>
        ) : null}
        {this.isVisible('layer.alteration') ? (
          <Form.Field>
            <label>
              <TranslationText id="layer_alteration" />
            </label>
            <DomainDropdown
              onSelected={selected => {
                this.props.setFilter('layer_alteration', selected.id);
              }}
              reset={false}
              schema="mlpr106"
              selected={search.filter.layer_alteration}
            />
            <LabelReset
              onClick={() => {
                this.props.setFilter('layer_alteration', null);
              }}
            />
          </Form.Field>
        ) : null}
        {this.isVisible('layer.compactness') ? (
          <Form.Field>
            <label>
              <TranslationText id="layer_compactness" />
            </label>
            <DomainDropdown
              onSelected={selected => {
                this.props.setFilter('layer_compactness', selected.id);
              }}
              reset={false}
              schema="mlpr102"
              selected={search.filter.layer_compactness}
            />
            <LabelReset
              onClick={() => {
                this.props.setFilter('layer_compactness', null);
              }}
            />
          </Form.Field>
        ) : null}
        {this.isVisible('layer.organic_component') ? (
          <Form.Field>
            <label>
              <TranslationText id="layer_organic_component" />
            </label>
            <DomainDropdown
              onSelected={selected => {
                this.props.setFilter('layer_organic_component', selected.id);
              }}
              reset={false}
              schema="mlpr108"
              selected={search.filter.layer_organic_component}
            />
            <LabelReset
              onClick={() => {
                this.props.setFilter('layer_organic_component', null);
              }}
            />
          </Form.Field>
        ) : null}
        {this.isVisible('layer.striae') ? (
          <Form.Field>
            <label>
              <TranslationText id="layer_striae" />
            </label>
            <Form.Group inline>
              <Form.Radio
                checked={search.filter.layer_striae === true}
                label={t('yes')}
                onChange={(e, d) => {
                  this.props.setFilter('layer_striae', true);
                }}
              />
              <Form.Radio
                checked={search.filter.layer_striae === false}
                label={t('no')}
                onChange={(e, d) => {
                  this.props.setFilter('layer_striae', false);
                }}
              />
            </Form.Group>
            <Form.Radio
              checked={search.filter.layer_striae === null}
              label={t('np')}
              onChange={(e, d) => {
                this.props.setFilter('layer_striae', null);
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
            <LabelReset
              onClick={() => {
                this.props.setFilter('layer_striae', -1);
              }}
            />
          </Form.Field>
        ) : null}
        {this.isVisible('layer.grain_size_1') ? (
          <Form.Field>
            <label>
              <TranslationText id="layer_grain_size_1" />
            </label>
            <DomainDropdown
              onSelected={selected => {
                this.props.setFilter('layer_grain_size_1', selected.id);
              }}
              reset={false}
              schema="mlpr109"
              selected={search.filter.layer_grain_size_1}
            />
            <LabelReset
              onClick={() => {
                this.props.setFilter('layer_grain_size_1', null);
              }}
            />
          </Form.Field>
        ) : null}
        {this.isVisible('layer.grain_size_2') ? (
          <Form.Field>
            <label>
              <TranslationText id="layer_grain_size_2" />
            </label>
            <DomainDropdown
              onSelected={selected => {
                this.props.setFilter('layer_grain_size_2', selected.id);
              }}
              reset={false}
              schema="mlpr109"
              selected={search.filter.layer_grain_size_2}
            />
            <LabelReset
              onClick={() => {
                this.props.setFilter('layer_grain_size_2', null);
              }}
            />
          </Form.Field>
        ) : null}
        {this.isVisible('layer.grain_shape') ? (
          <Form.Field>
            <label>
              <TranslationText id="layer_grain_shape" />
            </label>
            <DomainDropdown
              onSelected={selected => {
                this.props.setFilter('layer_grain_shape', selected.id);
              }}
              reset={false}
              schema="mlpr110"
              selected={search.filter.layer_grain_shape}
            />
            <LabelReset
              onClick={() => {
                this.props.setFilter('layer_grain_shape', null);
              }}
            />
          </Form.Field>
        ) : null}
        {this.isVisible('layer.grain_granularity') ? (
          <Form.Field>
            <label>
              <TranslationText id="layer_grain_granularity" />
            </label>
            <DomainDropdown
              onSelected={selected => {
                this.props.setFilter('layer_grain_granularity', selected.id);
              }}
              reset={false}
              schema="mlpr115"
              selected={search.filter.layer_grain_granularity}
            />
            <LabelReset
              onClick={() => {
                this.props.setFilter('layer_grain_granularity', null);
              }}
            />
          </Form.Field>
        ) : null}
        {this.isVisible('layer.cohesion') ? (
          <Form.Field>
            <label>
              <TranslationText id="layer_cohesion" />
            </label>
            <DomainDropdown
              onSelected={selected => {
                this.props.setFilter('layer_cohesion', selected.id);
              }}
              reset={false}
              schema="mlpr116"
              selected={search.filter.layer_cohesion}
            />
            <LabelReset
              onClick={() => {
                this.props.setFilter('layer_cohesion', null);
              }}
            />
          </Form.Field>
        ) : null}
        {this.isVisible('layer.further_properties') ? (
          <Form.Field>
            <label>
              <TranslationText id="layer_further_properties" />
            </label>
            <DomainDropdown
              onSelected={selected => {
                this.props.setFilter('layer_further_properties', selected.id);
              }}
              reset={false}
              schema="mlpr117"
              selected={search.filter.layer_further_properties}
            />
            <LabelReset
              onClick={() => {
                this.props.setFilter('layer_further_properties', null);
              }}
            />
          </Form.Field>
        ) : null}
        {this.isVisible('layer.uscs_1') ? (
          <Form.Field>
            <label>
              <TranslationText id="layer_uscs_1" />
            </label>
            <DomainDropdown
              onSelected={selected => {
                this.props.setFilter('layer_uscs_1', selected.id);
              }}
              reset={false}
              schema="mcla101"
              selected={search.filter.layer_uscs_1}
            />
            <LabelReset
              onClick={() => {
                this.props.setFilter('layer_uscs_1', null);
              }}
            />
          </Form.Field>
        ) : null}
        {this.isVisible('layer.uscs_2') ? (
          <Form.Field>
            <label>
              <TranslationText id="layer_uscs_2" />
            </label>
            <DomainDropdown
              onSelected={selected => {
                this.props.setFilter('layer_uscs_2', selected.id);
              }}
              reset={false}
              schema="mcla101"
              selected={search.filter.layer_uscs_2}
            />
            <LabelReset
              onClick={() => {
                this.props.setFilter('layer_uscs_2', null);
              }}
            />
          </Form.Field>
        ) : null}
        {this.isVisible('layer.uscs_3') ? (
          <Form.Field>
            <label>
              <TranslationText id="layer_uscs_3" />
            </label>
            <DomainDropdown
              onSelected={selected => {
                this.props.setFilter('layer_uscs_3', selected.id);
              }}
              reset={false}
              schema="mcla101"
              selected={search.filter.layer_uscs_3}
            />
            <LabelReset
              onClick={() => {
                this.props.setFilter('layer_uscs_3', null);
              }}
            />
          </Form.Field>
        ) : null}
        {this.isVisible('layer.uscs_determination') ? (
          <Form.Field>
            <label>
              <TranslationText id="layer_uscs_determination" />
            </label>
            <DomainDropdown
              onSelected={selected => {
                this.props.setFilter('layer_uscs_determination', selected.id);
              }}
              reset={false}
              schema="mcla104"
              selected={search.filter.layer_uscs_determination}
            />
            <LabelReset
              onClick={() => {
                this.props.setFilter('layer_uscs_determination', null);
              }}
            />
          </Form.Field>
        ) : null}
        {this.isVisible('layer.debris') ? (
          <Form.Field>
            <label>
              <TranslationText id="layer_debris" />
            </label>
            <DomainDropdown
              onSelected={selected => {
                this.props.setFilter('layer_debris', selected.id);
              }}
              reset={false}
              schema="mcla107"
              selected={search.filter.layer_debris}
            />
            <LabelReset
              onClick={() => {
                this.props.setFilter('layer_debris', null);
              }}
            />
          </Form.Field>
        ) : null}
        {this.isVisible('layer.lithology_top_bedrock') ? (
          <Form.Field>
            <label>
              <TranslationText id="layer_lithology_top_bedrock" />
            </label>
            <DomainDropdown
              onSelected={selected => {
                this.props.setFilter(
                  'layer_lithology_top_bedrock',
                  selected.id,
                );
              }}
              reset={false}
              schema="custom.lithology_top_bedrock"
              selected={search.filter.layer_lithology_top_bedrock}
            />
            <LabelReset
              onClick={() => {
                this.props.setFilter('layer_lithology_top_bedrock', null);
              }}
            />
          </Form.Field>
        ) : null}
      </Form>
    );
  }
}

StratigraphyFilter.propTypes = {
  developer: PropTypes.object,
  setFilter: PropTypes.func,
  settings: PropTypes.object,
};

const mapStateToProps = (state, ownProps) => {
  return {
    developer: state.developer,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    dispatch: dispatch,
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslation(['common'])(StratigraphyFilter));
