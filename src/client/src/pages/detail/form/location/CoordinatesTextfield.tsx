import { Direction, ReferenceSystemKey } from "./coordinateSegmentInterfaces";
import { useTranslation } from "react-i18next";
import { TextField } from "@mui/material";
import { NumericFormatForCoordinates } from "./NumericFormatForCoordinates.tsx";
import { Controller, useFormContext } from "react-hook-form";
import { FC } from "react";
import { getFormFieldError } from "../../../../components/form/form.ts";
import { theme } from "../../../../AppTheme.ts";

interface CoordinatesTextfieldProps {
  fieldName: string;
  panelOpen: boolean;
  inBounds: (value: string) => boolean;
  referenceSystem: ReferenceSystemKey;
  direction: Direction;
  onCoordinateChange: (referenceSystem: ReferenceSystemKey, direction: Direction, value: string) => void;
  isFieldForSelectedReferenceSystem: boolean;
  editingEnabled: boolean;
}

export const CoordinatesTextfield: FC<CoordinatesTextfieldProps> = ({
  fieldName,
  panelOpen,
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
          sx={{
            pointerEvents: editingEnabled ? "auto" : "none",
            boxShadow: panelOpen ? `0px 0px 0px 3px ${theme.palette.ai.main}` : "none",
            borderRadius: "4px",
          }}
          size="small"
          label={t(`location_${direction.toLowerCase()}_${referenceSystem}`)}
          InputLabelProps={{
            shrink: true,
            sx: {
              backgroundColor: panelOpen ? "#ffffff" : "none",
              px: panelOpen ? 1 : 0,
            },
          }}
          error={!panelOpen && getFormFieldError(fieldName, formState.errors)}
          disabled={!isFieldForSelectedReferenceSystem}
          data-cy={`${referenceSystem}${direction}`}
          value={field.value}
          onChange={field.onChange}
          name={field.name}
          id={`component-outlined-${fieldName}`}
          inputProps={{
            readOnly: !editingEnabled,
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
