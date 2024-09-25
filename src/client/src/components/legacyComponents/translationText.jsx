import React from "react";
import { withTranslation } from "react-i18next";
import PropTypes from "prop-types";

class TranslationText extends React.Component {
  render() {
    const { append, extra, id, ns, prepend, t } = this.props;

    let text = t(`${ns}:${id}`, extra);
    if (this.props.firstUpperCase === true) {
      return prepend + text.charAt(0).toUpperCase() + text.slice(1) + append;
    }
    return prepend + text + append;
  }
}

TranslationText.propTypes = {
  append: PropTypes.string,
  extra: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),

  firstUpperCase: PropTypes.bool,
  id: PropTypes.string,
  ns: PropTypes.string,
  prepend: PropTypes.string,
  style: PropTypes.object,
  t: PropTypes.func,
};

TranslationText.defaultProps = {
  append: "",
  firstUpperCase: false,
  extra: null,
  ns: "common",
  prepend: "",
  style: {},
};
const ConnectedTranslationText = withTranslation(["common"])(TranslationText);
export default ConnectedTranslationText;
