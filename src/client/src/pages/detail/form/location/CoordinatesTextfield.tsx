import { Direction, ReferenceSystemKey } from "./coordinateSegmentInterfaces";
import { useTranslation } from "react-i18next";
import { TextField } from "@mui/material";
import { NumericFormatForCoordinates } from "./NumericFormatForCoordinates.tsx";
import { Controller, useFormContext } from "react-hook-form";
import { FC } from "react";
import { getFormFieldError } from "../../../../components/form/form.ts";

interface CoordinatesTextfieldProps {
  fieldName: string;
  inBounds: (value: string) => boolean;
  referenceSystem: ReferenceSystemKey;
  direction: Direction;
  onCoordinateChange: (referenceSystem: ReferenceSystemKey, direction: Direction, value: string) => void;
  isFieldForSelectedReferenceSystem: boolean;
  editingEnabled: boolean;
}

export const CoordinatesTextfield: FC<CoordinatesTextfieldProps> = ({
  fieldName,
  inBounds,
  onCoordinateChange,
  referenceSystem,
  direction,
  isFieldForSelectedReferenceSystem,
  editingEnabled,
}: CoordinatesTextfieldProps) => {
  const { t } = useTranslation();
  const { control } = useFormContext();
  return (
    <Controller
      name={fieldName}
      control={control}
      rules={{
        onChange: e => {
          onCoordinateChange(referenceSystem, direction, e.target.value);
        },
        required: true,
        validate: inBounds,
      }}
      render={({ field, formState }) => (
        <TextField
          sx={{ pointerEvents: editingEnabled ? "auto" : "none" }}
          size="small"
          label={t(`location_${direction.toLowerCase()}_${referenceSystem}`)}
          InputLabelProps={{ shrink: true }}
          error={getFormFieldError(fieldName, formState.errors)}
          disabled={!isFieldForSelectedReferenceSystem}
          data-cy={`${referenceSystem}${direction}`}
          value={field.value}
          onChange={field.onChange}
          name={field.name}
          id={`component-outlined-${fieldName}`}
          inputProps={{
            input: {
              readOnly: !editingEnabled,
            },
          }}
          InputProps={{
            /* eslint-disable  @typescript-eslint/no-explicit-any */
            inputComponent: NumericFormatForCoordinates as any,
          }}
        />
      )}
    />
  );
};
