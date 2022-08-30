import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

class TranslationText extends React.Component {
  render() {
    const { append, extra, id, ns, prepend, t } = this.props;

    if (this.props.developer.debug === true) {
      return (
        <span
          style={{
            backgroundColor: '#ececec',
            color: 'black',
            lineHeight: '1.2em',
            margin: '5px',
            padding: '5px',
            ...this.props.style,
          }}
          title={`trans=${ns !== 'common' ? ns + '.' : ''}${id}`}>
          {prepend}
          {t(`${ns}:${id}`, extra)}
          {append}
          <br />
          <span
            style={{
              color: 'red',
              margin: '5px',
            }}
            title={`trans=${ns !== 'common' ? ns + '.' : ''}${id}`}>
            trans={`${ns !== 'common' ? ns + '.' : ''}${id}`}
          </span>
        </span>
      );
    }
    let text = t(`${ns}:${id}`, extra);
    if (this.props.firstUpperCase === true) {
      return prepend + text.charAt(0).toUpperCase() + text.slice(1) + append;
    }
    return prepend + text + append;
  }
}

const mapStateToProps = state => {
  return {
    developer: state.developer,
  };
};

TranslationText.propTypes = {
  append: PropTypes.string,
  developer: PropTypes.shape({
    debug: PropTypes.bool,
  }),
  extra: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),

  firstUpperCase: PropTypes.bool,
  id: PropTypes.string,
  ns: PropTypes.string,
  prepend: PropTypes.string,
  style: PropTypes.object,
  t: PropTypes.func,
};

TranslationText.defaultProps = {
  append: '',
  firstUpperCase: false,
  extra: null,
  ns: 'common',
  prepend: '',
  style: {},
};
export default connect(
  mapStateToProps,
  null,
)(withTranslation(['common'])(TranslationText));
