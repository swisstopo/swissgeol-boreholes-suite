import React from "react";
import PropTypes from "prop-types";
import { withTranslation } from "react-i18next";

import { Icon } from "semantic-ui-react";

import { downloadBorehole } from "../api-lib/index";

class ExportLink extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      downloading: false,
    };
  }

  render() {
    const props = this.props;

    if (props.id.length === 0) {
      return null;
    }

    return (
      <span
        style={{
          color: "rgb(33, 133, 208)",
          display: "ruby",
          ...props.style,
        }}>
        <span
          className={this.state.downloading === false ? "link linker" : null}
          onClick={() => {
            if (this.state.downloading === false) {
              this.setState(
                {
                  downloading: true,
                },
                () => {
                  downloadBorehole({
                    lang: props.i18n.language,
                    format: "pdf",
                    id: props.id.join(","),
                  }).then(() => {
                    this.setState({
                      downloading: false,
                    });
                  });
                },
              );
            }
          }}>
          Download Profile
        </span>
        &nbsp;
        {this.state.downloading === true ? (
          <Icon loading name="spinner" />
        ) : (
          <Icon name="arrow circle down" />
        )}
      </span>
    );
  }
}

ExportLink.propTypes = {
  i18n: PropTypes.shape({
    language: PropTypes.string,
  }),
  id: PropTypes.array,
  style: PropTypes.object,
};

ExportLink.defaultProps = {
  id: [],
};

export default withTranslation()(ExportLink);
