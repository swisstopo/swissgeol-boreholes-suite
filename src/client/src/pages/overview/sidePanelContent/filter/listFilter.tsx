import { ChangeEvent, FC, useCallback, useContext, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Box, FormControlLabel, Switch, TextField } from "@mui/material";
import _ from "lodash";
import { Filters } from "../../../../api-lib/ReduxStateInterfaces.ts";
import { useCantons } from "../../../../api/fetchApiV2";
import {
  FormBooleanSelect,
  FormContainer,
  FormDomainSelect,
  FormInput,
  FormSelect,
  FormValueType,
} from "../../../../components/form/form.ts";
import { referenceSystems } from "../../../detail/form/location/coordinateSegmentConstants.ts";
import HierarchicalDataSearch from "../../../detail/form/stratigraphy/hierarchicalDataSearch";
import { FilterContext } from "./filterContext.tsx";
import { FilterInputConfig, ShowAllActiveFields } from "./filterData/filterInterfaces.ts";

interface ListFilterProps {
  inputConfig: FilterInputConfig;
  filters: Filters;
  setFilter: (attribute: string, value: string | boolean | number | null) => void;
  settings: { [key: string]: string };
}

export const ListFilter: FC<ListFilterProps> = ({ inputConfig, filters, setFilter, settings }) => {
  const { t } = useTranslation();
  const { data: cantons } = useCantons();

  const { showAllActiveFields, setShowAllActiveFields } = useContext(FilterContext);

  const searchData = inputConfig?.searchData;

  const isVisibleFunction = (filter?: string) => {
    if (!filter) return false;
    const filterValue = _.get(settings, filter);
    return !!filterValue;
  };

  const showCheckbox = () => {
    let isVisibleCounter = 0;
    for (let i = 0; i < searchData?.length; i++) {
      if (searchData[i]?.hideShowAllFields === true) {
        return false;
      }
      if (isVisibleFunction(searchData[i]?.isVisibleValue)) {
        isVisibleCounter++;
      }
    }

    return isVisibleCounter !== searchData?.length;
  };

  const updateChange = useCallback(
    (attribute: string, value: string | boolean | number | null) => {
      setFilter(attribute, value);
    },
    [setFilter],
  );

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setShowAllActiveFields((previous: Partial<ShowAllActiveFields>) => {
      return { ...previous, [inputConfig?.name]: e.target.checked };
    });
  };

  const debouncedChange = useMemo(
    () =>
      _.debounce((filterValue: string, value: string) => {
        updateChange(filterValue, value);
      }, 2000),
    [updateChange],
  );

  return (
    <FormContainer>
      {showCheckbox() && (
        <FormControlLabel
          control={
            <Switch
              data-cy={"show-all-fields-switch"}
              checked={showAllActiveFields[inputConfig?.name]}
              color="secondary"
              onChange={e => handleChange(e)}
            />
          }
          label={t("showallfields")}
        />
      )}
      {searchData?.map(
        item =>
          (item.isVisible || isVisibleFunction(item.isVisibleValue) || showAllActiveFields[inputConfig?.name]) && (
            <Box key={item.value}>
              <FormContainer mt={item?.label ? -0.5 : -4}>
                {item.type === "Input" && (
                  <TextField
                    label={item?.label && t(item.label)}
                    placeholder={item?.placeholder && t(item.placeholder)}
                    data-cy={`${item?.value}-formInput`}
                    defaultValue={(filters?.filter[item.value] as string) ?? null}
                    onBlur={e => {
                      updateChange(item.value, e.target.value);
                    }}
                    onChange={e => debouncedChange(item.value, e.target.value)}
                  />
                )}
                {item.type === "Dropdown" && item?.schema && (
                  <FormDomainSelect
                    fieldName={item.value}
                    label={item?.label || item.value}
                    readonly={false}
                    selected={_.isNil(filters.filter?.[item.value]) ? null : (filters.filter[item.value] as number)}
                    canReset={false}
                    schemaName={item.schema}
                    additionalValues={item.additionalValues}
                    onUpdate={value => {
                      updateChange(item.value, value);
                    }}
                  />
                )}
                {item.type === "Date" && (
                  <FormInput
                    readonly={false}
                    fieldName={item?.value}
                    label={item?.label ? `${item.label}_filter_title` : ""}
                    placeholder={item?.placeholder}
                    type={FormValueType.Date}
                    onUpdate={value => {
                      updateChange(item.value, value);
                    }}
                  />
                )}
                {item.type === "Radio" && (
                  <FormBooleanSelect
                    readonly={false}
                    canReset={false}
                    fieldName={item.value}
                    label={item?.label ?? item.value}
                    onUpdate={value => {
                      updateChange(item.value, value);
                    }}
                  />
                )}
                {item.type === "ReferenceSystem" && (
                  <FormSelect
                    canReset={false}
                    readonly={false}
                    fieldName={"originalReferenceSystem"}
                    label="spatial_reference_system"
                    onUpdate={value => updateChange(item.value, value)}
                    values={Object.entries(referenceSystems).map(([, value]) => ({
                      key: value.code,
                      name: value.name,
                    }))}
                  />
                )}
                {item?.schema && item.type === "HierarchicalData" && (
                  <Box mt={3}>
                    <HierarchicalDataSearch
                      onSelected={(e: { id: number | null }) => {
                        updateChange(item.value, e.id);
                      }}
                      schema={item.schema}
                      labels={item.labels}
                      selected={_.isNil(filters.filter?.[item.value]) ? null : Number(filters.filter[item.value])}
                    />
                  </Box>
                )}
                {item.type === "Canton" && cantons?.length > 0 && (
                  <FormSelect
                    canReset={false}
                    readonly={false}
                    fieldName="canton"
                    label={t("canton")}
                    onUpdate={selected => {
                      updateChange(item.value, selected);
                    }}
                    values={cantons.map((canton: string, idx: number) => ({
                      key: `mun-opt-${idx}`,
                      value: canton,
                      name: canton,
                    }))}
                  />
                )}
              </FormContainer>
            </Box>
          ),
      )}
    </FormContainer>
  );
};
