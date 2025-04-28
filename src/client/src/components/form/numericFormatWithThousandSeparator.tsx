import { NumericFormat } from "react-number-format";

interface CustomProps {
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
  value: number | string;
}

export const NumericFormatWithThousandSeparator = (props: Readonly<CustomProps>) => {
  const { onChange, value, ...other } = props;

  return (
    <NumericFormat
      {...other}
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
};
