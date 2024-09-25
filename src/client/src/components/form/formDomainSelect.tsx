import { FC } from "react";
import { useTranslation } from "react-i18next";
import { useDomains } from "../../api/fetchApiV2";
import { Codelist } from "../legacyComponents/domain/domainInterface.ts";
import { FormSelect } from "./form";
import { FormSelectProps } from "./formSelect.tsx";

export interface FormDomainSelectProps extends FormSelectProps {
  schemaName: string;
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
