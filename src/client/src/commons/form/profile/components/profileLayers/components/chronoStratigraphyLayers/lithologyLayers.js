import React, { useEffect, useRef } from "react";
import * as Styled from "./lithologyLayerStyles";
import PropTypes from "prop-types";
import Draggable from "react-draggable";
import { NumericFormat } from "react-number-format";
import { useLayers } from "../../../../../../../api/fetchApiV2";
import { CircularProgress } from "@mui/material";

const LithologyLayers = props => {
  const { stratigraphyId, navigationState, setNavigationState, unit } = props;

  const { data } = useLayers(stratigraphyId);

  const element = useRef(null);

  useEffect(() => {
    updateDimensions();
    window.addEventListener("resize", updateDimensions, { passive: true });
    return () => {
      window.removeEventListener("resize", updateDimensions);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleColor = layer =>
    `rgb(${(
      JSON.parse(layer?.lithostratigraphy?.conf ?? null)?.color ?? [
        255, 255, 255,
      ]
    ).join()})`;

  const handlePattern = layer =>
    `url(/img/lit/${JSON.parse(layer?.lithology?.conf ?? null)?.image})`;

  const handleOnWheel = event => {
    event.stopPropagation();

    let scale = navigationState?.scale;
    let factor = 0.05;
    if (scale >= 0.75) {
      factor = 0.1;
    } else if (scale >= 0.5) {
      factor = 0.05;
    } else if (scale >= 0.2) {
      factor = 0.025;
    } else if (scale >= 0.05) {
      factor = 0.01;
    } else if (scale < 0.05) {
      factor = 0.005;
    }

    if (event.deltaY < 0) {
      scale -= factor;
    } else {
      scale += factor;
    }

    const rangeHeight = scale * navigationState?.height;

    let topOfLense = navigationState?.top;
    if (navigationState?.top + rangeHeight > navigationState?.height) {
      topOfLense =
        navigationState?.top -
        (navigationState?.top + rangeHeight - navigationState?.height);
    }

    setNavigationState(prevState => ({
      ...prevState,
      scale: Math.min(Math.max(0.02, scale), 1),
      top: topOfLense < 0 ? 0 : topOfLense,
    }));
  };

  const handleStart = (e, data) => {
    setNavigationState(prevState => ({
      ...prevState,
      minimapCursor: "grabbing",
    }));
  };

  const handleDrag = (e, data) => {
    if (data.y !== navigationState?.top) {
      setNavigationState(prevState => ({ ...prevState, top: data.y }));
    }
  };

  const handleStop = (e, data) => {
    setNavigationState(prevState => ({
      ...prevState,
      minimapCursor: "grab",
    }));
  };

  const updateDimensions = () => {
    if (element !== undefined && element !== null && data) {
      const newHeight = element.current?.clientHeight;
      setNavigationState(prevState => ({
        ...prevState,
        height: newHeight,
        pxm:
          data.length > 0
            ? newHeight /
              Math.max(...data.map(l => l.toDepth).filter(l => l !== null))
            : 0,
      }));
    }
  };

  const lensHeight = navigationState?.scale * navigationState.height;

  const titleLimit = 30;
  const subTitleLimit = 50;

  if (!data) {
    return <CircularProgress />;
  }

  return (
    <Styled.Container
      onWheel={handleOnWheel}
      ref={element}
      style={{
        ...props.style,
      }}>
      <Styled.FirstColumn>
        {data
          ?.sort((a, b) => a.fromDepth - b.fromDepth)
          ?.map((layer, idx) => (
            <div key={"stratigraphy-minimap-layer-" + idx}>
              <Styled.FirstLayerList
                backgroundColor={handleColor(layer)}
                backgroundImage={handlePattern(layer)}
                height={
                  (layer.toDepth - layer.fromDepth) * navigationState.pxm + "px"
                }
                style={{
                  border: "thin solid rgb(100, 100, 100)",
                }}
              />
            </div>
          ))}
        <Draggable
          axis="y"
          bounds="parent"
          defaultPosition={{ x: 0, y: 0 }}
          onDrag={handleDrag}
          onStart={handleStart}
          onStop={handleStop}
          position={{
            y: navigationState.top,
            x: 0,
          }}>
          <Styled.LensContainer
            cursor={navigationState.minimapCursor}
            height={lensHeight + "px"}>
            {lensHeight >= 40 && (
              <>
                <Styled.LensNumber>
                  <NumericFormat
                    value={parseInt(
                      navigationState.top / navigationState.pxm,
                      10,
                    )}
                    thousandSeparator="'"
                    displayType="text"
                    suffix={" " + unit}
                  />
                </Styled.LensNumber>
                <div style={{ flex: "1 1 100%" }} />
                <Styled.LensNumber>
                  <NumericFormat
                    value={parseInt(
                      (navigationState.top + lensHeight) / navigationState.pxm,
                      10,
                    )}
                    thousandSeparator="'"
                    displayType="text"
                    suffix={" " + unit}
                  />
                </Styled.LensNumber>
              </>
            )}
          </Styled.LensContainer>
        </Draggable>
      </Styled.FirstColumn>

      <Styled.ColumnsContainer>
        <Styled.ShakingColumns
          offset={`${-navigationState.top / navigationState.scale}px`}>
          {data.map((layer, idx) => {
            const layerHeight =
              (navigationState.pxm / navigationState.scale) *
              (layer.toDepth - layer.fromDepth);
            return (
              <Styled.LayerInfoList
                data-cy={"stratigraphy-layer-" + idx}
                key={"stratigraphy-layer-" + idx}
                height={layerHeight + "px"}>
                <Styled.SecondLayerList
                  backgroundColor={handleColor(layer)}
                  backgroundImage={handlePattern(layer)}>
                  {layerHeight > titleLimit && (
                    <Styled.LayerLength isBig={layerHeight > subTitleLimit}>
                      <NumericFormat
                        value={layer.toDepth}
                        thousandSeparator="'"
                        displayType="text"
                        suffix={" " + unit}
                      />
                    </Styled.LayerLength>
                  )}
                </Styled.SecondLayerList>
              </Styled.LayerInfoList>
            );
          })}
        </Styled.ShakingColumns>
      </Styled.ColumnsContainer>
    </Styled.Container>
  );
};

LithologyLayers.propTypes = {
  stratigraphyId: PropTypes.number,
  navigationState: PropTypes.object,
  onNavigationChanged: PropTypes.func,
  unit: PropTypes.string,
};

LithologyLayers.defaultProps = {
  stratigraphyId: null,
  navigationState: null,
  onNavigationChanged: null,
  unit: "m",
};

export default LithologyLayers;
