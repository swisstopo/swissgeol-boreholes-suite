import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { useSelector } from "react-redux";
import { Card, Stack } from "@mui/material";
import { Borehole, ReduxRootState } from "../../../../api-lib/ReduxStateInterfaces.ts";
import { BoreholeV2 } from "../../../../api/borehole.ts";
import PointComponent from "../../../../components/map/pointComponent";
import { FormSegmentBox } from "../../../../components/styledComponents";
import CantonMunicipalitySegment from "./cantonMunicipalitySegment.tsx";
import CoordinatesSegment from "./coordinatesSegment.tsx";
import ElevationSegment from "./elevationSegment";
import { LocationFormInputs } from "./locationPanel.tsx";

interface LocationSegmentProps {
  editingEnabled: boolean;
  borehole: BoreholeV2;
  formMethods: UseFormReturn<LocationFormInputs>;
  updateNumber: (fieldName: keyof Borehole["data"], value: number | null) => void;
  updateChange: (
    fieldName: keyof Borehole["data"],
    value: string | number | boolean | null | (number | string | null)[],
    to?: boolean,
  ) => void;
}

const LocationSegment = ({
  borehole,
  editingEnabled,
  updateChange,
  updateNumber,
  formMethods,
}: LocationSegmentProps) => {
  const [mapPointChange, setMapPointChange] = useState(false);

  const legacyBorehole: Borehole = useSelector((state: ReduxRootState) => state.core_borehole);

  return (
    <Stack direction="column" gap={3}>
      <Card sx={{ py: 1, px: 1 }}>
        <Stack direction="row" gap={2} sx={{ flexWrap: "wrap" }}>
          <Stack gap={2} sx={{ flexGrow: 1, minWidth: 600 }}>
            <CoordinatesSegment
              borehole={legacyBorehole}
              updateChange={updateChange}
              updateNumber={updateNumber}
              mapPointChange={mapPointChange}
              setMapPointChange={setMapPointChange}
              editingEnabled={editingEnabled}
            />
            <ElevationSegment borehole={borehole} editingEnabled={editingEnabled} />
          </Stack>
          <FormSegmentBox sx={{ flexGrow: 1 }}>
            <PointComponent
              setMapPointChange={setMapPointChange}
              //@ts-expect-error legacy component method not typed
              applyChange={(x, y, height, country, canton, municipality) => {
                updateChange("location", [x, y, height, country, canton, municipality], false);
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
