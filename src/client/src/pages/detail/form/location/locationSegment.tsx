import { useState } from "react";
import { useSelector } from "react-redux";
import { Card, Stack } from "@mui/material";
import _ from "lodash";
import { Borehole, ReduxRootState } from "../../../../api-lib/ReduxStateInterfaces.ts";
import { BoreholeV2 } from "../../../../api/borehole.ts";
import PointComponent from "../../../../components/map/pointComponent";
import { FormSegmentBox } from "../../../../components/styledComponents";
import CantonMunicipalitySegment from "./cantonMunicipalitySegment.tsx";
import CoordinatesSegment from "./coordinatesSegment.tsx";
import ElevationSegment from "./elevationSegment";

interface LocationSegmentProps {
  editingEnabled: boolean;
  borehole: BoreholeV2;
  updateNumber: (fieldName: keyof Borehole["data"], value: number | null) => void;
  updateChange: (
    fieldName: keyof Borehole["data"],
    value: string | number | boolean | null | (number | string | null)[],
    to?: boolean,
  ) => void;
}

const LocationSegment = ({ borehole, editingEnabled, updateChange, updateNumber }: LocationSegmentProps) => {
  const [mapPointChange, setMapPointChange] = useState(false);

  const legacyBorehole: Borehole = useSelector((state: ReduxRootState) => state.core_borehole);

  /// Todo get borehole from redux, impor updateChange , updateNumber
  /// adapt tests
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
            {/* eslint-disable-next-line react/jsx-no-undef */}
            <PointComponent
              setMapPointChange={setMapPointChange}
              //@ts-expect-error legacy component method not typed
              applyChange={(x, y, height, country, canton, municipality) => {
                updateChange("location", [x, y, height, country, canton, municipality], false);
              }}
              id={legacyBorehole.data.id}
              isEditable={editingEnabled}
              x={_.isNil(legacyBorehole.data.location_x) ? null : _.toNumber(legacyBorehole.data.location_x)}
              y={_.isNil(legacyBorehole.data.location_y) ? null : _.toNumber(legacyBorehole.data.location_y)}
            />
          </FormSegmentBox>
        </Stack>
      </Card>
      <CantonMunicipalitySegment
        country={legacyBorehole.data.custom.country}
        canton={legacyBorehole.data.custom.canton}
        municipality={legacyBorehole.data.custom.municipality}
        editingEnabled={editingEnabled}
      />
    </Stack>
  );
};

export default LocationSegment;
