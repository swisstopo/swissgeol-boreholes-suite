import { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { InputAdornment } from "@mui/material";
import { Card, CardContent } from "@mui/material/";
import { MapPin } from "lucide-react";
import { FormContainer, FormValueType } from "../../../../components/form/form";
import { FormInput } from "../../../../components/form/formInput";
import { LocationFormInputs } from "./locationPanelInterfaces.tsx";

interface CantonMunicipalitySegmentProps {
  country: string;
  canton: string;
  municipality: string;
  editingEnabled: boolean;
  formMethods: UseFormReturn<LocationFormInputs>;
}

const CantonMunicipalitySegment = ({
  country,
  canton,
  municipality,
  editingEnabled,
  formMethods,
}: CantonMunicipalitySegmentProps) => {
  useEffect(() => {
    formMethods.setValue("country", country);
  }, [formMethods, country]);

  useEffect(() => {
    formMethods.setValue("canton", canton);
  }, [formMethods, canton]);

  useEffect(() => {
    formMethods.setValue("municipality", municipality);
  }, [formMethods, municipality]);

  return (
    <Card>
      <CardContent sx={{ pt: 4, px: 3 }}>
        <FormContainer direction="row">
          <FormInput
            fieldName={"country"}
            label="country"
            type={FormValueType.Text}
            value={country ?? ""}
            inputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <MapPin />
                </InputAdornment>
              ),
            }}
            readonly={!editingEnabled}
          />
          <FormInput
            fieldName={"canton"}
            label="canton"
            type={FormValueType.Text}
            value={canton ?? ""}
            inputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <MapPin />
                </InputAdornment>
              ),
            }}
            readonly={!editingEnabled}
          />
          <FormInput
            fieldName={"municipality"}
            label="city"
            type={FormValueType.Text}
            value={municipality ?? ""}
            inputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <MapPin />
                </InputAdornment>
              ),
            }}
            readonly={!editingEnabled}
          />
        </FormContainer>
      </CardContent>
    </Card>
  );
};

export default CantonMunicipalitySegment;
