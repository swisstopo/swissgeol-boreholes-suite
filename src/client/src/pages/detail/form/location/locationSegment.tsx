import { useCallback, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Card, Grid, Stack } from "@mui/material";
import { fetchApiV2 } from "../../../../api/fetchApiV2";
import PointComponent from "../../../../components/map/pointComponent";
import { FormSegmentBox } from "../../../../components/styledComponents";
import CantonMunicipalitySegment from "./cantonMunicipalitySegment.tsx";
import { referenceSystems, webApilv03tolv95, webApilv95tolv03 } from "./coordinateSegmentConstants.ts";
import { Location, ReferenceSystemCode, ReferenceSystemKey } from "./coordinateSegmentInterfaces.ts";
import CoordinatesSegment from "./coordinatesSegment.tsx";
import ElevationSegment from "./elevationSegment";
import { LocationBaseProps, LocationFormInputs } from "./locationPanelInterfaces.tsx";

interface LocationSegmentProps extends LocationBaseProps {
  formMethods: UseFormReturn<LocationFormInputs>;
  labelingPanelOpen: boolean;
}

const LocationSegment = ({ borehole, editingEnabled, labelingPanelOpen, formMethods }: LocationSegmentProps) => {
  const [currentLV95X, setCurrentLV95X] = useState(borehole.locationX ? Number(borehole.locationX) : null);
  const [currentLV95Y, setCurrentLV95Y] = useState(borehole.locationY ? Number(borehole.locationY) : null);
  const transformCoordinates = useCallback(async (referenceSystem: string, x: number, y: number) => {
    let apiUrl;
    if (referenceSystem === referenceSystems.LV95.name) {
      apiUrl = webApilv95tolv03;
    } else {
      apiUrl = webApilv03tolv95;
    }
    if (x && y) {
      const response = await fetch(apiUrl + `?easting=${x}&northing=${y}&altitude=0.0&format=json`);
      if (response.ok) {
        return await response.json();
      }
    }
  }, []);

  const setValuesForReferenceSystem = useCallback(
    (referenceSystem: string, X: string, Y: string) => {
      formMethods.setValue(referenceSystems[referenceSystem].fieldName.X, X, {
        shouldValidate: true,
        shouldDirty: true,
      });
      formMethods.setValue(referenceSystems[referenceSystem].fieldName.Y, Y, {
        shouldValidate: true,
        shouldDirty: true,
      });
    },
    [formMethods],
  );

  const setValuesForCountryCantonMunicipality = useCallback(
    (location: Location) => {
      for (const [key, value] of Object.entries(location) as [keyof Location, string][]) {
        formMethods.setValue(key, value, {
          shouldValidate: true,
        });
      }
    },
    [formMethods],
  );

  const handleCoordinateTransformation = useCallback(
    async (
      sourceSystem: ReferenceSystemKey,
      targetSystem: ReferenceSystemKey,
      X: number,
      Y: number,
      XPrecision: number,
      YPrecision: number,
    ) => {
      const response = await transformCoordinates(sourceSystem, X, Y);
      if (!response) return; // Ensure response is valid

      const maxPrecision = Math.max(XPrecision, YPrecision);
      const transformedX = parseFloat(response.easting);
      const transformedY = parseFloat(response.northing);

      const XLV95 = sourceSystem === ReferenceSystemKey.LV95 ? X : transformedX;
      const YLV95 = sourceSystem === ReferenceSystemKey.LV95 ? Y : transformedY;

      setCurrentLV95X(XLV95);
      setCurrentLV95Y(YLV95);

      const location = await fetchApiV2(`location/identify?east=${XLV95}&north=${YLV95}`, "GET");
      setValuesForCountryCantonMunicipality(location);
      setValuesForReferenceSystem(targetSystem, transformedX.toFixed(maxPrecision), transformedY.toFixed(maxPrecision));
    },
    [setValuesForCountryCantonMunicipality, setValuesForReferenceSystem, transformCoordinates],
  );

  const setValuesForNewMapPoint = useCallback(
    (x: string, y: string, height: number, country: string, canton: string, municipality: string) => {
      formMethods.setValue("locationX", x);
      formMethods.setValue("locationY", y);
      height && formMethods.setValue("elevationZ", height);
      formMethods.setValue("country", country);
      formMethods.setValue("canton", canton);
      formMethods.setValue("municipality", municipality);
      formMethods.setValue("originalReferenceSystem", ReferenceSystemCode.LV95);
      handleCoordinateTransformation(
        ReferenceSystemKey.LV95,
        ReferenceSystemKey.LV03,
        parseFloat(x),
        parseFloat(y),
        2,
        2,
      );
    },
    [formMethods, handleCoordinateTransformation],
  );

  return (
    <Stack direction="column" gap={3}>
      <Card sx={{ py: 1, px: 1 }}>
        <Grid container spacing={2}>
          <Grid xs={12} md={12} lg={labelingPanelOpen ? 12 : 6}>
            <CoordinatesSegment
              borehole={borehole}
              editingEnabled={editingEnabled}
              formMethods={formMethods}
              setValuesForReferenceSystem={setValuesForReferenceSystem}
              handleCoordinateTransformation={handleCoordinateTransformation}
              setValuesForCountryCantonMunicipality={setValuesForCountryCantonMunicipality}
            />
          </Grid>
          <Grid xs={12} md={12} lg={labelingPanelOpen ? 12 : 6}>
            <FormSegmentBox>
              <PointComponent
                applyChange={(
                  x: string,
                  y: string,
                  height: number,
                  country: string,
                  canton: string,
                  municipality: string,
                ) => {
                  setValuesForNewMapPoint(x, y, height, country, canton, municipality);
                }}
                id={borehole.id}
                isEditable={editingEnabled}
                x={currentLV95X}
                y={currentLV95Y}
              />
            </FormSegmentBox>
          </Grid>
          <Grid xs={12}>
            <ElevationSegment borehole={borehole} editingEnabled={editingEnabled} formMethods={formMethods} />
          </Grid>
        </Grid>
      </Card>
      <CantonMunicipalitySegment
        country={borehole.country}
        canton={borehole.canton}
        municipality={borehole.municipality}
        formMethods={formMethods}
      />
    </Stack>
  );
};

export default LocationSegment;
