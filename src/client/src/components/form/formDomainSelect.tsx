import { FC } from "react";
import { useTranslation } from "react-i18next";
import { SxProps } from "@mui/material";
import { useDomains } from "../../api/fetchApiV2";
import { Codelist } from "../legacyComponents/domain/domainInterface.ts";
import { FormSelect } from "./form";

export interface FormDomainSelectProps {
  fieldName: string;
  label: string;
  schemaName: string;
  required?: boolean;
  readonly?: boolean;
  disabled?: boolean;
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
        ?.filter((d: Codelist) => d.schema === schemaName)
        .sort((a: Codelist, b: Codelist) => a.order - b.order)
        .map((d: Codelist) => ({ key: d.id, name: d[i18n.language] }))}
    />
  );
};
