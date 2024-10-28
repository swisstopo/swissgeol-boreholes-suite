import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Card, Stack } from "@mui/material";
import { Borehole } from "../../../../api-lib/ReduxStateInterfaces.ts";
import { BoreholeV2 } from "../../../../api/borehole.ts";
import PointComponent from "../../../../components/map/pointComponent";
import { FormSegmentBox } from "../../../../components/styledComponents";
import CantonMunicipalitySegment from "./cantonMunicipalitySegment.tsx";
import { ReferenceSystemCode } from "./coordinateSegmentInterfaces.ts";
import CoordinatesSegment from "./coordinatesSegment.tsx";
import ElevationSegment from "./elevationSegment";
import { LocationFormInputs } from "./locationPanel.tsx";

interface LocationSegmentProps {
  editingEnabled: boolean;
  borehole: BoreholeV2;
  formMethods: UseFormReturn<LocationFormInputs>;
  updateNumber: (fieldName: keyof Borehole["data"], value: number | null) => void;
}

const LocationSegment = ({ borehole, editingEnabled, formMethods }: LocationSegmentProps) => {
  const [mapPointChange, setMapPointChange] = useState(false);

  return (
    <Stack direction="column" gap={3}>
      <Card sx={{ py: 1, px: 1 }}>
        <Stack direction="row" gap={2} sx={{ flexWrap: "wrap" }}>
          <Stack gap={2} sx={{ flexGrow: 1, minWidth: 600 }}>
            <CoordinatesSegment
              borehole={borehole}
              mapPointChange={mapPointChange}
              setMapPointChange={setMapPointChange}
              editingEnabled={editingEnabled}
              formMethods={formMethods}
            />
            <ElevationSegment borehole={borehole} editingEnabled={editingEnabled} />
          </Stack>
          <FormSegmentBox sx={{ flexGrow: 1 }}>
            <PointComponent
              setMapPointChange={setMapPointChange}
              applyChange={(
                x: string,
                y: string,
                height: number,
                country: string,
                canton: string,
                municipality: string,
              ) => {
                formMethods.setValue("locationX", x.toString());
                formMethods.setValue("locationY", y.toString());
                formMethods.setValue("elevationZ", height);
                formMethods.setValue("country", country);
                formMethods.setValue("canton", canton);
                formMethods.setValue("municipality", municipality);
                formMethods.setValue("originalReferenceSystem", ReferenceSystemCode.LV95);
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
        editingEnabled={editingEnabled}
        formMethods={formMethods}
      />
    </Stack>
  );
};

export default LocationSegment;
