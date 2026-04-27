import { FC, useCallback } from "react";
import { Box } from "@mui/material";
import { FilterRequest, useFilterStats } from "../../../../api/borehole.ts";
import { FormContainer } from "../../../../components/form/form.ts";
import { FilterKey, useBoreholeUrlParams } from "../../useBoreholeUrlParams.ts";
import { FilterAutocomplete } from "./FilterAutocomplete.tsx";
import { FilterBooleanButtons } from "./FilterBooleanButtons.tsx";
import { FilterInputConfig } from "./filterData/filterInterfaces.ts";
import { FilterDomainSelect } from "./FilterDomainSelect.tsx";
import { FilterTextField } from "./FilterTextField.tsx";
import { getBooleanCountsForField, getDomainCountsForField, parseBooleanFilterValue } from "./filterUtils.ts";

interface ListFilterProps {
  inputConfig: FilterInputConfig;
}

export const ListFilter: FC<ListFilterProps> = ({ inputConfig }) => {
  const { filterParams, setFilterField, setTableParams } = useBoreholeUrlParams();
  const searchData = inputConfig?.searchData;
  const { data: stats } = useFilterStats(filterParams as FilterRequest);

  const updateChange = useCallback(
    (attribute: string, value: string | boolean | number | null | number[] | undefined) => {
      setFilterField(attribute as FilterKey, value as never);
      setTableParams({ page: 0 });
    },
    [setFilterField, setTableParams],
  );

  return (
    <FormContainer>
      {searchData?.map(filterItem => {
        const key = filterItem.key as FilterKey;
        const value = filterParams?.[key];

        return (
          <Box key={filterItem.key}>
            <FormContainer mt={filterItem?.label ? -0.5 : -4}>
              {filterItem.type === "Input" && filterItem.isNumber && (
                <FilterTextField
                  item={filterItem}
                  filterValue={(value as string) ?? null}
                  onUpdate={value => updateChange(filterItem.key, value)}
                />
              )}
              {filterItem.type === "Input" && !filterItem.isNumber && (
                <FilterAutocomplete
                  item={filterItem}
                  filterValue={(value as string) ?? null}
                  onUpdate={value => updateChange(filterItem.key, value)}
                />
              )}
              {filterItem.type === "Date" && (
                <FilterTextField
                  item={filterItem}
                  filterValue={(value as string) ?? null}
                  onUpdate={value => updateChange(filterItem.key, value)}
                  type="date"
                  labelKeySuffix="_filter_title"
                  debounceMs={0}
                />
              )}
              {filterItem.type === "Dropdown" && filterItem?.schema && (
                <FilterDomainSelect
                  item={filterItem}
                  filterValue={value as number[] | undefined}
                  onUpdate={value => updateChange(filterItem.key, value)}
                  counts={getDomainCountsForField(stats, filterItem.key)}
                />
              )}
              {(filterItem.type === "NullableBoolean" || filterItem.type === "Boolean") && (
                <FilterBooleanButtons
                  item={filterItem}
                  filterValue={parseBooleanFilterValue(value)}
                  onUpdate={value => updateChange(filterItem.key, value)}
                  allowNull={filterItem.type === "NullableBoolean"}
                  counts={getBooleanCountsForField(stats, filterItem.key)}
                />
              )}
            </FormContainer>
          </Box>
        );
      })}
    </FormContainer>
  );
};
