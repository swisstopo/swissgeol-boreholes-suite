import { FC, useMemo } from "react";
import { CodelistLabelStyle, useCodelistLabel, useCodelists } from "../../../../components/codelist.ts";
import { FilterAdaptiveSelect } from "./FilterAdaptiveSelect.tsx";
import { SearchData } from "./filterData/filterInterfaces.ts";

interface FilterDomainSelectProps {
  item: SearchData;
  filterValue: number[] | undefined;
  onUpdate: (value: number[] | undefined) => void;
  counts?: Record<number, number>;
}

export const FilterDomainSelect: FC<FilterDomainSelectProps> = ({ item, filterValue, onUpdate, counts }) => {
  const { data: codelists } = useCodelists();
  const getLabel = useCodelistLabel(CodelistLabelStyle.TextOnly);

  const options = useMemo(() => {
    if (!item.schema) return null;
    const domain = codelists
      .filter(c => c.schema === item.schema)
      .sort((a, b) => a.order - b.order)
      .map(c => ({ key: c.id, label: getLabel(c) }));
    const extra = (item.additionalValues ?? []).map(v => ({ key: v.key, label: v.name }));
    return [...domain, ...extra];
  }, [codelists, item.schema, item.additionalValues, getLabel]);

  if (!options) return null;

  return (
    <FilterAdaptiveSelect<number>
      item={item}
      options={options}
      filterValue={filterValue}
      onUpdate={onUpdate}
      counts={counts}
    />
  );
};
