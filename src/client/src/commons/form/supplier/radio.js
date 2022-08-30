import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { Form, Radio } from 'semantic-ui-react';
import TranslationText from '../translationText';

const SupplierRadioGroup = props => {
  return (
    <Form
      size='tiny'
      style={{
        marginBottom: '1em'
      }}
    >
      <Form.Field>
        <label>
          <TranslationText
            firstUpperCase
            id='workgroup'
          />
        </label>
        {
          props.all === true?
            <Radio
              checked={props.filter === 'all'}
              label={
                props.t('common:alls').charAt(0).toUpperCase()
                + props.t('common:alls').slice(1)
              }
              name='radioGroup'
              onChange={()=>{
                props.onChange('all');
              }}
            />: null
        }
      </Form.Field>
      {
        props.suppliers.map(
          supplier=>(
            <Form.Field
              key={"sec-" + supplier.id}
            >
              <Radio
                checked={props.filter === supplier.id}
                label={
                  supplier.name
                }
                name='radioGroup'
                onChange={()=>{
                  props.onChange(supplier.id);
                }}
              />
            </Form.Field>
          )
        )
      }
    </Form>
  );
};

SupplierRadioGroup.propTypes = {
  all: PropTypes.bool,
  filter: PropTypes.any,
  onChange: PropTypes.func,
  suppliers: PropTypes.array,
  t: PropTypes.func,
};

SupplierRadioGroup.defaultProps = {
  all: false
};

export default withTranslation(['common'])(SupplierRadioGroup);
