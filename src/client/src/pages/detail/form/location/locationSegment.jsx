import { useState } from "react";
import CantonMunicipalitySegment from "./cantonMunicipalitySegment.jsx";
import PointComponent from "../../../../components/map/pointComponent.jsx";
import _ from "lodash";
import CoordinatesSegment from "./coordinatesSegment.tsx";

const LocationSegment = props => {
  const { size, borehole, user, updateChange, checkLock, updateNumber } = props;

  const [mapPointChange, setMapPointChange] = useState(false);

  const isEditable =
    borehole?.data.role === "EDIT" && borehole?.data.lock !== null && borehole?.data.lock?.id === user?.data.id;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
      }}>
      <div
        style={{
          flex: "1",
        }}>
        <CoordinatesSegment
          size={size}
          borehole={borehole}
          user={user}
          updateChange={updateChange}
          updateNumber={updateNumber}
          checkLock={checkLock}
          mapPointChange={mapPointChange}
          setMapPointChange={setMapPointChange}></CoordinatesSegment>
        <CantonMunicipalitySegment
          size={size}
          country={borehole.data.custom.country}
          canton={borehole.data.custom.canton}
          municipality={borehole.data.custom.municipality}
          isEditable={isEditable}
        />
      </div>
      <div
        style={{
          flex: "1",
          marginLeft: "1em",
        }}>
        <PointComponent
          setMapPointChange={setMapPointChange}
          applyChange={(x, y, height, country, canton, municipality) => {
            updateChange("location", [x, y, height, country, canton, municipality], false);
          }}
          id={borehole.data.id}
          isEditable={isEditable}
          x={_.isNil(borehole.data.location_x) ? null : _.toNumber(borehole.data.location_x)}
          y={_.isNil(borehole.data.location_y) ? null : _.toNumber(borehole.data.location_y)}
        />
      </div>
    </div>
  );
};

export default LocationSegment;
