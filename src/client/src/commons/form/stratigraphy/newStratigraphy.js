import React from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import _ from 'lodash';
import DomainText from '../domain/domainText';

import {
  Button,
  // Header,
  Checkbox,
  Modal
} from 'semantic-ui-react';


class NewStratigraphy extends React.Component {

  constructor(props) {
    super(props);
    this.handleSelected = this.handleSelected.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.state = {
      kinds: []
    };
  }

  handleChange(evt, data) {
    const tmp = [...this.state.kinds];
    const idx = tmp.indexOf(data.kind_id);
    if (idx > -1) {
      tmp.splice(idx, 1);
    } else {
      tmp.push(data.kind_id);
    }
    this.setState({
      kinds: tmp
    });
  }

  handleSelected () {
    const {
      onSelected
    } = this.props;
    if (_.isFunction(onSelected)){
      onSelected(this.state.kinds);
    }
  }

  render () {
    const {
      close,
      domains,
      open,
      t
    } = this.props;
    return (
      <Modal
        onClose={close}
        onMount={()=>{
          this.setState({
            kinds: [
              this.props.setting.data.defaults.stratigraphy
            ]
          });
        }}
        open={open}
        size='mini'
      >
        <Modal.Header>
          {
            t(
              'new',
              {
                what: t('stratigraphy').toLowerCase()
              }
            )
          }
        </Modal.Header>
        <Modal.Content>
          <Modal.Description>
            {
              domains.data.layer_kind.map((kind, idx) => (
                <div
                  key={"nsm-kds-"+idx}
                  style={{
                    marginBottom: '0.5em'
                  }}
                >
                  <Checkbox
                    checked={this.state.kinds.includes(kind.id)}
                    kind_id={kind.id}
                    label={{
                      children: (
                        <DomainText
                          geocode={kind.code}
                          schema='layer_kind'
                        />
                      )
                    }}
                    onChange={this.handleChange}
                  />
                </div>
              ))
            }
          </Modal.Description>
        </Modal.Content>
        <Modal.Actions>
          <Button
            onClick={()=>{
              this.props.close();
            }}
          >Cancel</Button>
          <Button
            content='Create'
            disabled={this.state.kinds.length===0}
            onClick={this.handleSelected}
            secondary
          />
        </Modal.Actions>
      </Modal>
    );
  }
};

NewStratigraphy.propTypes = {
  close: PropTypes.func,
  domains: PropTypes.shape({
    data: PropTypes.shape({
      "layer_kind": PropTypes.array
    })
  }),
  onSelected: PropTypes.func,
  open: PropTypes.bool
};

const mapStateToProps = (state) => {
  return {
    domains: state.core_domain_list,
    setting: state.setting
  };
};

// const mapDispatchToProps = (dispatch) => {
//   return {
//     dispatch: dispatch
//   };
// };

export default connect(
  mapStateToProps, null // mapDispatchToProps
)(
  withTranslation(['common'])(NewStratigraphy)
);

