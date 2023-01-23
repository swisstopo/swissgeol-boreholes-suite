import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { loadLayers } from "../../../../api-lib/index";
import ProfileView from "./view/profileViewComponent";
import { fetchLayerById } from "../../../../api/fetchApiV2";

class ProfileContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      layer: null,
      isFetchingLayer: false,
    };
  }
  componentDidMount() {
    const { id } = this.props;
    if (id !== null) {
      this.props.loadLayers(id);
    }
  }
  componentDidUpdate(prevProps) {
    if (this.props.id !== prevProps.id) {
      this.setState(
        {
          layer: null,
        },
        () => {
          this.props.loadLayers(this.props.id);
        },
      );
    }
  }
  render() {
    const { layers, stratigraphy } = this.props;
    if (layers.data.length === 0) {
      return null;
    }
    return (
      <ProfileView
        data={layers.data}
        handleSelected={selected => {
          this.setState(
            {
              isFetchingLayer: true,
              layer: null,
            },
            () => {
              if (selected !== null) {
                fetchLayerById(selected.id).then(result => {
                  this.setState({
                    isFetchingLayer: false,
                    layer: result,
                  });
                });
              }
            },
          );
        }}
        isFetchingLayer={this.state.isFetchingLayer}
        kind={stratigraphy.kind}
        kinds={stratigraphy.kinds}
        layer={this.state.layer}
      />
    );
  }
}

ProfileContainer.propTypes = {
  id: PropTypes.number,
  layers: PropTypes.shape({
    data: PropTypes.array,
  }),
  loadLayers: PropTypes.func,
  stratigraphy: PropTypes.object,
};

const mapStateToProps = (state, ownProps) => {
  return {
    layers: state.core_layers_list,
    ...ownProps,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    dispatch: dispatch,
    loadLayers: id => {
      dispatch(loadLayers(id));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ProfileContainer);
