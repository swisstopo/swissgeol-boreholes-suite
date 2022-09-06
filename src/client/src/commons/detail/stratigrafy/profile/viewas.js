import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { withTranslation } from "react-i18next";

import { Dropdown } from "semantic-ui-react";

import TranslationText from "../../../form/translationText";

class ViewAs extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e, data) {
    const { onChange } = this.props;
    if (onChange) {
      onChange(data.value);
    }
  }

  render() {
    const { domains, setting, kinds, i18n, style } = this.props;
    return (
      <div
        className="flex_row"
        style={{
          ...style,
        }}>
        <div
          style={{
            whiteSpace: "nowrap",
            marginRight: "0.3em",
          }}>
          <TranslationText id="viewas" />:
        </div>
        <div className="flex_fill">
          {kinds !== null && kinds.length > 0 ? (
            <Dropdown
              defaultValue={
                kinds.includes(setting.data.defaults.stratigraphy)
                  ? setting.data.defaults.stratigraphy
                  : kinds[0]
              }
              inline
              onChange={this.handleChange}
              options={domains.data["layer_kind"]
                .filter(kind => kinds.includes(kind.id))
                .map(domain => ({
                  value: domain.id,
                  text: domain[i18n.language].text,
                  ...(this.props.developer.debug === true
                    ? {
                        description: `geolcode=${domain.id}`,
                      }
                    : null),
                }))}
            />
          ) : null}
        </div>
      </div>
    );
  }
}

ViewAs.propTypes = {
  developer: PropTypes.shape({
    debug: PropTypes.bool,
  }),
  domains: PropTypes.shape({
    data: PropTypes.object,
  }),
  i18n: PropTypes.shape({
    language: PropTypes.string,
  }),
  kinds: PropTypes.array,
  onChange: PropTypes.func,
  setting: PropTypes.shape({
    data: PropTypes.object,
  }),
  style: PropTypes.object,
};

ViewAs.defaultProps = {
  kinds: [],
  style: null,
};

const mapStateToProps = state => {
  return {
    developer: state.developer,
    domains: state.core_domain_list,
    setting: state.setting,
  };
};

export default connect(
  mapStateToProps,
  null,
)(withTranslation("common")(ViewAs));
