import { FC, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import CancelIcon from "@mui/icons-material/Cancel";
import { Box, Chip, MenuItem, SxProps } from "@mui/material";
import { TextField } from "@mui/material/";
import { getFormFieldError } from "./form";

export interface FormMultiSelectProps {
  fieldName: string;
  label: string;
  tooltipLabel?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  selected?: number[];
  values?: FormMultiSelectValue[];
  sx?: SxProps;
  className?: string;
}

export interface FormMultiSelectValue {
  key: number;
  name: string;
}

export const FormMultiSelect: FC<FormMultiSelectProps> = ({
  fieldName,
  label,
  tooltipLabel,
  required,
  disabled,
  readonly,
  selected,
  values,
  sx,
  className,
}) => {
  const { t } = useTranslation();
  const { formState, register, setValue, getValues, control } = useFormContext();
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const ChipBox = (selection: number[]) => {
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
                const selectedValues = getValues()[fieldName];
                const updatedValues = selectedValues.filter((value: number) => value !== selectedValue);
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
          {Array.isArray(values) && values.length > 0 ? (
            <TextField
              {...field}
              select
              SelectProps={{
                multiple: true,
                open: open,
                onClose: handleClose,
                onOpen: handleOpen,
                // @ts-expect-error renderValue is used to render the selected values as chips
                renderValue: (selection: number[]) => ChipBox(selection),
              }}
              InputProps={{ readOnly: readonly, disabled: disabled }}
              required={required || false}
              sx={{ ...sx }}
              className={`${readonly ? "readonly" : ""} ${className ?? ""}`}
              label={t(label)}
              {...register(fieldName, {
                required: required || false,
                onChange: e => {
                  if (e.target.value.includes("reset")) {
                    setValue(fieldName, [], { shouldValidate: true });
                    handleClose();
                  } else {
                    setValue(fieldName, e.target.value, { shouldValidate: true });
                  }
                },
              })}
              value={field.value || []}
              error={getFormFieldError(fieldName, formState.errors)}
              disabled={disabled || false}
              data-cy={fieldName + "-formMultiSelect"}>
              <MenuItem key="reset" value="reset">
                <em>{t("reset")}</em>
              </MenuItem>
              {values?.map(item => (
                <MenuItem key={item.key} value={item.key}>
                  {item.name}
                </MenuItem>
              ))}
            </TextField>
          ) : (
            <TextField
              {...field}
              required={required || false}
              error={getFormFieldError(fieldName, formState.errors)}
              sx={{ ...sx }}
              className={`${readonly ? "readonly" : ""} ${className ?? ""}`}
              label={t(label)}
              {...register(fieldName, {
                required: required || false,
              })}
              value={[]}
              disabled
              data-cy={fieldName + "-formMultiSelect"}
              InputLabelProps={{ shrink: true }}
              InputProps={{ readOnly: readonly, disabled: disabled }}
            />
          )}
        </>
      )}
    />
  );
};
