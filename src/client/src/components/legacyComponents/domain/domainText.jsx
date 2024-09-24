import React from "react";
import { withTranslation } from "react-i18next";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { loadDomains } from "../../../api-lib/index.js";

class DomainText extends React.Component {
  componentDidMount() {
    const { domains, schema } = this.props;
    if (!Object.prototype.hasOwnProperty.call(domains.data, schema) && domains.isFetching === false) {
      this.props.loadDomains();
    }
  }

  render() {
    const { domains, geocode, id, i18n, schema } = this.props;

    if (id === null) {
      return "";
    }
    if (!Object.prototype.hasOwnProperty.call(domains.data, schema)) {
      if (domains.isFetching === true) {
        return "loading translations";
      }
      console.debug(`asked domain (${schema},${geocode !== undefined ? geocode : id}) but still loading..`);
      return "";
    }
    let found = null;
    if (geocode !== undefined) {
      found = domains.data[schema].find(function (element) {
        return element.code === geocode;
      });
    } else {
      found = domains.data[schema].find(function (element) {
        return element.id === id;
      });
    }
    if (found === undefined) {
      console.error(`asked domain (${schema}:${geocode !== undefined ? geocode : id}:${i18n.language}) but not found.`);
      return null;
    }

    return found[i18n.language].text;
  }
}

DomainText.propTypes = {
  domains: PropTypes.object,
  geocode: PropTypes.string,
  i18n: PropTypes.shape({
    language: PropTypes.string,
  }),
  id: PropTypes.number,
  loadDomains: PropTypes.func,
  schema: PropTypes.string,
};

const mapStateToProps = state => {
  return {
    domains: state.core_domain_list,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    dispatch: dispatch,
    loadDomains: () => {
      dispatch(loadDomains());
    },
  };
};

const ConnectedDomainText = connect(mapStateToProps, mapDispatchToProps)(withTranslation()(DomainText));
export default ConnectedDomainText;
