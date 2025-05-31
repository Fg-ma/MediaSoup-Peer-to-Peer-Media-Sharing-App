import React, { useCallback, useEffect, useRef } from "react";
import throttle from "lodash.throttle";
import { StaticContentTypes } from "../../../../../../../../universal/contentTypeConstant";
import { useMediaContext } from "../../../../../../context/mediaContext/MediaContext";
import FgImageElement from "../../../../../../elements/fgImageElement/FgImageElement";
import { InstanceType } from "../../../TabledPortal";
import TabledPortalController from "../../TabledPortalController";

export default function PositioningIndicator({
  staticPlacement,
  selected,
  indicators,
  tabledPortalController,
  setRerender,
}: {
  staticPlacement: React.MutableRefObject<{
    x: "default" | "hide" | number;
    y: "default" | "hide" | number;
    scale: "hide" | number;
  }>;
  selected: React.MutableRefObject<
    {
      contentType: StaticContentTypes;
      contentId: string;
      aspect: number;
      count: number | "zero";
    }[]
  >;
  indicators: React.MutableRefObject<InstanceType[]>;
  tabledPortalController: React.MutableRefObject<TabledPortalController>;
  setRerender: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { staticContentMedia } = useMediaContext();

  const positioningIndicatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    tabledPortalController.current.placeInstances();
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
      80,
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
      {indicators.current.map((instance) => {
        let imgSrc: string | null = null;
        let alt: string = "";

        if (
          instance.contentType !== "text" &&
          instance.contentType !== "soundClip"
        ) {
          const media =
            staticContentMedia.current[instance.contentType].table[
              instance.contentId
            ];

          if (media?.blobURL) {
            imgSrc = media.blobURL;
            alt = media.filename;
          }
        }

        return (
          <React.Fragment key={instance.contentId}>
            {instance.instances.map((ins, i) => (
              <div
                key={instance.contentId + "_" + i}
                className="absolute cursor-pointer select-none rounded border border-dashed border-fg-red"
                style={{
                  width: `${ins.width}%`,
                  height: `${ins.height}%`,
                  left: `${ins.x}%`,
                  top: `${ins.y}%`,
                }}
              >
                {imgSrc && (
                  <FgImageElement
                    className="h-full w-full object-contain"
                    src={imgSrc}
                    alt={alt}
                  />
                )}
              </div>
            ))}
          </React.Fragment>
        );
      })}
    </div>
  );
}
