import { Direction, FormValues, ReferenceSystemKey } from "./coordinateSegmentInterfaces";
import { useTranslation } from "react-i18next";
import { FieldError } from "react-hook-form/dist/types/errors";
import Input from "@mui/material/Input";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import { NumericFormatForCoordinates } from "./NumericFormatForCoordinates.tsx";
import { ControllerRenderProps } from "react-hook-form";

interface CoordinatesTextfieldProps {
  field: ControllerRenderProps<FormValues, keyof FormValues>;
  error: FieldError | undefined;
  referenceSystem: ReferenceSystemKey;
  direction: Direction;
  onCoordinateChange: (referenceSystem: ReferenceSystemKey, direction: Direction, value: string) => void;
  isFieldForSelectedReferenceSystem: boolean;
  isEditable: boolean;
}

export const CoordinatesTextfield = ({
  field,
  error,
  onCoordinateChange,
  referenceSystem,
  direction,
  isFieldForSelectedReferenceSystem,
  isEditable,
}: CoordinatesTextfieldProps) => {
  const { t } = useTranslation();

  return (
    <FormControl variant="standard" error={!!error} disabled={!isFieldForSelectedReferenceSystem}>
      <InputLabel htmlFor="formatted-text-mask-input">
        {t(`location_${direction.toLowerCase()}_${referenceSystem}`)}
      </InputLabel>
      <Input
        data-cy={`${referenceSystem}${direction}`}
        value={field.value}
        onChange={e => {
          onCoordinateChange(referenceSystem, direction, e.target.value);
          field.onChange(e);
        }}
        name={field.name}
        readOnly={!isFieldForSelectedReferenceSystem || !isEditable}
        style={{
          opacity: !isFieldForSelectedReferenceSystem ? 0.6 : 1,
          pointerEvents: !isFieldForSelectedReferenceSystem ? "none" : "auto",
        }}
        /* eslint-disable  @typescript-eslint/no-explicit-any */
        inputComponent={NumericFormatForCoordinates as any}
      />
    </FormControl>
  );
};
