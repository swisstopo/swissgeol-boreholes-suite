import React from "react";
import { Form, Header } from "semantic-ui-react";
import PropTypes from "prop-types";
import { fetchApiV2 } from "../../../../api/fetchApiV2.js";

class CantonDropdown extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cantons: [],
      selected: this.props.selected,
    };
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    const { cantons } = this.state;
    if (cantons.length === 0) {
      fetchApiV2("canton")
        .then(cantons =>
          this.setState({
            ...this.state,
            cantons: cantons,
          }),
        )
        .catch(error => console.log(error));
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return this.state.cantons?.length !== nextState.cantons?.length || this.state.selected !== nextState.selected;
  }

  handleChange(event, data) {
    const { onSelected } = this.props;
    this.setState({ selected: data.value });
    onSelected?.(data.value);
  }

  static getDerivedStateFromProps(props, state) {
    return {
      ...state,
      selected: props.selected,
    };
  }

  render() {
    const { cantons, selected } = this.state;
    return (
      <Form.Select
        fluid={true}
        search
        selection
        options={cantons?.map((canton, idx) => ({
          key: "mun-opt-" + idx,
          value: canton,
          text: canton,
          content: <Header content={canton} />,
        }))}
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

export default CantonDropdown;
