import { useRef } from "react";
import { NumericFormat } from "react-number-format";

interface CustomProps {
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
  value: number | string;
}

export function NumericFormatWithThousandSeparator(props: CustomProps) {
  const { onChange, value, ...other } = props;
  const inputRef = useRef(null);

  return (
    <NumericFormat
      {...other}
      getInputRef={inputRef}
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
}
