import { SxProps } from "@mui/material";
import { FormSelect } from "./form";
import { FC } from "react";
import { useDomains } from "../../api/fetchApiV2";
import { useTranslation } from "react-i18next";

export interface FormDomainSelectProps {
  fieldName: string;
  label: string;
  schemaName: string;
  required?: boolean;
  disabled?: boolean;
  canReset?: boolean;
  selected?: number[];
  sx?: SxProps;
  inputLabelStyles?: SxProps;
  onUpdate?: (value: number) => void;
}

export const FormDomainSelect: FC<FormDomainSelectProps> = props => {
  const { label, selected, schemaName } = props;
  const { data: domains } = useDomains();
  const { i18n } = useTranslation();

  return (
    <FormSelect
      {...props}
      label={label}
      selected={selected}
      values={domains
        // @ts-expect-error test
        ?.filter(d => d.schema === schemaName)
        // @ts-expect-error test
        .sort((a, b) => a.order - b.order)
        // @ts-expect-error test
        .map(d => ({ key: d.id, name: d[i18n.language] }))}
    />
  );
};
