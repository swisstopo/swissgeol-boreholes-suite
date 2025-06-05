import { FC } from "react";
import { useTranslation } from "react-i18next";
import { Codelist, useCodelists } from "../codelist.ts";
import { FormMultiSelect } from "./form.ts";
import { FormMultiSelectProps } from "./formMultiSelect.tsx";

export interface FormDomainMultiSelectProps extends FormMultiSelectProps {
  schemaName: string;
  prefilteredDomains?: Codelist[];
}

export const FormDomainMultiSelect: FC<FormDomainMultiSelectProps> = props => {
  const { label, selected, schemaName, prefilteredDomains } = props;
  const { data: codelists } = useCodelists();
  const { i18n } = useTranslation();

  return (
    <FormMultiSelect
      {...props}
      label={label}
      selected={selected}
      values={(prefilteredDomains ?? codelists)
        ?.filter((d: Codelist) => d.schema === schemaName)
        .sort((a: Codelist, b: Codelist) => a.order - b.order)
        .map((d: Codelist) => ({ key: d.id, name: String(d[i18n.language]) }))}
    />
  );
};
