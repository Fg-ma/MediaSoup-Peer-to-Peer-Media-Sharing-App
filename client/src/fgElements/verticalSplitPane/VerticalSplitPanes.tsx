import React, { useState, useEffect, useRef } from "react";
import Divider from "./lib/Divider";
import VerticalSplitPanesController from "./lib/verticalSplitPanesController";

const defaultVerticalSplitPanesOptions = {
  dividerHeight: "1rem",
  initialPaneHeight: "60%",
  minPaneHeight: 15,
  maxPaneHeight: 100,
  dividerButton: true,
  stableScrollbarGutter: false,
};

export interface VerticalSplitPanesOptions {
  dividerHeight: string;
  initialPaneHeight: string;
  minPaneHeight: number;
  maxPaneHeight: number;
  dividerButton: boolean;
  stableScrollbarGutter: boolean;
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
    floatingTopContentOffset?: string;
    floatingTopContentWidth?: string;
    floatingBottomContentOffset?: string;
    floatingBottomContentWidth?: string;
  };
}) {
  const verticalSplitPanesOptions = {
    ...defaultVerticalSplitPanesOptions,
    ...options,
  };

  const [paneHeight, setPaneHeight] = useState(
    verticalSplitPanesOptions.initialPaneHeight
  );
  const [headerLightness, setHeaderLightness] = useState(80);
  const verticalSplitPanesRef = useRef<HTMLDivElement>(null);
  const bottomPaneRef = useRef<HTMLDivElement>(null);
  const topPaneRef = useRef<HTMLDivElement>(null);
  const isResizing = useRef(false);
  const startMousePosition = useRef(0);
  const startPaneHeight = useRef(0);

  const verticalSplitPanesController = new VerticalSplitPanesController(
    verticalSplitPanesOptions,
    paneHeight,
    setPaneHeight,
    setHeaderLightness,
    verticalSplitPanesRef,
    isResizing,
    startMousePosition,
    startPaneHeight,
    maxPaneHeightCallback,
    minPaneHeightCallback,
    panelSizeChangeCallback
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
          className='absolute z-10'
          style={{
            top: verticalSplitPanesOptions.floatingTopContentOffset,
            width: verticalSplitPanesOptions.floatingTopContentWidth ?? "100%",
            height: topPaneRef.current?.clientHeight,
          }}
        >
          {floatingTopContent}
        </div>
      )}
      {floatingBottomContent && (
        <div
          className='absolute w-max z-10'
          style={{
            bottom: verticalSplitPanesOptions.floatingBottomContentOffset,
            width:
              verticalSplitPanesOptions.floatingBottomContentWidth ?? "100%",
            height: bottomPaneRef.current?.clientHeight,
          }}
        >
          {floatingBottomContent}
        </div>
      )}
      <div
        ref={verticalSplitPanesRef}
        className='flex flex-col relative w-max h-full'
      >
        {topContent && (
          <div
            ref={topPaneRef}
            className='overflow-auto box-border relative'
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
            className='cursor-pointer select-none'
            onMouseDown={(event) => {
              verticalSplitPanesController.handleMouseDown(event);
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
            className='bg-fg-white-95 overflow-auto box-border relative'
            style={{
              height: topContent
                ? `calc(100% - ${paneHeight} - ${verticalSplitPanesOptions.dividerHeight})`
                : "100%",
            }}
          >
            {bottomContent}
          </div>
        )}
        {bottomPaneRef.current && bottomPaneRef.current.clientHeight >= 15 && (
          <div
            className='h-3 absolute -bottom-1 left-0 right-0 mx-8 z-40'
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
