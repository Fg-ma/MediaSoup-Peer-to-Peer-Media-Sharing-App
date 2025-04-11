import React, { useEffect } from "react";
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
}) {
  const { userMedia } = useMediaContext();

  useEffect(() => {
    tabledPortalController.placeInstances();
  }, [
    JSON.stringify(staticPlacement.current),
    JSON.stringify(selected.current),
  ]);

  return (
    <div className="relative aspect-square w-full rounded border-2 border-fg-off-white bg-fg-white">
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
                className="absolute select-none rounded border border-dashed border-fg-red"
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
