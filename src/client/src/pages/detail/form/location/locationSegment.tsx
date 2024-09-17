import { useState } from "react";
import CantonMunicipalitySegment from "./cantonMunicipalitySegment.jsx";
import PointComponent from "../../../../components/map/pointComponent.jsx";
import _ from "lodash";
import CoordinatesSegment from "./coordinatesSegment.tsx";
import ElevationSegment from "./elevationSegment";
import { Box, Stack } from "@mui/material";
import { Borehole, User } from "../../../../api-lib/ReduxStateInterfaces.ts";

interface LocationSegmentProps {
  size: string;
  borehole: Borehole;
  user: User;
  updateChange: (
    fieldName: keyof Borehole["data"] | "location",
    value: string | number | null | (number | string | null)[],
    to?: boolean,
  ) => void;
  updateNumber: (fieldName: keyof Borehole["data"], value: number | null) => void;
  checkLock: () => boolean;
  showLabeling: boolean;
}

const LocationSegment = ({
  borehole,
  user,
  updateChange,
  checkLock,
  updateNumber,
  showLabeling,
}: LocationSegmentProps) => {
  const [mapPointChange, setMapPointChange] = useState(false);

  const isEditable =
    borehole?.data.role === "EDIT" && borehole?.data.lock !== null && borehole?.data.lock?.id === user?.data.id;

  return (
    <Stack direction="column" gap={2}>
      <Stack direction="row" gap={2} sx={{ flexWrap: "wrap" }}>
        <Stack gap={2} sx={{ flexGrow: 1, minWidth: 600 }}>
          <CoordinatesSegment
            borehole={borehole}
            updateChange={updateChange}
            updateNumber={updateNumber}
            checkLock={checkLock}
            mapPointChange={mapPointChange}
            setMapPointChange={setMapPointChange}
            showLabeling={showLabeling}
            isEditable={isEditable}
          />
          <ElevationSegment borehole={borehole} user={user} updateChange={updateChange} updateNumber={updateNumber} />
        </Stack>
        <Box sx={{ flexGrow: 1, minWidth: 600 }}>
          <PointComponent
            setMapPointChange={setMapPointChange}
            //@ts-expect-error legacy component method not typed
            applyChange={(x, y, height, country, canton, municipality) => {
              updateChange("location", [x, y, height, country, canton, municipality], false);
            }}
            id={borehole.data.id}
            isEditable={isEditable}
            x={_.isNil(borehole.data.location_x) ? null : _.toNumber(borehole.data.location_x)}
            y={_.isNil(borehole.data.location_y) ? null : _.toNumber(borehole.data.location_y)}
          />
        </Box>
      </Stack>
      <CantonMunicipalitySegment
        country={borehole.data.custom.country}
        canton={borehole.data.custom.canton}
        municipality={borehole.data.custom.municipality}
        isEditable={isEditable}
      />
    </Stack>
  );
};

export default LocationSegment;
