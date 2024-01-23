import {
  Checkbox,
  FormControl,
  FormControlLabel,
  TextField,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { Controller } from "react-hook-form";

export const getInputFieldBackgroundColor = errorFieldName =>
  Boolean(errorFieldName) ? "#fff6f6" : "transparent";

export const FormInput = props => {
  const {
    fieldName,
    label,
    required,
    disabled,
    type,
    multiline,
    rows,
    value,
    formState,
    register,
    trigger,
    sx,
  } = props;
  const { t } = useTranslation();

  return (
    <TextField
      name={fieldName}
      sx={{
        backgroundColor: getInputFieldBackgroundColor(
          formState.errors[fieldName],
        ),
        borderRadius: "4px",
        flex: "1",
        marginTop: "10px !important",
        marginRight: "10px !important",
        ...sx,
      }}
      type={type || "text"}
      multiline={multiline || false}
      rows={multiline ? rows || 3 : 1}
      size="small"
      label={t(label)}
      variant="outlined"
      error={!!formState.errors[fieldName]}
      {...register(fieldName, {
        required: required || false,
        valueAsNumber: type === "number" ? true : false,
      })}
      defaultValue={value != null ? value : ""}
      disabled={disabled || false}
      data-cy={fieldName + "-formInput"}
      InputLabelProps={{ shrink: true }}
      onChange={() => {
        trigger(fieldName);
      }}
    />
  );
};

export const FormSelect = props => {
  const {
    fieldName,
    label,
    required,
    disabled,
    selected,
    formState,
    control,
    register,
    trigger,
    sx,
  } = props;
  const { t } = useTranslation();

  return (
    <FormControl
      variant="outlined"
      sx={{ marginRight: "10px", flex: "1" }}
      required>
      <Controller
        name={fieldName}
        control={control}
        defaultValue={selected || ""}
        render={({ field }) => (
          <TextField
            {...field}
            select
            size="small"
            label={t(label)}
            variant="outlined"
            value={field.value || ""}
            disabled={disabled || false}
            data-cy={fieldName + "-formSelect"}
            error={Boolean(formState.errors[fieldName])}
            {...register(fieldName, {
              required: required || false,
            })}
            InputLabelProps={{ shrink: true }}
            sx={{
              backgroundColor: getInputFieldBackgroundColor(
                formState.errors[fieldName],
              ),
              borderRadius: "4px",
              marginTop: "10px",
              ...sx,
            }}
            onChange={e => {
              e.stopPropagation();
              field.onChange(e.target.value);
              trigger(fieldName);
            }}>
            {props.children}
          </TextField>
        )}
      />
    </FormControl>
  );
};

export const FormCheckbox = props => {
  const { fieldName, label, checked, disabled, register, trigger, sx } = props;
  const { t } = useTranslation();

  return (
    <FormControlLabel
      control={
        <Checkbox
          data-cy={fieldName + "-formCheckbox"}
          {...register(fieldName)}
          disabled={disabled || false}
          defaultChecked={checked || false}
          onChange={() => {
            trigger(fieldName);
          }}
        />
      }
      label={t(label)}
      sx={{ ...sx }}
    />
  );
};
