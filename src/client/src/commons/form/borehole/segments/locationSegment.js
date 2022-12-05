import React, { useState } from "react";
import CoordinatesSegment from "./coordinatesSegment";
import CantonMunicipalitySegment from "./cantonMunicipalitySegment";
import PointComponent from "../../../map/pointComponent";
import _ from "lodash";

const LocationSegment = props => {
  const {
    size,
    mentions,
    borehole,
    user,
    updateChange,
    checkLock,
    updateNumber,
    cantons,
    municipalities,
    zoomToPolygon,
    domains,
  } = props;

  const [mapPointChange, setMapPointChange] = useState(false);

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
          mentions={mentions}
          borehole={borehole}
          user={user}
          updateChange={updateChange}
          updateNumber={updateNumber}
          checkLock={checkLock}
          mapPointChange={mapPointChange}
          setMapPointChange={setMapPointChange}></CoordinatesSegment>
        <CantonMunicipalitySegment
          size={size}
          mentions={mentions}
          borehole={borehole}
          cantons={cantons}
          municipalities={municipalities}
          zoomToPolygon={zoomToPolygon}></CantonMunicipalitySegment>
      </div>
      <div
        style={{
          flex: "1",
          marginLeft: "1em",
        }}>
        <PointComponent
          setMapPointChange={setMapPointChange}
          applyChange={(x, y, height, cid, mid) => {
            updateChange("location", [x, y, cid, mid, height], false);
          }}
          id={borehole.data.id}
          srs={
            borehole.data.srs !== null && domains.data.hasOwnProperty("srs")
              ? (() => {
                  const code = domains.data.srs.find(element => {
                    return element.id === borehole.data.srs;
                  });
                  if (code !== undefined) {
                    return "EPSG:" + code["code"];
                  }
                  return null;
                })()
              : null
          }
          x={
            _.isNil(borehole.data.location_x)
              ? null
              : _.toNumber(borehole.data.location_x)
          }
          y={
            _.isNil(borehole.data.location_y)
              ? null
              : _.toNumber(borehole.data.location_y)
          }
        />
      </div>
    </div>
  );
};

export default LocationSegment;
