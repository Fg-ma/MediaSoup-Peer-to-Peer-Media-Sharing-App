import React, { useState, useRef, Suspense, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import HoverElementController from "./lib/HoverElementController";

const FgPortal = React.lazy(() => import("../fgPortal/FgPortal"));

export type HoverElementOptions = {
  hoverTimeoutDuration?: number;
  hoverZValue?: number;
  hoverType?: "above" | "below" | "left" | "right";
  hoverSpacing?: number;
};

const defaultHoverElementOptions: {
  hoverTimeoutDuration: number;
  hoverZValue: number | undefined;
  hoverType: "above" | "below" | "left" | "right";
  hoverSpacing: number | undefined;
} = {
  hoverTimeoutDuration: 50,
  hoverZValue: undefined,
  hoverType: "above",
  hoverSpacing: undefined,
};

export default function HoverElement({
  externalRef,
  className,
  style,
  hoverContent,
  content,
  scrollingContainer,
  options,
}: {
  externalRef?: React.RefObject<HTMLDivElement>;
  className?: string;
  style?: React.CSSProperties;
  hoverContent?: React.ReactElement;
  content?: React.ReactElement;
  scrollingContainer?: React.RefObject<HTMLDivElement>;
  options?: HoverElementOptions;
}) {
  const hoverElementOptions = {
    ...defaultHoverElementOptions,
    ...options,
  };

  const hoverContainerRef = externalRef
    ? externalRef
    : useRef<HTMLDivElement>(null);

  const hoverTimeout = useRef<NodeJS.Timeout | undefined>(undefined);
  const [isHover, setIsHover] = useState(false);

  const hoverElementController = new HoverElementController(
    hoverElementOptions,
    hoverContent,
    hoverTimeout,
    setIsHover,
  );

  useEffect(() => {
    if (!isHover) return;

    document.addEventListener(
      "visibilitychange",
      hoverElementController.handleVisibilityChange,
    );

    return () => {
      document.removeEventListener(
        "visibilitychange",
        hoverElementController.handleVisibilityChange,
      );
    };
  }, [isHover]);

  useEffect(() => {
    if (!scrollingContainer || !scrollingContainer.current) return;

    scrollingContainer.current.addEventListener(
      "scroll",
      hoverElementController.handleScroll,
    );

    return () => {
      scrollingContainer.current?.removeEventListener(
        "scroll",
        hoverElementController.handleScroll,
      );
    };
  }, [scrollingContainer?.current]);

  return (
    <>
      <div
        ref={hoverContainerRef}
        className={className}
        style={style}
        onPointerEnter={hoverElementController.handlePointerEnter}
        onPointerLeave={hoverElementController.handlePointerLeave}
      >
        {content}
      </div>
      {hoverContent && (
        <AnimatePresence>
          {isHover && (
            <Suspense fallback={<div>Loading...</div>}>
              <FgPortal
                type={hoverElementOptions.hoverType}
                spacing={hoverElementOptions.hoverSpacing}
                content={hoverContent}
                externalRef={hoverContainerRef}
                zValue={hoverElementOptions.hoverZValue}
              />
            </Suspense>
          )}
        </AnimatePresence>
      )}
    </>
  );
}
