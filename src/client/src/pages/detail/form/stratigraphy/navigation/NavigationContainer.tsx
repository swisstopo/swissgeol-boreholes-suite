import { Dispatch, FC, ReactNode, SetStateAction, useEffect, useRef, useState, WheelEvent } from "react";
import { Stack } from "@mui/material";
import { SxProps, Theme } from "@mui/material/styles";
import { clamp } from "./clamp.ts";
import { NavState } from "./navState.ts";
import { useTypedResizeObserver } from "./useTypedResizeObserver.ts";

interface NavigationContainerProps {
  renderItems: (navState: NavState, setNavState: Dispatch<SetStateAction<NavState>>) => ReactNode;
  sx?: SxProps<Theme>;
  navState?: NavState;
  onNavStateChange?: Dispatch<SetStateAction<NavState>>;
}

const preventVerticalScroll = (event: globalThis.WheelEvent) => {
  if (event.deltaY !== 0) event.preventDefault();
};

// Holds the NavState and distributes it to children through the renderItems callback.
export const NavigationContainer: FC<NavigationContainerProps> = ({
  renderItems,
  sx,
  navState: externalNavState,
  onNavStateChange: externalSetter,
}) => {
  const [internalNavState, setInternalNavState] = useState<NavState>(new NavState());
  const navState = externalNavState ?? internalNavState;
  const setNavState = externalSetter ?? setInternalNavState;

  const containerRef = useRef<HTMLDivElement>(null);
  useTypedResizeObserver(containerRef, entry => setNavState(prev => prev.setHeight(entry.contentRect.height)));

  const handleOnWheel = (event: WheelEvent<HTMLDivElement>) => {
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

    setNavState(prev => new NavState({ ...prev, rawLensSize: clampedLensSize, lensStart: clampedLensStart }));
  };

  useEffect(() => {
    const container = containerRef.current;
    container?.addEventListener("wheel", preventVerticalScroll, { passive: false });
    return () => container?.removeEventListener("wheel", preventVerticalScroll);
  }, []);

  return (
    <Stack ref={containerRef} direction="row" sx={{ flex: "1", overflowX: "auto", ...sx }} onWheel={handleOnWheel}>
      {renderItems(navState, setNavState)}
    </Stack>
  );
};
