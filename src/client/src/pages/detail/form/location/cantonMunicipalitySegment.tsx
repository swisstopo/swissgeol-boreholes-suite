import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { InputAdornment } from "@mui/material";
import { Card, CardContent } from "@mui/material/";
import { MapPin } from "lucide-react";
import { FormContainer, FormValueType } from "../../../../components/form/form";
import { FormInput } from "../../../../components/form/formInput";

interface CantonMunicipalitySegmentProps {
  country: string;
  canton: string;
  municipality: string;
  isEditable: boolean;
}

const CantonMunicipalitySegment = ({ country, canton, municipality, isEditable }: CantonMunicipalitySegmentProps) => {
  const formMethods = useForm({
    mode: "all",
  });

  useEffect(() => {
    formMethods.setValue("country", country);
  }, [formMethods, country]);

  useEffect(() => {
    formMethods.setValue("canton", canton);
  }, [formMethods, canton]);

  useEffect(() => {
    formMethods.setValue("city", municipality);
  }, [formMethods, municipality]);

  return (
    <FormProvider {...formMethods}>
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
              readonly={!isEditable}
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
              readonly={!isEditable}
            />

            <FormInput
              fieldName={"city"}
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
              readonly={!isEditable}
            />
          </FormContainer>
        </CardContent>
      </Card>
    </FormProvider>
  );
};

export default CantonMunicipalitySegment;
