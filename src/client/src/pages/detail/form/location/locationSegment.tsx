import { useCallback } from "react";
import { UseFormReturn } from "react-hook-form";
import { Card, Stack } from "@mui/material";
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
}

const LocationSegment = ({ borehole, editingEnabled, formMethods }: LocationSegmentProps) => {
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
      const transformedX = parseFloat(response.easting).toFixed(maxPrecision);
      const transformedY = parseFloat(response.northing).toFixed(maxPrecision);

      const location = await fetchApiV2(`location/identify?east=${X}&north=${Y}`, "GET");
      setValuesForCountryCantonMunicipality(location);
      setValuesForReferenceSystem(targetSystem, transformedX, transformedY);
    },
    [setValuesForCountryCantonMunicipality, setValuesForReferenceSystem, transformCoordinates],
  );

  const setValuesForNewMapPoint = useCallback(
    (x: string, y: string, height: number, country: string, canton: string, municipality: string) => {
      formMethods.setValue("locationX", x);
      formMethods.setValue("locationY", y);
      formMethods.setValue("elevationZ", height);
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
        <Stack direction="row" gap={2} sx={{ flexWrap: "wrap" }}>
          <Stack gap={2} sx={{ flexGrow: 1, minWidth: 600 }}>
            <CoordinatesSegment
              borehole={borehole}
              editingEnabled={editingEnabled}
              formMethods={formMethods}
              setValuesForReferenceSystem={setValuesForReferenceSystem}
              handleCoordinateTransformation={handleCoordinateTransformation}
              setValuesForCountryCantonMunicipality={setValuesForCountryCantonMunicipality}
            />
            <ElevationSegment borehole={borehole} editingEnabled={editingEnabled} />
          </Stack>
          <FormSegmentBox sx={{ flexGrow: 1 }}>
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
              x={borehole.locationX ? Number(borehole.locationX) : null}
              y={borehole.locationY ? Number(borehole.locationY) : null}
            />
          </FormSegmentBox>
        </Stack>
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
