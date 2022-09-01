import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import {
  Form, Button,
} from 'semantic-ui-react';

import {
  createFeedback
} from '../../lib/index';


class Feedback extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      sending: false,
      sent: false,
      message: '',
      tag: null,
      tags: [
        {
          key: 'DATA-ERROR',
          text: 'DATA-ERROR',
          value: 'DATA-ERROR'
        },
        {
          key: 'BUG',
          text: 'BUG',
          value: 'BUG'
        },
        {
          key: 'FEEDBACK',
          text: 'FEEDBACK',
          value: 'FEEDBACK'
        },
      ]
    };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange (e, { name, value }) {
    this.setState({
      [name]: value
    });
  }

  render() {



    return (
      <Form
        style={{
          width: '290px'
        }}
      >
        <Form.Select
          fluid
          label='Tag'
          name='tag'
          onChange={this.handleChange}
          options={this.state.tags}
          placeholder='Select a tag describing your feedback'
          value={this.state.tag}
        />
        <Form.TextArea
          label='Message'
          name='message'
          onChange={this.handleChange}
          placeholder='Write here your feedback...'
          value={this.state.message}
        />
        {
          this.state.sent === true?
            <Button
              onClick={()=>{
                this.props.onFinised();
              }}
              secondary
            >
              Close
            </Button>:
            <Button
              disabled={
                this.state.tag === null
                || this.state.message.length < 1
              }
              loading={this.state.sending}
              onClick={()=>{
                this.setState({
                  sending: true,
                }, () => {
                  createFeedback(
                    this.state.message,
                    this.state.tag
                  )
                    .then(
                      response => {
                        if (response.data.success === true) {
                          this.setState({
                            sending: false,
                            sent: true,
                            tag: null,
                            message: ''
                          });
                        } else {
                          alert(response.data.message);
                          this.setState({
                            sending: false,
                          });
                        }
                      }
                    );
                });
              }}
              primary
            >
              Send
            </Button>
        }
      </Form>
    );
  }
}

Feedback.propTypes = {
  t: PropTypes.func,
  user: PropTypes.object,
  onFinised: PropTypes.func
};
  
const mapStateToProps = (state) => {
  return {
    user: state.core_user,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch: dispatch,
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(
  withTranslation(['common'])(Feedback)
);
