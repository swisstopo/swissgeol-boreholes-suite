import { Box, Chip, MenuItem } from "@mui/material";
import CancelIcon from "@mui/icons-material/Cancel";
import { useTranslation } from "react-i18next";
import { useFormContext, Controller } from "react-hook-form";
import { FormField, getFormFieldBackgroundColor } from "./form";

export const FormMultiSelect = props => {
  const { fieldName, label, tooltipLabel, required, disabled, selected, values, sx } = props;
  const { t } = useTranslation();
  const { formState, register, setValue, getValues, control } = useFormContext();

  const ChipBox = selection => {
    return (
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 0.5,
        }}>
        {selection.map(selectedValue => {
          const selectedOption = values?.find(value => value.key === selectedValue);
          return (
            <Chip
              sx={{ height: "26px" }}
              key={selectedValue}
              label={selectedOption ? selectedOption.name : selectedValue}
              title={tooltipLabel ? t(tooltipLabel) : null}
              deleteIcon={<CancelIcon onMouseDown={e => e.stopPropagation()} />}
              onClick={e => e.stopPropagation()}
              onDelete={e => {
                e.stopPropagation();
                var selectedValues = getValues()[fieldName];
                var updatedValues = selectedValues.filter(value => value !== selectedValue);
                setValue(fieldName, updatedValues, { shouldValidate: true });
              }}
            />
          );
        })}
      </Box>
    );
  };

  // Without the controller the textfield is not updated when a value is removed by clicking the delete icon on the chip.
  // Check value length to avoid MUI console error: `children` must be passed when using the `TextField` component with `select`.
  return (
    <Controller
      name={fieldName}
      control={control}
      defaultValue={selected || []}
      render={({ field }) => (
        <>
          {values?.length > 0 ? (
            <FormField
              {...field}
              select
              SelectProps={{
                multiple: true,
                renderValue: selection => ChipBox(selection),
              }}
              required={required || false}
              sx={{
                backgroundColor: getFormFieldBackgroundColor(fieldName, formState?.errors),
                ...sx,
              }}
              size="small"
              label={t(label)}
              variant="outlined"
              {...register(fieldName, {
                required: required || false,
                onChange: e => {
                  setValue(fieldName, e.target.value, { shouldValidate: true });
                },
              })}
              value={field.value || []}
              disabled={disabled || false}
              data-cy={fieldName + "-formMultiSelect"}
              InputLabelProps={{ shrink: true }}>
              {values?.map(item => (
                <MenuItem key={item.key} value={item.key}>
                  {item.name}
                </MenuItem>
              ))}
            </FormField>
          ) : (
            <FormField
              {...field}
              required={required || false}
              sx={{
                backgroundColor: getFormFieldBackgroundColor(formState.errors[fieldName]),
                ...sx,
              }}
              size="small"
              label={t(label)}
              variant="outlined"
              {...register(fieldName, {
                required: required || false,
              })}
              value={[]}
              disabled
              data-cy={fieldName + "-formMultiSelect"}
              InputLabelProps={{ shrink: true }}
            />
          )}
        </>
      )}
    />
  );
};
