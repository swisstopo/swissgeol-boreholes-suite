import React from "react";
import PropTypes from "prop-types";
import _ from "lodash";

import { MentionsInput, Mention } from "react-mentions";

import defaultStyle from "./defaultStyle";

class CommentComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.value,
    };
  }

  componentDidUpdate(prevProps) {
    if (this.props.value !== prevProps.value) {
      this.setState({
        value: this.props.value,
      });
    }
  }

  render() {
    const { readOnly, fields, onChange } = this.props;
    return (
      <MentionsInput
        onChange={(event, newValue, newPlainTextValue, mentions) => {
          if (readOnly === false) {
            this.setState(
              {
                value: newValue,
              },
              () => {
                if (_.isFunction(onChange)) {
                  onChange(newValue);
                }
              },
            );
          }
        }}
        style={_.merge({}, defaultStyle, {
          input: {
            minHeight: this.props.height,
            border: this.props.border,
          },
          padding: "8px",
        })}
        value={this.state.value}>
        <Mention
          data={fields}
          renderSuggestion={(suggestion, search, highlightedDisplay) => (
            <div>{highlightedDisplay}</div>
          )}
          style={{
            backgroundColor: "#ff000024",
            fontSize: "14px",
            margin: "0px",
          }}
          trigger="@"
        />
      </MentionsInput>
    );
  }
}

CommentComponent.propTypes = {
  fields: PropTypes.array,
  height: PropTypes.number,
  onChange: PropTypes.func,
  readOnly: PropTypes.bool,
  value: PropTypes.string,
};

CommentComponent.defaultProps = {
  fields: [],
  height: 150,
  language: "en",
  readOnly: false,
};

export default CommentComponent;
