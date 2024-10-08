import React from "react";
import { NumericFormat, NumericFormatProps } from "react-number-format";

interface CustomProps {
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
  value: number | string;
}

export const NumericFormatWithThousandSeparator = React.forwardRef<NumericFormatProps, CustomProps>(
  function NumericFormatWithThousandSeparator(props, ref) {
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
