import React, { useEffect, useRef, useState } from "react";
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
  tabledPortalController: TabledPortalController;
  setRerender: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { userMedia } = useMediaContext();

  const positioningIndicatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    tabledPortalController.placeInstances();
    setRerender((prev) => !prev);
    console.log("bad");
  }, [
    JSON.stringify(staticPlacement.current),
    JSON.stringify(selected.current),
  ]);

  const handlePointerMove = (event: PointerEvent) => {
    event.preventDefault();

    const container = positioningIndicatorRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();

    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    const clampedX = Math.min(Math.max(x, 0), 100);
    const clampedY = Math.min(Math.max(y, 0), 100);

    staticPlacement.current = {
      ...staticPlacement.current,
      x: parseFloat(`${clampedX.toFixed(2)}`),
      y: parseFloat(`${clampedY.toFixed(2)}`),
    };
    tabledPortalController.placeInstances();
    setRerender((prev) => !prev);
  };

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
            userMedia.current[instance.contentType].all[instance.contentId];

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
                className="pointer-events-none absolute select-none rounded border border-dashed border-fg-red"
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
