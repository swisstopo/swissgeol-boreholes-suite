import { CircularProgress } from "@mui/material";
import _ from "lodash";
import {
  FormBooleanSelect,
  FormContainer,
  FormDomainSelect,
  FormInput,
} from "../../../../../../../components/form/form.js";
import { FormDomainMultiSelect } from "../../../../../../../components/form/formDomainMultiSelect.js";
import { FullPageCentered } from "../../../../../../../components/styledComponents.js";

const LithologyLayerForm = ({ attribute, showAll, layer, isVisibleFunction, isEditable }) => {
  if (!layer || !attribute)
    return (
      <FullPageCentered>
        <CircularProgress />
      </FullPageCentered>
    );
  return (
    <FormContainer>
      {attribute.map(item => {
        return (
          <>
            {item.type === "Input" && (item.isVisible || isVisibleFunction(item.isVisibleValue) || showAll) && (
              <FormInput
                fieldName={item.value}
                label={item.label}
                value={layer[item.value]}
                withThousandSeparator={item.isNumber}
              />
            )}
            {item.type === "TextArea" && (item.isVisible || isVisibleFunction(item.isVisibleValue) || showAll) && (
              <FormInput fieldName={item.label} label={item.label} value={layer[item.value]} multiline={true} />
            )}
            {item.type === "Radio" && (item.isVisible || isVisibleFunction(item.isVisibleValue) || showAll) && (
              <FormBooleanSelect
                canReset={false}
                fieldName={item.value}
                label={item.label}
                selected={layer[item.value]}
              />
            )}
            {(item.type === "Dropdown" || item.type === "DomainTree") &&
              (item.isVisible || isVisibleFunction(item.isVisibleValue) || showAll) && (
                <>
                  {item.multiple ? (
                    <FormDomainMultiSelect
                      data-cy={item.value}
                      fieldName={item.value}
                      label={item.label}
                      readOnly={!isEditable}
                      selected={_.isNil(layer?.[item.value]) ? null : layer[item.value]}
                      schemaName={item.schema}
                    />
                  ) : (
                    <FormDomainSelect
                      data-cy={item.value}
                      fieldName={item.value}
                      label={item.label}
                      readOnly={!isEditable}
                      selected={_.isNil(layer?.[item.value]) ? null : layer[item.value]}
                      schemaName={item.schema}
                    />
                  )}
                </>
              )}
          </>
        );
      })}
    </FormContainer>
  );
};

export default LithologyLayerForm;
