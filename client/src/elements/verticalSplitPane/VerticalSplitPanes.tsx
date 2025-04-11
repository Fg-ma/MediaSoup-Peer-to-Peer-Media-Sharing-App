import React, { useState, useEffect, useRef } from "react";
import Divider from "./lib/Divider";
import VerticalSplitPanesController from "./lib/verticalSplitPanesController";

const defaultVerticalSplitPanesOptions: VerticalSplitPanesOptions = {
  dividerHeight: "1rem",
  initialPaneHeight: "60%",
  minPaneHeight: 15,
  maxPaneHeight: 100,
  dividerButton: true,
  stableScrollbarGutter: false,
  shadowBottom: false,
  shadowTop: false,
};

export interface VerticalSplitPanesOptions {
  dividerHeight: string;
  initialPaneHeight: string;
  minPaneHeight: number;
  maxPaneHeight: number;
  dividerButton: boolean;
  stableScrollbarGutter: boolean;
  shadowBottom: boolean;
  shadowTop: boolean;
}

export default function VerticalSplitPanes({
  topContent,
  bottomContent,
  floatingTopContent,
  floatingBottomContent,
  dividerContent,
  panelSizeChangeCallback,
  maxPaneHeightCallback,
  minPaneHeightCallback,
  options,
}: {
  topContent?: React.ReactNode;
  bottomContent?: React.ReactNode;
  floatingTopContent?: React.ReactNode;
  floatingBottomContent?: React.ReactNode;
  dividerContent?: React.ReactNode;
  panelSizeChangeCallback?: () => void;
  maxPaneHeightCallback?: () => void;
  minPaneHeightCallback?: () => void;
  options?: {
    dividerHeight?: string;
    initialPaneHeight?: string;
    minPaneHeight?: number;
    maxPaneHeight?: number;
    dividerButton?: boolean;
    stableScrollbarGutter?: boolean;
    shadowBottom?: boolean;
    shadowTop?: boolean;
  };
}) {
  const verticalSplitPanesOptions = {
    ...defaultVerticalSplitPanesOptions,
    ...options,
  };

  const [paneHeight, setPaneHeight] = useState(
    verticalSplitPanesOptions.initialPaneHeight,
  );
  const [headerLightness, setHeaderLightness] = useState(83.1);
  const verticalSplitPanesRef = useRef<HTMLDivElement>(null);
  const bottomPaneRef = useRef<HTMLDivElement>(null);
  const topPaneRef = useRef<HTMLDivElement>(null);
  const isResizing = useRef(false);
  const startPointerPosition = useRef(0);
  const startPaneHeight = useRef(0);

  const verticalSplitPanesController = new VerticalSplitPanesController(
    verticalSplitPanesOptions,
    paneHeight,
    setPaneHeight,
    setHeaderLightness,
    verticalSplitPanesRef,
    isResizing,
    startPointerPosition,
    startPaneHeight,
    maxPaneHeightCallback,
    minPaneHeightCallback,
    panelSizeChangeCallback,
  );

  // Gets initial conditions
  useEffect(() => {
    setPaneHeight(verticalSplitPanesOptions.initialPaneHeight);

    // Get the initial height of the leftPane when the component mounts
    const initialHeight =
      parseFloat(verticalSplitPanesOptions.initialPaneHeight) || 0;

    // Set the initial lightness based on the initial height
    const initialLightness =
      verticalSplitPanesController.getLightness(initialHeight);

    setHeaderLightness(initialLightness);
  }, [topContent === undefined, bottomContent === undefined]);

  return (
    <>
      {floatingTopContent && (
        <div
          className="absolute z-10"
          style={{
            top: "0px",
            width: "100%",
            height: paneHeight,
          }}
        >
          {floatingTopContent}
        </div>
      )}
      {floatingBottomContent && (
        <div
          className="absolute z-10 w-max"
          style={{
            bottom: "0px",
            width: "100%",
            height: bottomPaneRef.current?.clientHeight,
          }}
        >
          {floatingBottomContent}
        </div>
      )}
      <div
        ref={verticalSplitPanesRef}
        className="flex relative h-full w-max flex-col"
      >
        {topContent && (
          <div
            ref={topPaneRef}
            className="relative box-border overflow-auto"
            style={{
              height: paneHeight,
              ...(verticalSplitPanesOptions.stableScrollbarGutter && {
                scrollbarGutter: "stable",
              }),
            }}
          >
            {topContent}
          </div>
        )}
        {topContent && bottomContent && (
          <div
            className="cursor-pointer select-none"
            onPointerDown={(event) => {
              verticalSplitPanesController.handlePointerDown(event);
            }}
            onTouchStart={(event) => {
              verticalSplitPanesController.handleTouchDown(event);
            }}
          >
            <Divider
              lightness={headerLightness}
              togglePaneHeight={verticalSplitPanesController.togglePaneHeight}
              dividerContent={dividerContent}
              dividerHeight={verticalSplitPanesOptions.dividerHeight}
              dividerButton={verticalSplitPanesOptions.dividerButton}
            />
          </div>
        )}
        {bottomContent && (
          <div
            ref={bottomPaneRef}
            className="relative box-border overflow-auto bg-fg-white-95"
            style={{
              height: topContent
                ? `calc(100% - ${paneHeight} - ${verticalSplitPanesOptions.dividerHeight})`
                : "100%",
            }}
          >
            {bottomContent}
          </div>
        )}
        {verticalSplitPanesOptions.shadowBottom &&
          bottomPaneRef.current &&
          bottomPaneRef.current.clientHeight >= 15 && (
            <div
              className="absolute -bottom-1 left-0 right-0 z-40 mx-8 h-3"
              style={{
                background: `linear-gradient(to top, rgba(243, 243, 243, 1) 0%, rgba(243, 243, 243, 0.35) 50%, rgba(243, 243, 243, 0) 100%)`,
                filter: "blur(4px)",
                width: `calc(100% - 4rem)`,
              }}
            ></div>
          )}
      </div>
    </>
  );
}
