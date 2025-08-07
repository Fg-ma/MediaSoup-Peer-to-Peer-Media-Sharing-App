import React, { useCallback, useEffect, useRef } from "react";
import throttle from "lodash.throttle";
import FgImageElement from "../../../../fgImageElement/FgImageElement";
import LittleBuddyPortalController from "../../LittleBuddyPortalController";
import { InstanceType } from "../../../../../elements/littleBuddyPortal/LittleBuddyPortal";
import {
  LittleBuddiesTypes,
  spirteSheetsMeta,
} from "../../../../../tableBabylon/littleBuddies/lib/typeConstant";

export default function PositioningIndicator({
  staticPlacement,
  selected,
  indicators,
  littleBuddyPortalController,
  setRerender,
}: {
  staticPlacement: React.MutableRefObject<{
    x: "default" | "hide" | number;
    y: "default" | "hide" | number;
    scale: "hide" | number;
  }>;
  selected: React.MutableRefObject<
    | {
        littleBuddy: LittleBuddiesTypes;
        aspect: number;
      }
    | undefined
  >;
  indicators: React.MutableRefObject<InstanceType | undefined>;
  littleBuddyPortalController: React.MutableRefObject<LittleBuddyPortalController>;
  setRerender: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const positioningIndicatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    littleBuddyPortalController.current.placeInstances();
    setRerender((prev) => !prev);
  }, [
    JSON.stringify(staticPlacement.current),
    JSON.stringify(selected.current),
  ]);

  const throttledRerender = useRef(
    throttle(
      () => {
        setRerender((prev) => !prev);
      },
      20,
      { leading: true, trailing: true },
    ),
  ).current;

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      event.preventDefault();

      const container = positioningIndicatorRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const rawX = ((event.clientX - rect.left) / rect.width) * 100;
      const rawY = ((event.clientY - rect.top) / rect.height) * 100;

      staticPlacement.current = {
        ...staticPlacement.current,
        x: parseFloat(Math.min(Math.max(rawX, 0), 100).toFixed(2)),
        y: parseFloat(Math.min(Math.max(rawY, 0), 100).toFixed(2)),
      };

      throttledRerender();
    },
    [throttledRerender],
  );

  const handlePointerUp = () => {
    document.removeEventListener("pointermove", handlePointerMove);
    document.removeEventListener("pointerup", handlePointerUp);
  };

  const handlePointerDown = (event: React.PointerEvent) => {
    event.preventDefault();
    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerup", handlePointerUp);
  };

  return (
    <div
      ref={positioningIndicatorRef}
      className="relative aspect-square w-full rounded border-2 border-fg-off-white bg-fg-white"
      onPointerDown={handlePointerDown}
    >
      {indicators.current &&
        (() => {
          const meta = spirteSheetsMeta[indicators.current.littleBuddy];

          return (
            <React.Fragment>
              <div
                className="border absolute cursor-pointer select-none rounded border-dashed border-fg-red"
                style={{
                  width: `${indicators.current.width}%`,
                  height: `${indicators.current.height}%`,
                  left: `${indicators.current.x}%`,
                  top: `${indicators.current.y}%`,
                }}
              >
                <FgImageElement
                  className="h-full w-full object-contain"
                  src={meta.iconUrl}
                  alt={meta.title}
                />
              </div>
            </React.Fragment>
          );
        })()}
    </div>
  );
}
