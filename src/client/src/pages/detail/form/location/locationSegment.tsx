import { useState } from "react";
import { Stack } from "@mui/material";
import _ from "lodash";
import { Borehole, User } from "../../../../api-lib/ReduxStateInterfaces.ts";
import PointComponent from "../../../../components/map/pointComponent.jsx";
import { FormSegmentBox } from "../../../../components/styledComponents.ts";
import CantonMunicipalitySegment from "./cantonMunicipalitySegment.jsx";
import CoordinatesSegment from "./coordinatesSegment.tsx";
import ElevationSegment from "./elevationSegment";

interface LocationSegmentProps {
  borehole: Borehole;
  user: User;
  updateChange: (
    fieldName: keyof Borehole["data"] | "location",
    value: string | number | null | (number | string | null)[],
    to?: boolean,
  ) => void;
  updateNumber: (fieldName: keyof Borehole["data"], value: number | null) => void;
  showLabeling: boolean;
  editingEnabled: boolean;
}

const LocationSegment = ({
  borehole,
  user,
  updateChange,
  updateNumber,
  showLabeling,
  editingEnabled,
}: LocationSegmentProps) => {
  const [mapPointChange, setMapPointChange] = useState(false);

  return (
    <Stack direction="column" gap={2}>
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
          <ElevationSegment borehole={borehole} user={user} updateChange={updateChange} updateNumber={updateNumber} />
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
      <CantonMunicipalitySegment
        country={borehole.data.custom.country}
        canton={borehole.data.custom.canton}
        municipality={borehole.data.custom.municipality}
        isEditable={editingEnabled}
      />
    </Stack>
  );
};

export default LocationSegment;
