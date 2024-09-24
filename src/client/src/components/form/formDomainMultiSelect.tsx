import { FC } from "react";
import { useDomains } from "../../api/fetchApiV2";
import { useTranslation } from "react-i18next";
import { Codelist } from "../legacyComponents/domain/domainInterface.ts";
import { FormMultiSelect } from "./form.ts";
import { FormMultiSelectProps } from "./formMultiSelect.tsx";

export interface FormDomainMultiSelectProps extends FormMultiSelectProps {
  schemaName: string;
}

export const FormDomainMultiSelect: FC<FormDomainMultiSelectProps> = props => {
  const { label, selected, schemaName } = props;
  const { data: domains } = useDomains();
  const { i18n } = useTranslation();

  return (
    <FormMultiSelect
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
