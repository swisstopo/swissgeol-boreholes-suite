import { FC } from "react";
import { useTranslation } from "react-i18next";
import { Codelist, useCodelists } from "../codelist.ts";
import { FormSelect } from "./form";
import { FormSelectProps, FormSelectValue } from "./formSelect.tsx";

export interface FormDomainSelectProps extends FormSelectProps {
  schemaName: string;
  prefilteredDomains?: Codelist[];
  additionalValues?: FormSelectValue[];
  showCode?: boolean;
}

export const FormDomainSelect: FC<FormDomainSelectProps> = props => {
  const { label, selected, schemaName, prefilteredDomains, additionalValues } = props;
  const { data: domains } = useCodelists();
  const { t, i18n } = useTranslation();

  return (
    <FormSelect
      {...props}
      label={label}
      selected={selected}
      values={[
        ...(additionalValues?.map(av => ({
          key: av.key,
          name: t(av.name),
        })) ?? []),
        ...((prefilteredDomains ?? domains)
          ?.filter((d: Codelist) => d.schema === schemaName)
          .sort((a: Codelist, b: Codelist) => a.order - b.order)
          .map((d: Codelist) => ({
            key: d.id,
            name: props.showCode ? `${String(d[i18n.language])} (${String(d.code)})` : String(d[i18n.language]),
          })) ?? []),
      ]}
    />
  );
};
