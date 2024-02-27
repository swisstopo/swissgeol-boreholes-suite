import React from "react";
import PropTypes from "prop-types";
import TranslationText from "./translationText";

const LabelReset = props => {
  return (
    <label
      onClick={
        props.onClick !== undefined
          ? () => {
              props.onClick();
            }
          : undefined
      }
      style={{
        cursor: "pointer",
        textAlign: "right",
        color: "#1d5daf",
        textDecoration: "underline",
        fontWeight: "normal",
        fontSize: "0.9em",
      }}>
      <TranslationText id="reset" />
    </label>
  );
};

LabelReset.propTypes = {
  onClick: PropTypes.func,
};

export default LabelReset;
