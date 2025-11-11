import { FC, useContext } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { SxProps } from "@mui/material";
import { TextField } from "@mui/material/";
import { EditStateContext } from "../../pages/detail/editStateContext.tsx";
import { boundingBox } from "../../pages/detail/form/location/coordinateSegmentConstants.ts";
import { Direction, ReferenceSystemKey } from "../../pages/detail/form/location/coordinateSegmentInterfaces.ts";
import { getFormFieldError } from "./form";
import { getFieldBorderColor, parseFloatWithThousandsSeparator } from "./formUtils.ts";
import { NumericFormatWithThousandSeparator } from "./numericFormatWithThousandSeparator.tsx";
import { useLabelOverflow } from "./useLabelOverflow.tsx";

const inLV95XBounds = (value: string): boolean => {
  const coordinate = parseFloatWithThousandsSeparator(value);
  if (!coordinate) return false;
  return boundingBox.LV95.X.Min < coordinate && coordinate < boundingBox.LV95.X.Max;
};

const inLV95YBounds = (value: string): boolean => {
  const coordinate = parseFloatWithThousandsSeparator(value);
  if (!coordinate) return false;
  return boundingBox.LV95.Y.Min < coordinate && coordinate < boundingBox.LV95.Y.Max;
};

const inLV03XBounds = (value: string): boolean => {
  const coordinate = parseFloatWithThousandsSeparator(value);
  if (!coordinate) return false;
  return boundingBox.LV03.X.Min < coordinate && coordinate < boundingBox.LV03.X.Max;
};

const inLV03YBounds = (value: string): boolean => {
  const coordinate = parseFloatWithThousandsSeparator(value);
  if (!coordinate) return false;
  return boundingBox.LV03.Y.Min < coordinate && coordinate < boundingBox.LV03.Y.Max;
};

export interface FormCoordinateProps {
  fieldName: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  value?: string;
  referenceSystem: ReferenceSystemKey;
  direction: Direction;
  sx?: SxProps;
  className?: string;
  onUpdate: (referenceSystem: ReferenceSystemKey, direction: Direction, value: string) => void;
}

export const FormCoordinate: FC<FormCoordinateProps> = ({
  fieldName,
  required,
  disabled,
  readonly,
  value,
  referenceSystem,
  direction,
  sx,
  className,
  onUpdate,
}) => {
  const { t } = useTranslation();
  const { formState, register } = useFormContext();
  const { editingEnabled } = useContext(EditStateContext);
  const { labelWithTooltip } = useLabelOverflow(`location_${direction.toLowerCase()}_${referenceSystem}`);
  const isReadOnly = readonly ?? !editingEnabled;

  const formFieldError = getFormFieldError(fieldName, formState.errors);

  return (
    <TextField
      required={required || false}
      error={!className?.includes("ai") && !disabled && !!formFieldError}
      helperText={formFieldError?.message ? t(formFieldError?.message) : ""}
      sx={{
        flex: "1",
        ...sx,
        ...getFieldBorderColor(isReadOnly),
      }}
      className={`${isReadOnly ? "readonly" : ""} ${className ?? ""}`}
      label={labelWithTooltip}
      {...register(fieldName, {
        required: required || false,
        validate: value => {
          if (referenceSystem === ReferenceSystemKey.LV95) {
            return direction === Direction.X ? inLV95XBounds(value) : inLV95YBounds(value);
          } else {
            return direction === Direction.X ? inLV03XBounds(value) : inLV03YBounds(value);
          }
        },
        onChange: e => {
          if (!disabled) {
            onUpdate(referenceSystem, direction, e.target.value);
          }
        },
      })}
      value={value}
      disabled={disabled || false}
      data-cy={fieldName + "-formCoordinate"}
      InputProps={{
        /* eslint-disable  @typescript-eslint/no-explicit-any */
        inputComponent: NumericFormatWithThousandSeparator as any,
        readOnly: isReadOnly,
        disabled: disabled,
      }}
    />
  );
};
