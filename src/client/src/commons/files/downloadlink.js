import React from "react";
import PropTypes from "prop-types";
import { withTranslation } from "react-i18next";

import { Icon } from "semantic-ui-react";

import { downloadAttachment, exportDownload } from "../../api-lib/index";

class DownloadLink extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      downloading: false,
    };
  }

  render() {
    const props = this.props;

    if (props.id.lenght === 0) {
      return null;
    }

    return (
      <span
        style={{
          color: "rgb(33, 133, 208)",
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
                  if (this.props.type === "attachment") {
                    downloadAttachment({
                      id: props.id,
                    }).then(() => {
                      this.setState({
                        downloading: false,
                      });
                    });
                  }
                },
              );
            }
          }}>
          {this.props.caption}
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

DownloadLink.propTypes = {
  caption: PropTypes.string,
  id: PropTypes.number,
  style: PropTypes.object,
  type: PropTypes.string,
};

DownloadLink.defaultProps = {
  id: null,
  caption: "Download",
  type: "attachment",
};

export default withTranslation()(DownloadLink);
