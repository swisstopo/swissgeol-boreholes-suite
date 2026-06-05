import { FC } from "react";
import { Codelist } from "../../api/generated";
import { CodelistLabelStyle, useCodelistLabel, useCodelists } from "../codelist.ts";
import { FormMultiSelect } from "./form.ts";
import { FormMultiSelectProps } from "./formMultiSelect.tsx";
import { FormSelectMenuItem } from "./formSelect.tsx";

interface FormDomainMultiSelectProps extends FormMultiSelectProps {
  schemaName: string;
  prefilteredDomains?: Codelist[];
  labelStyle?: CodelistLabelStyle;
}

export const FormDomainMultiSelect: FC<FormDomainMultiSelectProps> = props => {
  const { label, selected, schemaName, prefilteredDomains, labelStyle = CodelistLabelStyle.TextOnly } = props;
  const { data: codelists } = useCodelists();
  const getLabel = useCodelistLabel(labelStyle);

  return (
    <FormMultiSelect
      {...props}
      label={label}
      selected={selected}
      values={
        (prefilteredDomains ?? codelists)
          ?.filter((d: Codelist) => d.schema === schemaName)
          .sort((a: Codelist, b: Codelist) => (a.order ?? 0) - (b.order ?? 0))
          .map((d: Codelist) => ({
            key: d.id,
            name: getLabel(d),
          })) ?? []
      }
      renderTagLabel={
        labelStyle === CodelistLabelStyle.TextAndCodeChipsCodeOnly
          ? (option: FormSelectMenuItem) => /\(([^)]+)\)$/.exec(option.label)?.[1] ?? option.label
          : undefined
      }
    />
  );
};
