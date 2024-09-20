import { NumericFormat, NumericFormatProps } from "react-number-format";
import React from "react";

interface CustomProps {
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
  value: number | string;
}

export const NumericFormatForCoordinates = React.forwardRef<NumericFormatProps, CustomProps>(
  function NumericFormatForCoordinates(props, ref) {
    const { onChange, value, ...other } = props;

    return (
      <NumericFormat
        {...other}
        getInputRef={ref}
        value={value}
        fixedDecimalScale
        onValueChange={values => {
          onChange({
            target: {
              name: props.name,
              value: values.value,
            },
          });
        }}
        thousandSeparator="'"
        valueIsNumericString
      />
    );
  },
);
