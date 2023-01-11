import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import { Form, Header } from "semantic-ui-react";

class CantonDropdown extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: this.props.selected,
    };
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    const { cantons } = this.props;
    if (cantons.length === 0) this.props.loadCantons();
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      this.props.cantons.length !== nextProps.cantons.length ||
      this.state.selected !== nextState.selected
    );
  }

  handleChange(event, data) {
    const { onSelected } = this.props;
    this.setState({ selected: data.value });
    onSelected?.(data.value);
  }

  render() {
    const { cantons } = this.props,
      { selected } = this.state;
    return (
      <Form.Select
        fluid={true}
        search
        selection
        options={
          cantons.map((canton, idx) => ({
            key: "mun-opt-" + idx,
            value: canton,
            text: canton,
            content: <Header content={canton} />,
          })) //: null
        }
        value={selected}
        onChange={this.handleChange}
      />
    );
  }
}

CantonDropdown.propTypes = {
  selected: PropTypes.string,
  onSelected: PropTypes.func,
};

const mapStateToProps = (state, ownProps) => {
  return {
    cantons: state.core_canton_list.data,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    dispatch: dispatch,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CantonDropdown);
