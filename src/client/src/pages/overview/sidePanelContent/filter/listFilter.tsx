import { FC, useCallback } from "react";
import { Box } from "@mui/material";
import { FormBooleanSelect, FormContainer, FormDomainSelect } from "../../../../components/form/form.ts";
import { useBoreholeUrlParams } from "../../useBoreholeUrlParams.ts";
import { FilterInputConfig } from "./filterData/filterInterfaces.ts";
import { FilterTextField } from "./FilterTextField.tsx";

interface ListFilterProps {
  inputConfig: FilterInputConfig;
}

const parseBooleanFilterValue = (value: unknown): boolean | null | undefined => {
  if (value === "true") return true;
  if (value === "false") return false;
  if (value === "null") return null;
  return undefined;
};

export const ListFilter: FC<ListFilterProps> = ({ inputConfig }) => {
  const { filterParams, setFilterField, setTableParams } = useBoreholeUrlParams();
  const searchData = inputConfig?.searchData;

  const updateChange = useCallback(
    (attribute: string, value: string | boolean | number | null | number[] | undefined) => {
      setFilterField(attribute as never, value as never);
      setTableParams({ page: 0 });
    },
    [setFilterField, setTableParams],
  );

  return (
    <FormContainer>
      {searchData?.map(item => (
        <Box key={item.value}>
          <FormContainer mt={item?.label ? -0.5 : -4}>
            {item.type === "Input" && (
              <FilterTextField
                item={item}
                filterValue={(filterParams?.[item.value as never] as string) ?? null}
                onUpdate={value => updateChange(item.value, value)}
              />
            )}
            {item.type === "Date" && (
              <FilterTextField
                item={item}
                filterValue={(filterParams?.[item.value as never] as string) ?? null}
                onUpdate={value => updateChange(item.value, value)}
                type="date"
                labelKeySuffix="_filter_title"
                debounceMs={0}
              />
            )}
            {item.type === "Dropdown" && item?.schema && (
              <FormDomainSelect
                fieldName={item.value}
                label={item?.label || item.value}
                readonly={false}
                selected={(filterParams?.[item.value as never] as number[] | undefined)?.[0]} // only support single select for now, change later
                canReset={false}
                schemaName={item.schema}
                additionalValues={item.additionalValues}
                onUpdate={value => {
                  updateChange(item.value, [value as number]);
                }}
              />
            )}
            {(item.type === "TriStateBoolean" || item.type === "Boolean") && (
              <FormBooleanSelect
                readonly={false}
                canReset={false}
                allowUndefined={item.type === "TriStateBoolean"}
                selected={parseBooleanFilterValue(filterParams?.[item.value as never])}
                fieldName={item.value}
                label={item?.label ?? item.value}
                onUpdate={value => {
                  updateChange(item.value, value === null ? undefined : value);
                }}
              />
            )}
          </FormContainer>
        </Box>
      ))}
    </FormContainer>
  );
};
