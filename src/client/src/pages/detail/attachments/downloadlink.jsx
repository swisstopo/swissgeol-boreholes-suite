import React from "react";
import { withTranslation } from "react-i18next";
import { Icon } from "semantic-ui-react";
import PropTypes from "prop-types";

class DownloadLink extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      downloading: false,
    };
  }

  render() {
    const props = this.props;

    if (props.onDownload === null) {
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
                () =>
                  props.onDownload().then(() => {
                    this.setState({
                      downloading: false,
                    });
                  }),
              );
            }
          }}>
          {this.props.caption}
        </span>
        &nbsp;
        {this.state.downloading === true ? <Icon loading name="spinner" /> : <Icon name="arrow circle down" />}
      </span>
    );
  }
}

DownloadLink.propTypes = {
  caption: PropTypes.string,
  style: PropTypes.object,
  onDownload: PropTypes.func,
};

DownloadLink.defaultProps = {
  caption: "Download",
  onDownload: null,
};

const TranslatedDownloadLink = withTranslation()(DownloadLink);

export default TranslatedDownloadLink;
