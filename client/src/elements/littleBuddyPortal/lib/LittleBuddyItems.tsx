import React, { useEffect, useRef, useState } from "react";
import { useSignalContext } from "../../../context/signalContext/SignalContext";
import FgButton from "../../fgButton/FgButton";
import FgImageElement from "../../fgImageElement/FgImageElement";
import FgHoverContentStandard from "../../fgHoverContentStandard/FgHoverContentStandard";
import {
  LittleBuddiesTypes,
  spirteSheetsMeta,
} from "../../../tableBabylon/littleBuddies/lib/typeConstant";

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
  const { sendPlaceLittleBuddySignal } = useSignalContext();

  const [_, setRerender] = useState(false);
  const littleBuddyMeta = useRef(spirteSheetsMeta[littleBuddy]);
  const aspectRatio = useRef(
    littleBuddyMeta.current.frameWidth / littleBuddyMeta.current.frameHeight,
  );
  const littleBuddyRef = useRef(littleBuddy);
  const perserveSelected = useRef(false);

  useEffect(() => {
    littleBuddyRef.current = littleBuddy;
    littleBuddyMeta.current = spirteSheetsMeta[littleBuddy];
    aspectRatio.current =
      littleBuddyMeta.current.frameWidth / littleBuddyMeta.current.frameHeight;
    setRerender((prev) => !prev);
  }, [littleBuddy]);

  const handleClick = () => {
    if (perserveSelected.current) {
      perserveSelected.current = false;
      return;
    }

    selected.current =
      selected.current?.littleBuddy === littleBuddyRef.current
        ? undefined
        : {
            littleBuddy: littleBuddyRef.current,
            aspect: aspectRatio.current,
          };

    setRerender((prev) => !prev);
    setExternalRerender((prev) => !prev);
  };

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
            src={littleBuddyMeta.current.iconUrl}
            alt={littleBuddyMeta.current.title}
            style={{
              imageRendering: littleBuddyMeta.current.pixelated
                ? "pixelated"
                : undefined,
            }}
          />
        )}
        clickFunction={handleClick}
        startDragFunction={() => {
          setDragging(true);

          setRerender((prev) => !prev);

          if (!selected.current) return;

          sendPlaceLittleBuddySignal({
            type: "startPlaceLittleBuddyDrag",
            data: {
              littleBuddy: selected.current.littleBuddy,
              height: 15,
              width: 15 * selected.current.aspect,
            },
          });
        }}
        stopDragFunction={() => {
          setDragging(false);

          perserveSelected.current = true;

          sendPlaceLittleBuddySignal({
            type: "stopPlaceLittleBuddyDrag",
          });
        }}
        hoverContent={
          <FgHoverContentStandard
            content={littleBuddyMeta.current.title}
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
