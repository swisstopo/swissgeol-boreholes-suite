import { withTranslation } from "react-i18next";
import { connect } from "react-redux";
import PropTypes from "prop-types";

import CommentComponent from "./commentComponent.jsx";

const CommentArea = props => {
  const { readOnly, height, onChange, value, border } = props;
  return <CommentComponent height={height} onChange={onChange} readOnly={readOnly} value={value} border={border} />;
};

CommentArea.propTypes = {
  domains: PropTypes.object,
  height: PropTypes.number,
  i18n: PropTypes.shape({
    language: PropTypes.string,
  }),
  onChange: PropTypes.func,
  readOnly: PropTypes.bool,
  value: PropTypes.string,
};

CommentArea.defaultProps = {
  height: 187,
  readOnly: false,
  value: "",
};

const mapStateToProps = state => {
  return {
    domains: state.core_domain_list,
  };
};

const ConnectedCommentArea = connect(mapStateToProps, null)(withTranslation()(CommentArea));
export default ConnectedCommentArea;
