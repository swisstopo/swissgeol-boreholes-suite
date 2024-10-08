import { useState } from "react";
import { Card, Stack } from "@mui/material";
import _ from "lodash";
import { Borehole } from "../../../../api-lib/ReduxStateInterfaces.ts";
import PointComponent from "../../../../components/map/pointComponent.jsx";
import { FormSegmentBox } from "../../../../components/styledComponents";
import CantonMunicipalitySegment from "./cantonMunicipalitySegment";
import CoordinatesSegment from "./coordinatesSegment";
import ElevationSegment from "./elevationSegment";
import { SegmentProps } from "./segmentInterface.ts";

interface LocationSegmentProps extends SegmentProps {
  showLabeling: boolean;
  editingEnabled: boolean;
  updateNumber: (fieldName: keyof Borehole["data"], value: number | null) => void;
}

const LocationSegment = ({
  borehole,
  updateChange,
  updateNumber,
  showLabeling,
  editingEnabled,
}: LocationSegmentProps) => {
  const [mapPointChange, setMapPointChange] = useState(false);

  return (
    <Stack direction="column" gap={3}>
      <Card sx={{ py: 1, px: 1 }}>
        <Stack direction="row" gap={2} sx={{ flexWrap: "wrap" }}>
          <Stack gap={2} sx={{ flexGrow: 1, minWidth: 600 }}>
            <CoordinatesSegment
              borehole={borehole}
              updateChange={updateChange}
              updateNumber={updateNumber}
              mapPointChange={mapPointChange}
              setMapPointChange={setMapPointChange}
              showLabeling={showLabeling}
              editingEnabled={editingEnabled}
            />
            <ElevationSegment
              borehole={borehole}
              updateChange={updateChange}
              updateNumber={updateNumber}
              editingEnabled={editingEnabled}
            />
          </Stack>

          <FormSegmentBox sx={{ flexGrow: 1 }}>
            <PointComponent
              setMapPointChange={setMapPointChange}
              //@ts-expect-error legacy component method not typed
              applyChange={(x, y, height, country, canton, municipality) => {
                updateChange("location", [x, y, height, country, canton, municipality], false);
              }}
              id={borehole.data.id}
              isEditable={editingEnabled}
              x={_.isNil(borehole.data.location_x) ? null : _.toNumber(borehole.data.location_x)}
              y={_.isNil(borehole.data.location_y) ? null : _.toNumber(borehole.data.location_y)}
            />
          </FormSegmentBox>
        </Stack>
      </Card>
      <CantonMunicipalitySegment
        country={borehole.data.custom.country}
        canton={borehole.data.custom.canton}
        municipality={borehole.data.custom.municipality}
        editingEnabled={editingEnabled}
      />
    </Stack>
  );
};

export default LocationSegment;
