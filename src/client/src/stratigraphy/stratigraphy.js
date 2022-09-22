import React, { useEffect, useState, useRef } from "react";
import * as Styled from "./styles";
import PropTypes from "prop-types";
import Draggable from "react-draggable";

const Stratigraphy = props => {
  const {
    data,
    mapping,
    onSelected,
    getTitle,
    getSubTitle,
    getColor,
    getPattern,
    minimapSelectedLayerStyle,
    unit,
    selectedLayerStyle,
    unselectedLayerStyle,
    overLayerStyle,
  } = props;

  const element = useRef(null);
  const [state, setState] = useState({
    selected: null,
    over: null,
    minimapCursor: "grab",
    scale: 1,
    // Distance from top in px
    top: 0,
    // pixel / meter
    pxm: 0,
    // height of this component in pixels
    height: 0,
    // height of the window in pixels
    wHeight: 0,
  });

  useEffect(() => {
    // eslint-disable-next-line
    updateDimensions();
    // eslint-disable-next-line
    window.addEventListener("resize", updateDimensions, { passive: true });
    return () => {
      // eslint-disable-next-line
      window.removeEventListener("resize", updateDimensions);
    };
    // eslint-disable-next-line
  }, []);

  const handleTitle = layer => {
    if (getTitle !== undefined && typeof getTitle === "function") {
      return getTitle(layer);
    }
    return layer[mapping.title];
  };
  const handleSubTitle = layer => {
    if (getSubTitle !== undefined && typeof getSubTitle === "function") {
      return getSubTitle(layer);
    }
    return layer[mapping.subtitle];
  };
  const handleMouseEnter = layer => {
    setState(prevState => ({
      ...prevState,
      over: layer,
    }));
  };
  const handleMouseLeave = () => {
    setState(prevState => ({
      ...prevState,
      over: null,
    }));
  };
  const handleColor = layer => {
    if (typeof getColor === "function") {
      return getColor(layer[mapping.color]);
    }
    return layer[mapping.color];
  };
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
  const handlePattern = layer => {
    if (typeof getPattern === "function") {
      return getPattern(layer[mapping.pattern]);
    }
    return `url('${layer[mapping.pattern]}')`;
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
    console.log("updateDimensions");
    if (element !== undefined && element !== null) {
      if (data.length > 0) {
      }
      setState(prevState => ({
        ...prevState,
        height: element.current?.clientHeight,
        // add const 1.5 to show the red line in last layer when its selected
        pxm:
          data.length > 0
            ? (element.current?.clientHeight - 1.5) /
              data[data.length - 1][mapping.to]
            : 0,
      }));
    }
  };

  const handleLayerClick = layer => {
    if (onSelected !== undefined && typeof onSelected === "function") {
      onSelected(
        state?.selected === null || state?.selected.id !== layer[mapping.id]
          ? layer
          : null,
      );
    }
    setState(prevState => ({
      ...prevState,
      selected:
        state?.selected === null || state?.selected.id !== layer[mapping.id]
          ? layer
          : null,
    }));
  };

  const rangeHeight = state?.scale * state.height;

  const factor =
    rangeHeight === 0 ? rangeHeight : state.pxm * (state.height / rangeHeight);

  const offset = state.top * (state.height / rangeHeight);

  const titleLimit = 30;
  const subTitleLimit = 50;

  let isLayerSelected = false;
  return (
    <Styled.Container
      onWheel={handleOnWheel}
      ref={element}
      style={{
        ...props.style,
      }}>
      <Styled.FirstColumn>
        {data?.map((layer, idx) => (
          <div key={"stratigraphy-minimap-layer-" + idx}>
            {
              (isLayerSelected =
                state?.selected !== null &&
                state?.selected?.id === layer[mapping.id])
            }
            {/*props.minimapSelectedLayerStyle it's a red border*/}
            <Styled.FirstLayerList
              backgroundColor={handleColor(layer)}
              backgroundImage={handlePattern(layer)}
              height={
                (layer[mapping.to] - layer[mapping.from]) * state.pxm + "px"
              }
              style={{
                ...(isLayerSelected
                  ? minimapSelectedLayerStyle
                  : {
                      border: "thin solid rgb(100, 100, 100)",
                    }),
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
          // position={null}
          position={{
            y: state.top,
            x: 0,
          }}>
          <Styled.LensContainer
            cursor={state.minimapCursor}
            height={rangeHeight + "px"}>
            {rangeHeight >= 40 && (
              <>
                <Styled.LensNumber>
                  {parseInt(state.top / state.pxm, 10) + " " + unit}
                </Styled.LensNumber>
                <div style={{ flex: "1 1 100%" }} />
                <Styled.LensNumber>
                  {parseInt((state.top + rangeHeight) / state.pxm, 10) +
                    " " +
                    unit}
                </Styled.LensNumber>
              </>
            )}
          </Styled.LensContainer>
        </Draggable>
      </Styled.FirstColumn>

      <Styled.ColumnsContainer>
        <Styled.ShakingColumns offset={"-" + offset + "px"}>
          {data.map((layer, idx) => {
            const layerHeight =
              factor * (layer[mapping.to] - layer[mapping.from]);
            return (
              <Styled.LayerInfoList
                key={"stratigraphy-layer-" + idx}
                onClick={() => handleLayerClick(layer)}
                onMouseEnter={() => handleMouseEnter(layer)}
                onMouseLeave={handleMouseLeave}
                height={layerHeight + "px"}
                style={{
                  // what they are doing??? hoverable?
                  ...(state?.selected !== null &&
                  state?.selected.id === layer[mapping.id]
                    ? selectedLayerStyle
                    : state?.selected !== null
                    ? unselectedLayerStyle
                    : null),
                  ...(state?.over !== null &&
                  state?.over[mapping.id] === layer[mapping.id]
                    ? overLayerStyle
                    : null),
                  // until here
                }}>
                <Styled.SecondLayerList
                  backgroundColor={handleColor(layer)}
                  backgroundImage={handlePattern(layer)}>
                  {layerHeight > titleLimit && (
                    <Styled.LayerLength isBig={layerHeight > subTitleLimit}>
                      {layer[mapping.to]} {unit}
                    </Styled.LayerLength>
                  )}
                </Styled.SecondLayerList>

                <Styled.LayerTitleContainer>
                  <Styled.ShakingLayerTitle>
                    {layerHeight > titleLimit && (
                      <Styled.LayerTitle isBig={layerHeight > subTitleLimit}>
                        {handleTitle(layer)}
                      </Styled.LayerTitle>
                    )}
                    {layerHeight > subTitleLimit && (
                      <Styled.LayerSubtitle>
                        {handleSubTitle(layer)}
                      </Styled.LayerSubtitle>
                    )}
                  </Styled.ShakingLayerTitle>
                </Styled.LayerTitleContainer>
              </Styled.LayerInfoList>
            );
          })}
        </Styled.ShakingColumns>
      </Styled.ColumnsContainer>
    </Styled.Container>
  );
};

Stratigraphy.propTypes = {
  data: PropTypes.array,
  getColor: PropTypes.func,
  getPattern: PropTypes.func,
  getSubTitle: PropTypes.func,
  getTitle: PropTypes.func,
  mapping: PropTypes.shape({
    id: PropTypes.string,
    from: PropTypes.string,
    to: PropTypes.string,
    color: PropTypes.string,
    pattern: PropTypes.string,
  }),
  minimapSelectedLayerStyle: PropTypes.object,
  onSelected: PropTypes.func,
  overLayerStyle: PropTypes.object,
  selectedLayerStyle: PropTypes.object,
  style: PropTypes.object,
  unit: PropTypes.string,
  unselectedLayerStyle: PropTypes.object,
};

Stratigraphy.defaultProps = {
  data: [],
  mapping: {
    id: "id",
    from: "from",
    to: "to",
    color: "color",
    pattern: "pattern",
    title: "title",
    subtitle: "subtitle",
  },
  minimapSelectedLayerStyle: {
    border: "2px solid red",
  },
  overLayerStyle: {
    backgroundColor: "rgb(233, 233, 233)",
  },
  selectedLayerStyle: {
    backgroundColor: "rgb(233, 233, 233)",
    borderTop: "2px solid red",
    borderBottom: "2px solid red",
  },
  unit: "m",
  unselectedLayerStyle: {
    borderRight: "2px solid red",
  },
};

export default Stratigraphy;
