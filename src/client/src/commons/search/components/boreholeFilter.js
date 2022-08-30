import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import _ from 'lodash';
import { Form, Input } from 'semantic-ui-react';
import TranslationText from '../../form/translationText';
import LabelReset from '../../form/labelReset';
import DomainDropdown from '../../form/domain/dropdown/domainDropdown';
import MunicipalityDropdown from '../../form/municipality/dropdown/municipalityDropdown';
import CantonDropdown from '../../form/cantons/dropdown/cantonDropdown';
import DateField from '../../form/dateField';

class BoreholeFilter extends Component {
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
        {/* Show when completness functionality ready           
        <Form.Field >
          <label>{t('completness')}</label>
          <Radio
            checked={search.filter.completness === 'all'}
            label={t('all')}
            name='radioGroup'
            onChange={()=>{
              this.props.setCompletness('all');
            }}
          />
        </Form.Field>
        <Form.Field >
          <Radio
            checked={search.filter.completness === 'complete'}
            label={t('complete')}
            name='radioGroup'
            onChange={()=>{
              this.props.setCompletness('complete');
            }}
          />
        </Form.Field>
        <Form.Field >
          <Radio
            checked={search.filter.completness === 'incomplete'}
            label={t('incomplete')}
            name='radioGroup'
            onChange={()=>{
              this.props.setCompletness('incomplete');
            }}
          />
        </Form.Field>
        <Form.Field >
          <Radio
            checked={search.filter.completness === 'empty'}
            label={t('empty')}
            name='radioGroup'
            onChange={()=>{
              this.props.setCompletness('empty');
            }}
          />
        </Form.Field> */}

        <Form.Field>
          <label>
            <TranslationText id="creationdate" />
          </label>
          <DateField
            date={search.filter.creation}
            onChange={selected => {
              this.props.setFilter('creation', selected);
            }}
          />
          <LabelReset
            onClick={() => {
              this.props.setFilter('creation', '');
            }}
          />
        </Form.Field>
        {this.isVisible('custom.borehole_identifier') ? (
          <Form.Field>
            <label>
              <TranslationText id="borehole_identifier" />
            </label>
            <DomainDropdown
              onSelected={selected => {
                this.props.setFilter('borehole_identifier', selected.id);
              }}
              reset={false}
              schema="borehole_identifier"
              selected={search.filter.borehole_identifier}
            />
            <Input
              onChange={eve => {
                this.props.setFilter('identifier_value', eve.target.value);
              }}
              value={search.filter.identifier_value}
            />
            <LabelReset
              onClick={() => {
                this.props.resetIdentifier();
              }}
            />
          </Form.Field>
        ) : null}
        {this.isVisible('extended.original_name') ? (
          <Form.Field>
            <label>
              <TranslationText id="original_name" />
            </label>
            <Input
              onChange={e => {
                this.props.setFilter('original_name', e.target.value);
              }}
              placeholder={t('original_name')}
              value={search.filter.original_name}
            />
            {this.props.developer.debug === true ? (
              <div
                style={{
                  color: 'red',
                }}>
                trans=original_name
              </div>
            ) : null}
            <LabelReset
              onClick={() => {
                this.props.setFilter('original_name', '');
              }}
            />
          </Form.Field>
        ) : null}
        {this.isVisible('custom.alternate_name') ? (
          <Form.Field>
            <label>
              <TranslationText id="alternate_name" />
            </label>
            <Input
              onChange={eve => {
                this.props.setFilter('alternate_name', eve.target.value);
              }}
              placeholder={t('alternate_name')}
              value={search.filter.alternate_name}
            />
            {this.props.developer.debug === true ? (
              <div
                style={{
                  color: 'red',
                }}>
                trans=alternate_name
              </div>
            ) : null}
            <LabelReset
              onClick={() => {
                this.props.setFilter('alternate_name', '');
              }}
            />
          </Form.Field>
        ) : null}
        {this.isVisible('kind') ? (
          <Form.Field>
            <label>
              <TranslationText id="kind" />
            </label>
            <DomainDropdown
              onSelected={selected => {
                this.props.setFilter('kind', selected.id);
              }}
              reset={false}
              schema="kind"
              selected={search.filter.kind}
            />
            <LabelReset
              onClick={() => {
                this.props.setFilter('kind', null);
              }}
            />
          </Form.Field>
        ) : null}
        {this.isVisible('extended..drilling_method') ? (
          <Form.Field>
            <label>
              <TranslationText id="drilling_method" />
            </label>
            <DomainDropdown
              onSelected={selected => {
                this.props.setFilter('method', selected.id);
              }}
              reset={false}
              schema="extended.drilling_method"
              selected={search.filter.method}
            />
            <LabelReset
              onClick={() => {
                this.props.setFilter('method', null);
              }}
            />
          </Form.Field>
        ) : null}
        {this.isVisible('custom.project_name') ? (
          <Form.Field>
            <label>
              <TranslationText id="project_name" />
            </label>
            <Input
              onChange={eve => {
                this.props.setFilter('project_name', eve.target.value);
              }}
              placeholder={t('project_name')}
              value={search.filter.project_name}
            />
            {this.props.developer.debug === true ? (
              <div
                style={{
                  color: 'red',
                }}>
                trans=project_name
              </div>
            ) : null}
            <LabelReset
              onClick={() => {
                this.props.setFilter('project_name', '');
              }}
            />
          </Form.Field>
        ) : null}
        {this.isVisible('restriction') ? (
          <Form.Field>
            <label>
              <TranslationText id="restriction" />
            </label>
            <DomainDropdown
              onSelected={selected => {
                this.props.setFilter('restriction', selected.id);
              }}
              reset={false}
              schema="restriction"
              selected={search.filter.restriction}
            />
            <LabelReset
              onClick={() => {
                this.props.setFilter('restriction', null);
              }}
            />
          </Form.Field>
        ) : null}
        {this.isVisible('restriction') ? (
          <Form.Field>
            <label>
              <TranslationText id="restriction_until" />
            </label>
            <DateField
              date={search.filter.restriction_until_from}
              onChange={selected => {
                this.props.setFilter('restriction_until_from', selected);
              }}
              placeholder={t('afterdate')}
            />
            {this.props.developer.debug === true ? (
              <div
                style={{
                  color: 'red',
                }}>
                trans=afterdate
              </div>
            ) : null}
            <div style={{ margin: '1em' }} />
            <DateField
              date={search.filter.restriction_until_to}
              onChange={selected => {
                this.props.setFilter('restriction_until_to', selected);
              }}
              placeholder={t('beforedate')}
            />
            {this.props.developer.debug === true ? (
              <div
                style={{
                  color: 'red',
                }}>
                trans=beforedate
              </div>
            ) : null}
            <LabelReset
              onClick={() => {
                this.props.resetRestriction();
              }}
            />
          </Form.Field>
        ) : null}
        {this.isVisible('elevation_z') ? (
          <Form.Field>
            <label>
              <TranslationText id="elevation_z" />
            </label>
            <Input
              onChange={eve => {
                this.props.setFilter('elevation_z_from', eve.target.value);
              }}
              placeholder={t('fromelevation')}
              type="number"
              value={search.filter.elevation_z_from}
            />
            {this.props.developer.debug === true ? (
              <div
                style={{
                  color: 'red',
                }}>
                trans=fromelevation
              </div>
            ) : null}
            <div style={{ margin: '1em' }} />
            <Input
              onChange={eve => {
                this.props.setFilter('elevation_z_to', eve.target.value);
              }}
              placeholder={t('toelevation')}
              type="number"
              value={search.filter.elevation_z_to}
            />
            {this.props.developer.debug === true ? (
              <div
                style={{
                  color: 'red',
                }}>
                trans=toelevation
              </div>
            ) : null}
            <LabelReset
              onClick={() => {
                this.props.resetElevation();
              }}
            />
          </Form.Field>
        ) : null}
        {this.isVisible('length') ? (
          <Form.Field>
            <label>
              <TranslationText id="totaldepth" />
            </label>
            <Input
              onChange={eve => {
                this.props.setFilter('length_from', eve.target.value);
              }}
              placeholder={t('fromdepth')}
              type="number"
              value={search.filter.length_from}
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
                this.props.setFilter('length_to', eve.target.value);
              }}
              placeholder={t('todepth')}
              type="number"
              value={search.filter.length_to}
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
                this.props.resetDepth();
              }}
            />
          </Form.Field>
        ) : null}
        {this.isVisible('extended.groundwater') ? (
          <Form.Field>
            <label>
              <TranslationText id="groundwater" />
            </label>
            <Form.Group inline>
              <Form.Radio
                checked={search.filter.groundwater === true}
                label={t('yes')}
                onChange={(e, d) => {
                  this.props.setFilter('groundwater', true);
                }}
              />
              <Form.Radio
                checked={search.filter.groundwater === false}
                label={t('no')}
                onChange={(e, d) => {
                  this.props.setFilter('groundwater', false);
                }}
              />
            </Form.Group>
            <Form.Radio
              checked={search.filter.groundwater === null}
              label={t('np')}
              onChange={(e, d) => {
                this.props.setFilter('groundwater', null);
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
                this.props.setFilter('groundwater', -1);
              }}
            />
          </Form.Field>
        ) : null}
        {this.isVisible('extended.top_bedrock') ? (
          <Form.Field>
            <label>
              <TranslationText id="top_bedrock" />
            </label>
            <Input
              onChange={eve => {
                this.props.setFilter('top_bedrock_from', eve.target.value);
              }}
              placeholder={t('fromdepth')}
              type="number"
              value={search.filter.top_bedrock_from}
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
                this.props.setFilter('top_bedrock_to', eve.target.value);
              }}
              placeholder={t('todepth')}
              type="number"
              value={search.filter.top_bedrock_to}
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
                this.props.resetTotBedrock();
              }}
            />
          </Form.Field>
        ) : null}
        {this.isVisible('extended.status') ? (
          <Form.Field>
            <label>
              <TranslationText id="boreholestatus" />
            </label>
            <DomainDropdown
              onSelected={selected => {
                this.props.setFilter('status', selected.id);
              }}
              reset={false}
              schema="extended.status"
              selected={search.filter.status}
            />
            <LabelReset
              onClick={() => {
                this.props.setFilter('status', null);
              }}
            />
          </Form.Field>
        ) : null}
        {this.isVisible('extended.purpose') ? (
          <Form.Field>
            <label>
              <TranslationText id="purpose" />
            </label>
            <DomainDropdown
              onSelected={selected => {
                this.props.setFilter('purpose', selected.id);
              }}
              reset={false}
              schema="extended.purpose"
              selected={search.filter.purpose}
            />
            <LabelReset
              onClick={() => {
                this.props.setFilter('purpose', null);
              }}
            />
          </Form.Field>
        ) : null}
        {this.isVisible('custom.cuttings') ? (
          <Form.Field>
            <label>
              <TranslationText id="cuttings" />
            </label>
            <DomainDropdown
              onSelected={selected => {
                this.props.setFilter('cuttings', selected.id);
              }}
              reset={false}
              schema="custom.cuttings"
              selected={search.filter.cuttings}
            />
            <LabelReset
              onClick={() => {
                this.props.setFilter('cuttings', null);
              }}
            />
          </Form.Field>
        ) : null}
        {this.isVisible('drilling_date') ? (
          <Form.Field>
            <label>
              <TranslationText id="drilling_end_date" />
            </label>
            <DateField
              date={search.filter.drilling_date_from}
              onChange={selected => {
                this.props.setFilter('drilling_date_from', selected);
              }}
              placeholder={t('afterdate')}
            />
            {this.props.developer.debug === true ? (
              <div
                style={{
                  color: 'red',
                  margin: '5px',
                }}>
                trans=afterdate
              </div>
            ) : null}
            <div style={{ margin: '1em' }} />
            <DateField
              date={search.filter.drilling_date_to}
              onChange={selected => {
                this.props.setFilter('drilling_date_to', selected);
              }}
              placeholder={t('beforedate')}
            />
            {this.props.developer.debug === true ? (
              <div
                style={{
                  color: 'red',
                  margin: '5px',
                }}>
                trans=beforedate
              </div>
            ) : null}
            <LabelReset
              onClick={() => {
                this.props.resetDrilling();
              }}
            />
          </Form.Field>
        ) : null}
        {this.isVisible('custom.drill_diameter') ? (
          <Form.Field>
            <label>
              <TranslationText id="drill_diameter" />
            </label>
            <Input
              onChange={eve => {
                this.props.setFilter('drill_diameter_from', eve.target.value);
              }}
              placeholder={t('fromdiameter')}
              type="number"
              value={search.filter.drill_diameter_from}
            />
            {this.props.developer.debug === true ? (
              <div
                style={{
                  color: 'red',
                  margin: '5px',
                }}>
                trans=fromdiameter
              </div>
            ) : null}
            <div style={{ margin: '1em' }} />
            <Input
              onChange={eve => {
                this.props.setFilter('drill_diameter_to', eve.target.value);
              }}
              placeholder={t('todiameter')}
              type="number"
              value={search.filter.drill_diameter_to}
            />
            {this.props.developer.debug === true ? (
              <div
                style={{
                  color: 'red',
                  margin: '5px',
                }}>
                trans=todiameter
              </div>
            ) : null}
            <LabelReset
              onClick={() => {
                this.props.resetDrillDiameter();
              }}
            />
          </Form.Field>
        ) : null}
        {this.isVisible('bore_inc') ? (
          <Form.Field>
            <label>
              <TranslationText id="inclination" />
            </label>
            <Input
              onChange={eve => {
                this.props.setFilter('bore_inc_from', eve.target.value);
              }}
              placeholder={t('from') + ' ' + t('degree')}
              type="number"
              value={search.filter.bore_inc_from}
            />
            {this.props.developer.debug === true ? (
              <div
                style={{
                  color: 'red',
                  margin: '5px',
                }}>
                trans=from + degree
              </div>
            ) : null}
            <div style={{ margin: '1em' }} />
            <Input
              onChange={eve => {
                this.props.setFilter('bore_inc_to', eve.target.value);
              }}
              placeholder={t('to') + ' ' + t('degree')}
              type="number"
              value={search.filter.bore_inc_to}
            />
            {this.props.developer.debug === true ? (
              <div
                style={{
                  color: 'red',
                  margin: '5px',
                }}>
                trans=to + degree
              </div>
            ) : null}
            <LabelReset
              onClick={() => {
                this.props.resetBoreInc();
              }}
            />
          </Form.Field>
        ) : null}
        {this.isVisible('bore_inc_dir') ? (
          <Form.Field>
            <label>
              <TranslationText id="inclination_direction" />
            </label>
            <Input
              onChange={eve => {
                this.props.setFilter('bore_inc_dir_from', eve.target.value);
              }}
              placeholder={t('from') + ' ' + t('degree')}
              type="number"
              value={search.filter.bore_inc_dir_from}
            />
            {this.props.developer.debug === true ? (
              <div
                style={{
                  color: 'red',
                  margin: '5px',
                }}>
                trans=from + degree
              </div>
            ) : null}
            <div style={{ margin: '1em' }} />
            <Input
              onChange={eve => {
                this.props.setFilter('bore_inc_dir_to', eve.target.value);
              }}
              placeholder={t('to') + ' ' + t('degree')}
              type="number"
              value={search.filter.bore_inc_dir_to}
            />
            {this.props.developer.debug === true ? (
              <div
                style={{
                  color: 'red',
                  margin: '5px',
                }}>
                trans=to + degree
              </div>
            ) : null}
            <LabelReset
              onClick={() => {
                this.props.resetBoreIncDir();
              }}
            />
          </Form.Field>
        ) : null}
        {this.isVisible('custom.lit_pet_top_bedrock') ? (
          <Form.Field>
            <label>
              <TranslationText id="lit_pet_top_bedrock" />
            </label>
            <DomainDropdown
              onSelected={selected => {
                this.props.setFilter('lit_pet_top_bedrock', selected.id);
              }}
              reset={false}
              schema="custom.lit_pet_top_bedrock"
              selected={search.filter.lit_pet_top_bedrock}
            />
            <LabelReset
              onClick={() => {
                this.props.setFilter('lit_pet_top_bedrock', null);
              }}
            />
          </Form.Field>
        ) : null}
        {this.isVisible('custom.lit_str_top_bedrock') ? (
          <Form.Field>
            <label>
              <TranslationText id="lit_str_top_bedrock" />
            </label>
            <DomainDropdown
              onSelected={selected => {
                this.props.setFilter('lit_str_top_bedrock', selected.id);
              }}
              reset={false}
              schema="custom.lit_str_top_bedrock"
              selected={search.filter.lit_str_top_bedrock}
            />
            <LabelReset
              onClick={() => {
                this.props.setFilter('lit_str_top_bedrock', null);
              }}
            />
          </Form.Field>
        ) : null}
        {this.isVisible('custom.chro_str_top_bedrock') ? (
          <Form.Field>
            <label>
              <TranslationText id="chro_str_top_bedrock" />
            </label>
            <DomainDropdown
              onSelected={selected => {
                this.props.setFilter('chro_str_top_bedrock', selected.id);
              }}
              reset={false}
              schema="custom.chro_str_top_bedrock"
              selected={search.filter.chro_str_top_bedrock}
            />
            <LabelReset
              onClick={() => {
                this.props.setFilter('chro_str_top_bedrock', null);
              }}
            />
          </Form.Field>
        ) : null}
        {this.isVisible('custom.canton') ? (
          <Form.Field>
            <label>
              <TranslationText id="canton" />
            </label>
            <CantonDropdown
              onSelected={selected => {
                if (search.filter.municipality !== null) {
                  this.props.setFilter('municipality', null);
                }
                this.props.setFilter('canton', selected.id);
              }}
              selected={search.filter.canton}
            />
            <LabelReset
              onClick={() => {
                this.props.setFilter('canton', null);
              }}
            />
          </Form.Field>
        ) : null}
        {this.isVisible('custom.canton') ? (
          <Form.Field>
            <label>
              <TranslationText id="municipality" />
            </label>
            <MunicipalityDropdown
              canton={search.filter.canton}
              disabled={search.filter.canton === null}
              onSelected={selected => {
                this.props.setFilter('municipality', selected.id);
              }}
              selected={search.filter.municipality}
            />
            <LabelReset
              onClick={() => {
                this.props.setFilter('municipality', null);
              }}
            />
          </Form.Field>
        ) : null}
      </Form>
    );
  }
}

BoreholeFilter.propTypes = {
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
)(withTranslation(['common'])(BoreholeFilter));
