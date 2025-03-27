import { FC } from "react";
import { useTranslation } from "react-i18next";
import { useDomains } from "../../api/fetchApiV2.ts";
import { Codelist } from "../Codelist.ts";
import { FormSelect } from "./form";
import { FormSelectProps } from "./formSelect.tsx";

export interface FormDomainSelectProps extends FormSelectProps {
  schemaName: string;
  prefilteredDomains?: Codelist[];
}

export const FormDomainSelect: FC<FormDomainSelectProps> = props => {
  const { label, selected, schemaName, prefilteredDomains } = props;
  const { data: domains } = useDomains();
  const { i18n } = useTranslation();

  return (
    <FormSelect
      {...props}
      label={label}
      selected={selected}
      values={(prefilteredDomains ?? domains)
        ?.filter((d: Codelist) => d.schema === schemaName)
        .sort((a: Codelist, b: Codelist) => a.order - b.order)
        .map((d: Codelist) => ({ key: d.id, name: d[i18n.language] }))}
    />
  );
};
