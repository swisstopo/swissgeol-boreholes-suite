import { Dispatch, FC, ReactNode, RefObject, SetStateAction, useEffect, useRef, useState } from "react";
import { Stack, SxProps } from "@mui/material";
import useResizeObserver from "@react-hook/resize-observer";
import { clamp } from "./clamp.js";

const getMax = (obj: Record<string, number>): number => {
  const childValues = Object.values(obj);
  return childValues.length === 0 ? 0 : Math.max(...childValues);
};

type ContentHeights = Record<string, number>;
type HeaderHeights = Record<string, number>;

interface NavStateProps {
  lensStart?: number;
  rawLensSize?: number;
  height?: number;
  contentHeights?: ContentHeights;
  headerHeights?: HeaderHeights;
}

export class NavState {
  #maxContent: number;
  #maxHeader: number;
  #pxpm: number;
  #lensEnd: number;

  lensStart: number;
  rawLensSize: number;
  height: number;
  contentHeights: ContentHeights;
  headerHeights: HeaderHeights;

  constructor(navState?: NavStateProps) {
    // At which depth in meter does the visible part begin
    this.lensStart = navState?.lensStart ?? 0;

    // How many meters are visible. Zero is a special value and means 'use maxContent'.
    this.rawLensSize = navState?.rawLensSize ?? 0;

    // height of this component in pixels
    this.height = navState?.height ?? 0;

    // What is the maximum depth in meters of the content
    // This is a dictionary. Every child should enter its value on a separate key
    this.contentHeights = Object.freeze({ ...navState?.contentHeights });

    // height of the header for each children
    this.headerHeights = Object.freeze({ ...navState?.headerHeights });

    // calculated values
    this.#maxContent = getMax(this.contentHeights);
    this.#maxHeader = getMax(this.headerHeights);
    this.#pxpm = (this.height - this.maxHeader) / this.lensSize;
    this.#lensEnd = this.lensStart + this.lensSize;

    Object.freeze(this);
  }

  setLensStart(newLensStart: number): NavState {
    return new NavState({ ...this, lensStart: newLensStart });
  }

  setLensSize(newLensSize: number): NavState {
    return new NavState({ ...this, rawLensSize: newLensSize });
  }

  setHeight(newHeight: number): NavState {
    return new NavState({ ...this, height: newHeight });
  }

  setContentHeightFromLayers(name: string, layers: { toDepth: number }[]): NavState {
    const height = !layers ? 0 : layers.reduce((a, x) => (x.toDepth > a ? x.toDepth : a), 0);
    return this.setContentHeight(name, height);
  }

  setContentHeight(name: string, height: number): NavState {
    const temp = new NavState({
      ...this,
      contentHeights: { ...this.contentHeights, [name]: height },
    });

    // adjust the lens if it is outside the content
    if (temp.lensStart + temp.lensSize > temp.maxContent) {
      const newLensStart = Math.max(0, temp.maxContent - temp.lensSize);
      const newLensSize = temp.maxContent - newLensStart;

      return new NavState({
        ...temp,
        lensStart: newLensStart,
        rawLensSize: newLensSize,
      });
    } else {
      return temp;
    }
  }

  setHeaderHeight(name: string, height: number): NavState {
    return new NavState({
      ...this,
      headerHeights: { ...this.headerHeights, [name]: height },
    });
  }

  get maxContent(): number {
    return this.#maxContent;
  }

  get maxHeader(): number {
    return this.#maxHeader;
  }

  get pixelPerMeter(): number {
    return this.#pxpm;
  }

  get lensSize(): number {
    return this.rawLensSize === 0 ? this.maxContent : this.rawLensSize;
  }

  get lensEnd(): number {
    return this.#lensEnd;
  }
}

const preventVerticalScroll = (event: WheelEvent) => {
  if (event.deltaY !== 0) {
    event.preventDefault();
  }
};

interface NavigationContainerProps {
  renderItems: (navState: NavState, setNavState: Dispatch<SetStateAction<NavState>>) => ReactNode;
  sx?: SxProps;
}

/**
 * This component holds the NavState and distributes it to its children through the renderItems callback.
 */
const NavigationContainer: FC<NavigationContainerProps> = ({ renderItems, sx }) => {
  const [navState, setNavState] = useState<NavState>(new NavState());

  const containerRef = useRef<HTMLDivElement>(null);
  useResizeObserver(containerRef as RefObject<HTMLElement>, entry =>
    setNavState(prevState => prevState.setHeight(entry.contentRect.height))
  );

  const handleOnWheel = (event: React.WheelEvent<HTMLElement>) => {
    event.stopPropagation();

    // calculate new lensSize
    const newLensSize = navState.lensSize * 1.001 ** event.deltaY;
    const clampedLensSize = clamp(newLensSize, 0.5, navState.maxContent);

    // calculate new lensStart
    const clampedLensStart = clamp(
      navState.lensStart +
        (navState.lensSize - clampedLensSize) *
          ((event.pageY - event.currentTarget.getBoundingClientRect().top - navState.maxHeader) /
            (navState.height - navState.maxHeader)),
      0,
      navState.maxContent - clampedLensSize,
    );

    setNavState(
      prevState =>
        new NavState({
          ...prevState,
          rawLensSize: clampedLensSize,
          lensStart: clampedLensStart,
        }),
    );
  };

  useEffect(() => {
    const container = containerRef.current;
    container?.addEventListener("wheel", preventVerticalScroll, { passive: false });
    return () => {
      container?.removeEventListener("wheel", preventVerticalScroll);
    };
  }, [containerRef]);

  return (
    <Stack ref={containerRef} direction="row" sx={{ flex: "1", overflowX: "auto", ...sx }} onWheel={handleOnWheel}>
      {renderItems(navState, setNavState)}
    </Stack>
  );
};

export default NavigationContainer;
