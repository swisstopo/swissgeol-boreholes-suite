import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";

import { loadDomains, loadBoreholes, loadSettings } from "../../api-lib/index";
import { SplashScreen } from "../../commons/auth/SplashScreen";
import { CircularProgress } from "@mui/material";

class DataLoader extends React.Component {
  componentDidMount() {
    this.props.loadSettings();
    this.props.loadDomains();
    this.props.loadBoreholeCount();
  }

  render() {
    return this.props.loader.isReady ? (
      this.props.children
    ) : (
      <SplashScreen>
        <CircularProgress />
      </SplashScreen>
    );
  }
}

DataLoader.propTypes = {
  loadDomains: PropTypes.func,
  loadBoreholeCount: PropTypes.func,
  loadSettings: PropTypes.func,
};

const mapStateToProps = state => {
  return {
    loader: state.dataLoaderState,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    dispatch: dispatch,
    loadDomains: () => {
      dispatch(loadDomains());
    },
    loadBoreholeCount: () => {
      // Only load one borehole to get the total borehole count.
      // We need the count in case of the map only appearance, otherwise the boreholes get loaded by the borehole table.
      dispatch(loadBoreholes(1, 1));
    },
    loadSettings: () => {
      dispatch(loadSettings());
    },
  };
};

const DataLoaderConnected = connect(mapStateToProps, mapDispatchToProps)(DataLoader);
export default DataLoaderConnected;
