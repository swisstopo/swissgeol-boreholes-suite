import { Dispatch, FC, ReactNode, RefObject, SetStateAction, useEffect, useRef, useState, WheelEvent } from "react";
import { Stack } from "@mui/material";
import { SxProps, Theme } from "@mui/material/styles";
import { clamp } from "./clamp.ts";
import { NavState } from "./navState.ts";
import { useDragPan } from "./useDragPan.ts";
import { useTypedResizeObserver } from "./useTypedResizeObserver.ts";

interface NavigationContainerProps {
  renderItems: (navState: NavState, setNavState: Dispatch<SetStateAction<NavState>>) => ReactNode;
  sx?: SxProps<Theme>;
  navState?: NavState;
  onNavStateChange?: Dispatch<SetStateAction<NavState>>;
  // Element observed for navState.height. The body row of the surrounding grid (1fr), NOT the
  // container itself: the container also wraps header / lens-down / footer rows that must be
  // excluded so depth-proportional cells size to the pixels actually available to them.
  bodyRef: RefObject<HTMLElement | null>;
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
  bodyRef,
}) => {
  const [internalNavState, setInternalNavState] = useState<NavState>(new NavState());
  const navState = externalNavState ?? internalNavState;
  const setNavState = externalSetter ?? setInternalNavState;

  const containerRef = useRef<HTMLDivElement>(null);
  useTypedResizeObserver(bodyRef, entry => setNavState(prev => prev.setHeight(entry.contentRect.height)));

  const { onPointerDown, isDragging, isPannable } = useDragPan({ navState, setNavState, containerRef });
  const panCursor = isDragging ? "grabbing" : "grab";
  const cursor = isPannable ? panCursor : "default";

  const handleOnWheel = (event: WheelEvent<HTMLDivElement>) => {
    event.stopPropagation();

    // calculate new lensSize
    const newLensSize = navState.lensSize * 1.001 ** event.deltaY;
    const clampedLensSize = clamp(newLensSize, 0.5, navState.maxContent);

    // Anchor the zoom at the pointer: compute the pointer's fraction within the body area.
    // navState.height is the body's pixel height; bodyRef provides its absolute top.
    const bodyEl = bodyRef.current;
    if (!bodyEl) return;
    const fraction = (event.pageY - bodyEl.getBoundingClientRect().top) / navState.height;

    // calculate new lensStart
    const clampedLensStart = clamp(
      navState.lensStart + (navState.lensSize - clampedLensSize) * fraction,
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
    <Stack
      ref={containerRef}
      direction="row"
      sx={{
        flex: "1",
        overflowX: "auto",
        cursor,
        userSelect: "none",
        touchAction: "none",
        ...sx,
      }}
      onWheel={handleOnWheel}
      onPointerDown={onPointerDown}>
      {renderItems(navState, setNavState)}
    </Stack>
  );
};
