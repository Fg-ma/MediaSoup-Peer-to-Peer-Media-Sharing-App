import React, { useEffect, useRef, useState } from "react";
import { useMediaContext } from "../../../../../context/mediaContext/MediaContext";
import { ContentTypes } from "../../../../../../../universal/contentTypeConstant";
import FgButton from "../../../../../elements/fgButton/FgButton";
import HoverElement from "../../../../../elements/hoverElement/HoverElement";
import { closedCaptionsSelections } from "../../../../../media/fgVisualMedia/lib/fgLowerVisualMediaControls/lib/fgSettingsButton/lib/ClosedCaptionsPage";
import ClosedCaptionsPage from "./lib/ClosedCaptionsPage";
import FgSVGElement from "../../../../../elements/fgSVGElement/FgSVGElement";
import FgHoverContentStandard from "../../../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import { useSocketContext } from "../../../../../context/socketContext/SocketContext";
import { IncomingMediasoupMessages } from "../../../../../serverControllers/mediasoupServer/lib/typeConstant";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const backgroundIcon = nginxAssetServerBaseUrl + "svgs/backgroundIcon.svg";
const navigateForwardIcon =
  nginxAssetServerBaseUrl + "svgs/navigateForward.svg";

export default function VisualMediaSettingsPanel({
  currentSettingsActive,
}: {
  currentSettingsActive: React.MutableRefObject<
    | {
        contentType: ContentTypes;
        instanceId: string;
        visualMediaInfo?: {
          isUser: boolean;
          username: string;
          instance: string;
        };
      }
    | undefined
  >;
}) {
  if (
    !currentSettingsActive.current ||
    !currentSettingsActive.current.visualMediaInfo ||
    (currentSettingsActive.current.contentType !== "camera" &&
      currentSettingsActive.current.contentType !== "screen")
  )
    return null;

  const { userMedia, remoteMedia } = useMediaContext();
  const { mediasoupSocket } = useSocketContext();

  const visualMedia = useRef(
    currentSettingsActive.current.visualMediaInfo.isUser
      ? userMedia.current[currentSettingsActive.current.contentType][
          currentSettingsActive.current.instanceId
        ]
      : remoteMedia.current[
          currentSettingsActive.current.visualMediaInfo.username
        ][currentSettingsActive.current.visualMediaInfo.instance][
          currentSettingsActive.current.contentType
        ]?.[currentSettingsActive.current.instanceId],
  );

  const [closedCaptionsActive, setClosedCaptionsActive] = useState(false);
  const [_, setRerender] = useState(false);
  const filenameRef = useRef<HTMLDivElement>(null);
  const subtitlesLabelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (
      !currentSettingsActive.current ||
      !currentSettingsActive.current.visualMediaInfo ||
      (currentSettingsActive.current.contentType !== "camera" &&
        currentSettingsActive.current.contentType !== "screen")
    )
      return;

    (visualMedia.current = currentSettingsActive.current.visualMediaInfo.isUser
      ? userMedia.current[currentSettingsActive.current.contentType][
          currentSettingsActive.current.instanceId
        ]
      : remoteMedia.current[
          currentSettingsActive.current.visualMediaInfo.username
        ][currentSettingsActive.current.visualMediaInfo.instance][
          currentSettingsActive.current.contentType
        ]?.[currentSettingsActive.current.instanceId]),
      setClosedCaptionsActive(false);

    setRerender((prev) => !prev);
  }, [currentSettingsActive.current.instanceId]);

  const handleMediasoupMessages = (msg: IncomingMediasoupMessages) => {
    switch (msg.type) {
      case "newProducerWasCreated":
        if (msg.header.producerType === "audio") {
          setRerender((prev) => !prev);
        }
        break;
      case "newProducerAvailable":
        if (msg.header.producerType === "audio") {
          setTimeout(() => {
            setRerender((prev) => !prev);
          }, 300);
        }
        break;
      case "producerDisconnected":
        if (msg.header.producerType === "audio") {
          setRerender((prev) => !prev);
        }
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    mediasoupSocket.current?.addMessageListener(handleMediasoupMessages);

    return () => {
      mediasoupSocket.current?.removeMessageListener(handleMediasoupMessages);
    };
  }, []);

  return (
    <div
      className="mx-6 my-4 flex h-max max-w-[320px] flex-col items-center justify-center space-y-1 rounded border border-fg-white bg-fg-tone-black-8 px-2 py-2 font-K2D text-fg-white"
      style={{ width: "calc(100% - 3rem)" }}
    >
      <HoverElement
        externalRef={filenameRef}
        className="w-full truncate px-2 py-1 font-Josefin text-2xl text-fg-white underline decoration-fg-red-light underline-offset-4"
        content={
          <>
            {currentSettingsActive.current.contentType === "camera"
              ? `${currentSettingsActive.current.visualMediaInfo.username}'s camera`
              : `${currentSettingsActive.current.visualMediaInfo.username}'s screen`}
          </>
        }
        hoverContent={
          (filenameRef.current?.scrollWidth ?? 0) >
          (filenameRef.current?.clientWidth ?? 0) ? (
            <FgHoverContentStandard
              style="light"
              content={
                currentSettingsActive.current.contentType === "camera"
                  ? "Camera settings"
                  : "Screen settings"
              }
            />
          ) : undefined
        }
        options={{
          hoverSpacing: 4,
          hoverType: "above",
          hoverTimeoutDuration: 750,
        }}
      />
      <FgButton
        className="h-7 w-full"
        contentFunction={() => (
          <div
            className={`${
              visualMedia.current?.settings.background.value
                ? "bg-fg-white fill-fg-tone-black-1 stroke-fg-tone-black-1 text-fg-tone-black-1"
                : "fill-fg-white stroke-fg-white"
            } flex h-full w-full items-center justify-start text-nowrap rounded px-1 text-lg hover:bg-fg-white hover:fill-fg-tone-black-1 hover:stroke-fg-tone-black-1 hover:text-fg-tone-black-1`}
          >
            <FgSVGElement
              src={backgroundIcon}
              className="mr-2 flex aspect-square h-full items-center justify-center"
              attributes={[
                { key: "width", value: "80%" },
                { key: "height", value: "80%" },
              ]}
            />
            <div className="truncate">Set as background</div>
          </div>
        )}
        clickFunction={() => {
          if (visualMedia.current)
            visualMedia.current.settings.background.value =
              !visualMedia.current.settings.background.value;

          visualMedia.current?.settingsChanged();

          setRerender((prev) => !prev);
        }}
        hoverContent={
          <FgHoverContentStandard
            content="Set as background (b)"
            style="light"
          />
        }
        options={{
          hoverSpacing: 4,
          hoverTimeoutDuration: 3500,
          hoverType: "above",
        }}
      />
      {((currentSettingsActive.current.visualMediaInfo.isUser &&
        userMedia.current.audio) ||
        (!currentSettingsActive.current.visualMediaInfo.isUser &&
          remoteMedia.current[
            currentSettingsActive.current.visualMediaInfo.username
          ][currentSettingsActive.current.visualMediaInfo.instance].audio)) && (
        <FgButton
          className="h-7 w-full"
          contentFunction={() => (
            <div className="flex w-full items-center justify-between text-nowrap rounded fill-fg-white stroke-fg-white px-1 text-fg-white hover:bg-fg-white hover:fill-fg-tone-black-1 hover:stroke-fg-tone-black-1 hover:text-fg-tone-black-1">
              <div ref={subtitlesLabelRef}>Subtitles</div>
              <div
                className="flex space-x-1"
                style={{
                  width: `calc(100% - ${subtitlesLabelRef.current?.clientWidth ?? 0}px - 1rem)`,
                }}
              >
                <div
                  className="truncate text-end"
                  style={{ width: "calc(100% - 1.25rem)" }}
                >
                  {
                    closedCaptionsSelections[
                      visualMedia.current!.settings.closedCaption.value
                    ]
                  }
                </div>
                <FgSVGElement
                  src={navigateForwardIcon}
                  className={`${closedCaptionsActive ? "-scale-x-100" : ""} rotate-90`}
                  attributes={[
                    { key: "width", value: "1.25rem" },
                    { key: "height", value: "1.25rem" },
                  ]}
                />
              </div>
            </div>
          )}
          clickFunction={() => setClosedCaptionsActive((prev) => !prev)}
        />
      )}
      {closedCaptionsActive && (
        <ClosedCaptionsPage
          visualMedia={visualMedia}
          setRerender={setRerender}
        />
      )}
    </div>
  );
}
