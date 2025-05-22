import React, { useEffect, useRef, useState } from "react";
import { useSignalContext } from "../../../../../../context/signalContext/SignalContext";
import FgSVGElement from "../../../../../../elements/fgSVGElement/FgSVGElement";
import HoverElement from "../../../../../../elements/hoverElement/HoverElement";
import FgHoverContentStandard from "../../../../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import FgButton from "../../../../../../elements/fgButton/FgButton";
import FgInput from "../../../../../../elements/fgInput/FgInput";
import { ContentTypes } from "../../../../../../../../universal/contentTypeConstant";
import ReactButton from "../../../../../../elements/reactButton/ReactButton";
import { reactionActions } from "../../../../../../elements/reactButton/lib/ReactController";
import { useSocketContext } from "../../../../../../context/socketContext/SocketContext";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const downloadIcon = nginxAssetServerBaseUrl + "svgs/downloadIcon.svg";
const infoIcon = nginxAssetServerBaseUrl + "svgs/infoIcon.svg";

const defaultGeneralMediaSelectionOptions = {
  downloadType: "cover",
};

export default function GeneralMediaSelection({
  contentId,
  instanceId,
  contentType,
  selectionContent,
  effectsSection,
  downloadFunction,
  filename = "",
  mimeType = "",
  fileSize = "",
  tablePanelRef,
  positioning,
  selectionContentStyle,
  options,
}: {
  contentId?: string;
  instanceId: string;
  contentType: ContentTypes;
  selectionContent?: React.ReactElement;
  effectsSection?: React.ReactElement;
  downloadFunction?: () => void;
  filename?: string;
  mimeType?: string;
  fileSize?: string;
  tablePanelRef?: React.RefObject<HTMLDivElement>;
  positioning: {
    position: {
      left: number;
      top: number;
    };
    scale: {
      x: number;
      y: number;
    };
    rotation: number;
  };
  selectionContentStyle?: React.CSSProperties;
  options?: {
    downloadType?: "button" | "cover";
  };
}) {
  const generalMediaSelectionOptions = {
    ...defaultGeneralMediaSelectionOptions,
    ...options,
  };

  const { sendMediaPositioningSignal, sendGroupSignal } = useSignalContext();
  const { tableSocket } = useSocketContext();

  const [moreInfoSectionActive, setMoreInfoSectionActive] = useState(false);
  const [reactionsPanelActive, setReactionsPanelActive] = useState(false);
  const [_, setRerender] = useState(false);
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

  useEffect(() => {
    placement.current = {
      x: parseFloat(positioning.position.left.toFixed(2)),
      y: parseFloat(positioning.position.top.toFixed(2)),
      scale: positioning.scale.x / originalScale.current.x,
      rotation: parseFloat(positioning.rotation.toFixed(2)),
    };
  }, [positioning]);

  return (
    <div
      className="relative mx-6 flex h-max flex-col items-center justify-center space-y-2 rounded-md border-2 border-fg-tone-black-3 bg-fg-tone-black-5 py-4"
      style={{
        width: "calc(100% - 3rem)",
      }}
    >
      <div
        className="selected-section-media-container relative mx-2 max-h-[12rem]"
        style={{ height: "calc(100% - 4rem)", ...selectionContentStyle }}
      >
        {selectionContent}
        {generalMediaSelectionOptions.downloadType === "cover" &&
          downloadFunction && (
            <div
              className="selected-section-media-container-download absolute left-0 top-0 h-full w-full items-center justify-center bg-fg-tone-black-1 bg-opacity-40"
              onClick={downloadFunction}
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
          )}
      </div>
      <div className="flex h-8 w-full items-center justify-between truncate px-3">
        <HoverElement
          externalRef={filenameRef}
          className="h-full grow truncate text-start font-K2D text-lg text-fg-white"
          content={<>{filename}</>}
          hoverContent={
            filename &&
            (filenameRef.current?.scrollWidth ?? 0) >
              (filenameRef.current?.clientWidth ?? 0) ? (
              <FgHoverContentStandard style="light" content={filename} />
            ) : undefined
          }
          options={{
            hoverSpacing: 4,
            hoverType: "above",
            hoverTimeoutDuration: 500,
          }}
        />
        <ReactButton
          reactionsPanelActive={reactionsPanelActive}
          setReactionsPanelActive={setReactionsPanelActive}
          clickFunction={() => setReactionsPanelActive((prev) => !prev)}
          reactionFunction={(reaction) =>
            tableSocket.current?.reaction(
              contentType,
              reaction,
              reactionActions[
                Math.floor(Math.random() * reactionActions.length)
              ],
              contentId,
              instanceId,
            )
          }
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
          {generalMediaSelectionOptions.downloadType === "button" &&
            downloadFunction && (
              <FgButton
                className="h-8 w-full"
                contentFunction={() => (
                  <div className="flex h-full items-center justify-start space-x-2 px-3">
                    <FgSVGElement
                      src={downloadIcon}
                      className="aspect-square h-[80%] fill-fg-white stroke-fg-white"
                      attributes={[
                        { key: "height", value: "100%" },
                        { key: "width", value: "100%" },
                      ]}
                    />
                    <div className="h-full w-max truncate pt-0.5 text-xl text-fg-white">
                      Download
                    </div>
                  </div>
                )}
                clickFunction={downloadFunction}
              />
            )}
          {(mimeType || fileSize) && (
            <div className="space-y-1 px-3 text-white">
              {mimeType && (
                <p>
                  <strong>MIME type:</strong> {mimeType}
                </p>
              )}
              {fileSize && (
                <p>
                  <strong>File size:</strong> {fileSize}
                </p>
              )}
            </div>
          )}
          <div className="flex flex-col items-start justify-center space-y-2 px-3">
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
                      header: {
                        instanceId,
                        contentType,
                      },
                      data: {
                        position: {
                          x: placement.current.x,
                          y: placement.current.y,
                        },
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
                      header: {
                        instanceId,
                        contentType,
                      },
                      data: {
                        position: {
                          x: placement.current.x,
                          y: placement.current.y,
                        },
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
                      header: {
                        instanceId,
                        contentType,
                      },
                      data: {
                        scale: {
                          x: originalScale.current.x * placement.current.scale,
                          y: originalScale.current.y * placement.current.scale,
                        },
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
                      header: {
                        instanceId,
                        contentType,
                      },
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
          {effectsSection}
        </div>
      )}
    </div>
  );
}
