import React, { useEffect, useState, useRef } from "react";
import * as Styled from "./lithologyLayersstyles";
import PropTypes from "prop-types";
import Draggable from "react-draggable";
import { NumericFormat } from "react-number-format";
import { useLayers } from "../../../../../../../api/fetchApiV2";
import { CircularProgress } from "@mui/material";

const LithologyLayers = props => {
  const { stratigraphyId, onNavigationChanged, unit } = props;

  const { data } = useLayers(stratigraphyId);

  const element = useRef(null);
  const [state, setState] = useState({
    minimapCursor: "grab",
    scale: 1,
    // Distance from top in px
    top: 0,
    // pixel / meter
    pxm: 0,
    // height of this component in pixels
    height: 0,
  });

  useEffect(() => {
    updateDimensions();
    window.addEventListener("resize", updateDimensions, { passive: true });
    return () => {
      window.removeEventListener("resize", updateDimensions);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof onNavigationChanged === "function") {
      onNavigationChanged(state);
    }
  }, [onNavigationChanged, state]);

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

    let scale = state?.scale;
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

    const rangeHeight = scale * state?.height;

    let topOfLense = state?.top;
    if (state?.top + rangeHeight > state?.height) {
      topOfLense = state?.top - (state?.top + rangeHeight - state?.height);
    }

    setState(prevState => ({
      ...prevState,
      scale: Math.min(Math.max(0.02, scale), 1),
      top: topOfLense < 0 ? 0 : topOfLense,
    }));
  };

  const handleStart = (e, data) => {
    setState(prevState => ({
      ...prevState,
      minimapCursor: "grabbing",
    }));
  };

  const handleDrag = (e, data) => {
    if (data.y !== state?.top) {
      setState(prevState => ({ ...prevState, top: data.y }));
    }
  };

  const handleStop = (e, data) => {
    setState(prevState => ({
      ...prevState,
      minimapCursor: "grab",
    }));
  };

  const updateDimensions = () => {
    if (element !== undefined && element !== null && data) {
      const newHeight = element.current?.clientHeight;
      setState(prevState => ({
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

  const lensHeight = state?.scale * state.height;

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
                height={(layer.toDepth - layer.fromDepth) * state.pxm + "px"}
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
            y: state.top,
            x: 0,
          }}>
          <Styled.LensContainer
            cursor={state.minimapCursor}
            height={lensHeight + "px"}>
            {lensHeight >= 40 && (
              <>
                <Styled.LensNumber>
                  <NumericFormat
                    value={parseInt(state.top / state.pxm, 10)}
                    thousandSeparator="'"
                    displayType="text"
                    suffix={" " + unit}
                  />
                </Styled.LensNumber>
                <div style={{ flex: "1 1 100%" }} />
                <Styled.LensNumber>
                  <NumericFormat
                    value={parseInt((state.top + lensHeight) / state.pxm, 10)}
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
        <Styled.ShakingColumns offset={`${-state.top / state.scale}px`}>
          {data.map((layer, idx) => {
            const layerHeight =
              (state.pxm / state.scale) * (layer.toDepth - layer.fromDepth);
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
  onNavigationChanged: PropTypes.func,
  unit: PropTypes.string,
};

LithologyLayers.defaultProps = {
  stratigraphyId: null,
  onNavigationChanged: null,
  unit: "m",
};

export default LithologyLayers;
