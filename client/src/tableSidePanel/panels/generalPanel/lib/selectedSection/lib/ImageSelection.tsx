import React, { useRef, useState } from "react";
import { useMediaContext } from "../../../../../../context/mediaContext/MediaContext";
import { useSignalContext } from "../../../../../../context/signalContext/SignalContext";
import FgImageElement from "../../../../../../elements/fgImageElement/FgImageElement";
import FgSVGElement from "../../../../../../elements/fgSVGElement/FgSVGElement";
import FgButton from "../../../../../../elements/fgButton/FgButton";
import FgHoverContentStandard from "../../../../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import FgInput from "../../../../../../elements/fgInput/FgInput";
import HoverElement from "../../../../../../elements/hoverElement/HoverElement";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const downloadIcon = nginxAssetServerBaseUrl + "svgs/downloadIcon.svg";
const infoIcon = nginxAssetServerBaseUrl + "svgs/infoIcon.svg";

export default function ImageSelection({
  contentId,
  tablePanelRef,
}: {
  contentId: string;
  tablePanelRef: React.RefObject<HTMLDivElement>;
}) {
  const { userMedia } = useMediaContext();
  const { sendMediaPositioningSignal, sendGroupSignal } = useSignalContext();

  const [moreInfoSectionActive, setMoreInfoSectionActive] = useState(false);
  const [_, setRerender] = useState(false);

  const imageInstanceMedia = userMedia.current.image.tableInstances[contentId];
  const positioning = imageInstanceMedia.getPositioning();

  const filenameRef = useRef<HTMLDivElement>(null);
  const originalScale = useRef(positioning.scale);
  const placement = useRef<{
    x: number | "hide";
    y: number | "hide";
    scale: number | "hide";
    rotation: number | "hide";
  }>({
    x: parseFloat(positioning.position.left.toFixed(2)),
    y: parseFloat(positioning.position.top.toFixed(2)),
    scale: 1,
    rotation: parseFloat(positioning.rotation.toFixed(2)),
  });

  return (
    <div
      key={contentId}
      className="relative mx-6 flex h-max flex-col items-center justify-center space-y-2 rounded-md border-2 border-fg-tone-black-3 bg-fg-tone-black-5 p-2"
      style={{
        width: "calc(100% - 3rem)",
      }}
    >
      <div
        className="selected-section-media-container relative max-h-[12rem]"
        style={{ height: "calc(100% - 4rem)" }}
      >
        <FgImageElement
          className="h-full max-h-[12rem] overflow-hidden rounded-md"
          imageClassName="object-contain max-h-[12rem] !w-auto"
          src={imageInstanceMedia.imageMedia.blobURL ?? ""}
        />
        <div
          className="selected-section-media-container-download absolute left-0 top-0 h-full w-full items-center justify-center bg-fg-tone-black-1 bg-opacity-40"
          onClick={() => {
            imageInstanceMedia.babylonScene?.takeSnapShot();
            imageInstanceMedia.babylonScene?.downloadSnapShot();
          }}
        >
          <FgSVGElement
            src={downloadIcon}
            className="aspect-square h-[20%] fill-fg-white stroke-fg-white"
            attributes={[
              { key: "height", value: "100%" },
              { key: "width", value: "100%" },
            ]}
          />
        </div>
      </div>
      <div className="flex h-8 w-full items-center justify-between truncate px-1">
        <HoverElement
          externalRef={filenameRef}
          className="h-full grow truncate text-start font-K2D text-lg text-fg-white"
          content={<>{imageInstanceMedia.imageMedia.filename}</>}
          hoverContent={
            (filenameRef.current?.scrollWidth ?? 0) >
            (filenameRef.current?.clientWidth ?? 0) ? (
              <FgHoverContentStandard
                style="light"
                content={imageInstanceMedia.imageMedia.filename}
              />
            ) : undefined
          }
          options={{
            hoverSpacing: 4,
            hoverType: "above",
            hoverTimeoutDuration: 500,
          }}
        />
        <FgButton
          className="flex aspect-square h-6 items-center justify-center"
          contentFunction={() => (
            <FgSVGElement
              src={infoIcon}
              className="fill-fg-white stroke-fg-white"
              attributes={[
                { key: "height", value: "100%" },
                { key: "width", value: "100%" },
              ]}
            />
          )}
          clickFunction={() => setMoreInfoSectionActive((prev) => !prev)}
          scrollingContainerRef={tablePanelRef}
          hoverContent={
            <FgHoverContentStandard
              content={moreInfoSectionActive ? "More info" : "Less info"}
              style="light"
            />
          }
          options={{
            hoverSpacing: 4,
            hoverTimeoutDuration: 750,
            hoverType: "above",
          }}
        />
      </div>
      {moreInfoSectionActive && (
        <div className="flex w-full flex-col space-y-2">
          <div className="space-y-1 text-white">
            <p>
              <strong>MIME type:</strong>{" "}
              {imageInstanceMedia.imageMedia.mimeType}
            </p>
            <p>
              <strong>File size:</strong>{" "}
              {imageInstanceMedia.imageMedia.getFileSize()}
            </p>
          </div>
          <div className="flex flex-col items-start justify-center space-y-2">
            <div className="flex items-center justify-center space-x-2">
              <div className="text-lg text-white">X:</div>
              <FgInput
                className="h-8 w-12 grow rounded border-fg-off-white bg-fg-white font-K2D hover:border-fg-red focus:border-fg-red"
                type="number"
                onChange={(event) => {
                  let newCount: number | "hide" = parseFloat(
                    event.target.value,
                  );

                  if (isNaN(newCount)) {
                    newCount = "hide";
                  } else {
                    newCount = Math.max(0, Math.min(100, newCount));
                  }

                  placement.current.x = newCount;
                  if (
                    placement.current.x !== "hide" &&
                    placement.current.y !== "hide"
                  ) {
                    sendMediaPositioningSignal({
                      type: "moveTo",
                      data: {
                        x: placement.current.x,
                        y: placement.current.y,
                      },
                    });
                    setTimeout(() => {
                      sendGroupSignal({ type: "groupUpdate" });
                    }, 0);
                  }
                  setRerender((prev) => !prev);
                }}
                onUnfocus={() => {
                  if (placement.current.x === "hide") {
                    placement.current.x = parseFloat(
                      positioning.position.left.toFixed(2),
                    );
                    setRerender((prev) => !prev);
                  }
                }}
                externalValue={
                  placement.current.x === "hide"
                    ? ""
                    : `${placement.current.x ?? ""}`
                }
                options={{
                  submitButton: false,
                  padding: 0,
                  centerText: true,
                  backgroundColor: "#f2f2f2",
                  min: 0,
                  max: 100,
                  step: 1,
                  autocomplete: "off",
                }}
              />
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="text-lg text-white">Y:</div>
              <FgInput
                className="h-8 w-12 grow rounded border-fg-off-white bg-fg-white font-K2D hover:border-fg-red focus:border-fg-red"
                type="number"
                onChange={(event) => {
                  let newCount: number | "hide" = parseFloat(
                    event.target.value,
                  );

                  if (isNaN(newCount)) {
                    newCount = "hide";
                  } else {
                    newCount = Math.max(0, Math.min(100, newCount));
                  }

                  placement.current.y = newCount;
                  if (
                    placement.current.x !== "hide" &&
                    placement.current.y !== "hide"
                  ) {
                    sendMediaPositioningSignal({
                      type: "moveTo",
                      data: {
                        x: placement.current.x,
                        y: placement.current.y,
                      },
                    });
                    setTimeout(() => {
                      sendGroupSignal({ type: "groupUpdate" });
                    }, 0);
                  }
                  setRerender((prev) => !prev);
                }}
                onUnfocus={() => {
                  if (placement.current.y === "hide") {
                    placement.current.y = parseFloat(
                      positioning.position.top.toFixed(2),
                    );
                    setRerender((prev) => !prev);
                  }
                }}
                externalValue={
                  placement.current.y === "hide"
                    ? ""
                    : `${placement.current.y ?? ""}`
                }
                options={{
                  submitButton: false,
                  padding: 0,
                  centerText: true,
                  backgroundColor: "#f2f2f2",
                  min: 0,
                  max: 100,
                  step: 1,
                  autocomplete: "off",
                }}
              />
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="text-lg text-white">Scale:</div>
              <FgInput
                className="h-8 w-12 grow rounded border-fg-off-white bg-fg-white font-K2D hover:border-fg-red focus:border-fg-red"
                type="number"
                onChange={(event) => {
                  let newCount: number | "hide" = parseFloat(
                    event.target.value,
                  );

                  if (isNaN(newCount)) {
                    newCount = "hide";
                  } else {
                    newCount = Math.max(0.01, newCount);
                  }

                  placement.current.scale = newCount;
                  if (placement.current.scale !== "hide") {
                    sendMediaPositioningSignal({
                      type: "scaleTo",
                      data: {
                        x: originalScale.current.x * placement.current.scale,
                        y: originalScale.current.y * placement.current.scale,
                      },
                    });
                    setTimeout(() => {
                      sendGroupSignal({ type: "groupUpdate" });
                    }, 0);
                  }
                  setRerender((prev) => !prev);
                }}
                onUnfocus={() => {
                  if (placement.current.scale === "hide") {
                    placement.current.scale = 1;
                    setRerender((prev) => !prev);
                  }
                }}
                externalValue={
                  placement.current.scale === "hide"
                    ? ""
                    : `${placement.current.scale ?? ""}`
                }
                options={{
                  submitButton: false,
                  padding: 0,
                  centerText: true,
                  backgroundColor: "#f2f2f2",
                  min: 0,
                  max: undefined,
                  step: 0.01,
                  autocomplete: "off",
                }}
              />
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="text-lg text-white">Angle:</div>
              <FgInput
                className="h-8 w-12 grow rounded border-fg-off-white bg-fg-white font-K2D hover:border-fg-red focus:border-fg-red"
                type="number"
                onChange={(event) => {
                  let newCount: number | "hide" = parseFloat(
                    event.target.value,
                  );

                  if (isNaN(newCount)) {
                    newCount = "hide";
                  } else {
                    if (newCount < 0) {
                      newCount = 360 + newCount;
                    }
                    newCount = newCount % 360;
                  }

                  placement.current.rotation = newCount;
                  if (placement.current.rotation !== "hide") {
                    sendMediaPositioningSignal({
                      type: "rotateTo",
                      data: {
                        rotation: placement.current.rotation,
                      },
                    });
                    setTimeout(() => {
                      sendGroupSignal({ type: "groupUpdate" });
                    }, 0);
                  }
                  setRerender((prev) => !prev);
                }}
                onUnfocus={() => {
                  if (placement.current.rotation === "hide") {
                    placement.current.rotation = parseFloat(
                      positioning.rotation.toFixed(2),
                    );
                    setRerender((prev) => !prev);
                  }
                }}
                externalValue={
                  placement.current.rotation === "hide"
                    ? ""
                    : `${placement.current.rotation ?? ""}`
                }
                options={{
                  submitButton: false,
                  padding: 0,
                  centerText: true,
                  backgroundColor: "#f2f2f2",
                  min: -1,
                  max: 360,
                  step: 1,
                  autocomplete: "off",
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
