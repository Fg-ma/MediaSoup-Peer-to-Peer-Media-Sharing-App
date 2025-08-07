import React, { useRef, useState } from "react";
import { useSignalContext } from "../../../context/signalContext/SignalContext";
import FgButton from "../../fgButton/FgButton";
import FgImageElement from "../../fgImageElement/FgImageElement";
import FgHoverContentStandard from "../../fgHoverContentStandard/FgHoverContentStandard";
import {
  LittleBuddiesTypes,
  spirteSheetsMeta,
} from "../../../tableBabylon/littleBuddies/lib/typeConstant";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

export type MediaListenerTypes =
  | { type: "downloadComplete" }
  | { type: "downloadPaused" }
  | { type: "downloadResumed" }
  | { type: "downloadFailed" }
  | { type: string };

export default function LittleBuddyItems({
  littleBuddy,
  selected,
  setDragging,
  setExternalRerender,
}: {
  littleBuddy: LittleBuddiesTypes;
  selected: React.MutableRefObject<
    | {
        littleBuddy: LittleBuddiesTypes;
        aspect: number;
      }
    | undefined
  >;
  setDragging: React.Dispatch<React.SetStateAction<boolean>>;
  setExternalRerender: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { sendNewInstanceSignal } = useSignalContext();

  const littleBuddyMeta = spirteSheetsMeta[littleBuddy];

  const [_, setRerender] = useState(false);
  const aspectRatio = useRef(
    littleBuddyMeta.frameWidth / littleBuddyMeta.frameHeight,
  );
  const perserveSelected = useRef(false);

  return (
    <div
      className={`${selected.current?.littleBuddy === littleBuddy ? "h-max" : "aspect-square"} flex w-24 flex-col items-center justify-center space-y-1`}
    >
      <FgButton
        className="flex h-24 w-24 items-center justify-center"
        contentFunction={() => (
          <FgImageElement
            className={`${selected.current?.littleBuddy === littleBuddy ? "border-fg-red" : "border-transparent"} ${aspectRatio.current > 1 ? "w-full" : "h-full"} overflow-hidden rounded border-3 object-contain hover:border-fg-red`}
            imageClassName={`${aspectRatio.current > 1 ? "!w-full !h-auto" : "!h-full !w-auto"} object-contain`}
            src={littleBuddyMeta.iconUrl}
            alt={littleBuddyMeta.title}
            style={{
              imageRendering: littleBuddyMeta.pixelated
                ? "pixelated"
                : undefined,
            }}
          />
        )}
        clickFunction={() => {
          if (perserveSelected.current) {
            perserveSelected.current = false;
            return;
          }

          selected.current =
            selected.current?.littleBuddy === littleBuddy
              ? undefined
              : {
                  littleBuddy,
                  aspect: aspectRatio.current,
                };

          setRerender((prev) => !prev);
          setExternalRerender((prev) => !prev);
        }}
        startDragFunction={() => {
          setDragging(true);

          setRerender((prev) => !prev);

          sendNewInstanceSignal({
            type: "instancesLayerMode",
            data: {
              mode: "standard",
            },
          });

          if (!selected.current) return;

          sendNewInstanceSignal({
            type: "startInstancesDrag",
            data: {
              instance: {
                littleBuddy: selected.current.littleBuddy,
                height: 15,
                width: 15 * selected.current.aspect,
              },
            },
          });
        }}
        stopDragFunction={() => {
          setDragging(false);

          perserveSelected.current = true;

          sendNewInstanceSignal({
            type: "instancesLayerMode",
            data: {
              mode: "standard",
            },
          });

          sendNewInstanceSignal({
            type: "stopInstancesDrag",
          });
        }}
        hoverContent={
          <FgHoverContentStandard
            content={littleBuddyMeta.title}
            style="light"
          />
        }
        data-little-buddy={littleBuddy}
        data-little-buddy-aspect={aspectRatio.current}
        options={{
          dragPreventDefault: true,
          hoverSpacing: 4,
          hoverType: "above",
          hoverTimeoutDuration: 1250,
        }}
      />
    </div>
  );
}
