import { FC } from "react";
import { useTranslation } from "react-i18next";
import { Codelist, useCodelists } from "../codelist.ts";
import { FormMultiSelect } from "./form.ts";
import { FormMultiSelectProps } from "./formMultiSelect.tsx";
import { FormSelectMenuItem } from "./formSelect.tsx";

export interface FormDomainMultiSelectProps extends FormMultiSelectProps {
  schemaName: string;
  prefilteredDomains?: Codelist[];
  showCodeInValues?: boolean;
  showCodeOnlyInChips?: boolean; // Requires showCodeInValues to be true because it extracts the code from the value label
}

export const FormDomainMultiSelect: FC<FormDomainMultiSelectProps> = props => {
  const { label, selected, schemaName, prefilteredDomains, showCodeInValues, showCodeOnlyInChips } = props;
  const { data: codelists } = useCodelists();
  const { i18n } = useTranslation();

  return (
    <FormMultiSelect
      {...props}
      label={label}
      selected={selected}
      values={
        (prefilteredDomains ?? codelists)
          ?.filter((d: Codelist) => d.schema === schemaName)
          .sort((a: Codelist, b: Codelist) => a.order - b.order)
          .map((d: Codelist) => ({
            key: d.id,
            name: showCodeInValues ? `${String(d[i18n.language])} (${String(d.code)})` : String(d[i18n.language]),
          })) ?? []
      }
      renderTagLabel={
        showCodeInValues && showCodeOnlyInChips
          ? (option: FormSelectMenuItem) => option.label.match(/\(([^)]+)\)$/)?.[1] ?? option.label
          : undefined
      }
    />
  );
};
