import React from "react";
import _ from "lodash";
import PropTypes from "prop-types";

import { defaultStyle } from "./defaultStyle.js";

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
    const { readOnly, onChange } = this.props;
    return (
      <textarea
        onChange={event => {
          console.log("change", event);
          if (readOnly === false) {
            this.setState(
              {
                value: event.target.value,
              },
              () => {
                if (_.isFunction(onChange)) {
                  onChange(event.target.value);
                }
              },
            );
          }
        }}
        style={_.merge({}, defaultStyle, {
          minHeight: this.props.height,
          border: this.props.border,
          width: "100%",
          padding: "8px",
          resize: "none",
        })}
        value={this.state.value}></textarea>
    );
  }
}

CommentComponent.propTypes = {
  height: PropTypes.number,
  onChange: PropTypes.func,
  readOnly: PropTypes.bool,
  value: PropTypes.string,
};

CommentComponent.defaultProps = {
  height: 150,
  language: "en",
  readOnly: false,
};

export default CommentComponent;
