import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { Icon } from 'semantic-ui-react';

import { downloadBorehole } from '@ist-supsi/bmsjs';

class ExportLink extends React.Component {
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

    let frmt = [];
    if (props.pdf === true) {
      frmt.push('pdf');
    }
    if (props.shp === true) {
      frmt.push('shape');
    }
    if (props.csv === true) {
      frmt.push('csv');
    }
    if (props.fullcsv === true) {
      frmt.push('fullcsv');
    }

    return (
      <span
        style={{
          color: 'rgb(33, 133, 208)',
          display: 'ruby',
          ...props.style,
        }}>
        <span
          className={this.state.downloading === false ? 'link linker' : null}
          onClick={() => {
            if (this.state.downloading === false) {
              this.setState(
                {
                  downloading: true,
                },
                () => {
                  downloadBorehole({
                    lang: props.i18n.language,
                    format: frmt.join(','),
                    id: props.id.join(','),
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
  csv: PropTypes.bool,
  fullcsv: PropTypes.bool,
  i18n: PropTypes.shape({
    language: PropTypes.string,
  }),
  id: PropTypes.array,
  pdf: PropTypes.bool,
  shp: PropTypes.bool,
  style: PropTypes.object,
};

ExportLink.defaultProps = {
  id: [],
  pdf: true,
  shape: false,
  csv: false,
  fullcsv: false,
};

export default withTranslation()(ExportLink);
