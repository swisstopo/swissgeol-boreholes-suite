import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { withTranslation } from "react-i18next";
import CommentComponent from "./commentComponent";

const CommentArea = props => {
  const { domains, readOnly, height, onChange, value, i18n, border } = props;
  return (
    <CommentComponent
      fields={
        domains.data.hasOwnProperty("borehole_form")
          ? domains.data.borehole_form.map(item => ({
              id: item.code,
              display: item[i18n.language].text,
            }))
          : []
      }
      height={height}
      onChange={onChange}
      readOnly={readOnly}
      value={value}
      border={border}
    />
  );
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

export default connect(mapStateToProps, null)(withTranslation()(CommentArea));
