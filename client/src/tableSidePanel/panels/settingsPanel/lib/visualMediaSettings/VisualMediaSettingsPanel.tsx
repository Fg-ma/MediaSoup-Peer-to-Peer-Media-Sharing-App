import React, { useEffect, useRef, useState } from "react";
import { useMediaContext } from "../../../../../context/mediaContext/MediaContext";
import { useSocketContext } from "../../../../../context/socketContext/SocketContext";
import { useGeneralContext } from "../../../../../context/generalContext/GeneralContext";
import { useSignalContext } from "../../../../../context/signalContext/SignalContext";
import { IncomingMediasoupMessages } from "../../../../../serverControllers/mediasoupServer/lib/typeConstant";
import FgButton from "../../../../../elements/fgButton/FgButton";
import HoverElement from "../../../../../elements/hoverElement/HoverElement";
import { closedCaptionsSelections } from "../../../../../media/fgVisualMedia/lib/fgLowerVisualMediaControls/lib/fgSettingsButton/lib/ClosedCaptionsPage";
import ClosedCaptionsPage from "./lib/ClosedCaptionsPage";
import FgSVGElement from "../../../../../elements/fgSVGElement/FgSVGElement";
import FgHoverContentStandard from "../../../../../elements/fgHoverContentStandard/FgHoverContentStandard";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const closeIcon = nginxAssetServerBaseUrl + "svgs/closeIcon.svg";
const backgroundIcon = nginxAssetServerBaseUrl + "svgs/backgroundIcon.svg";
const navigateForwardIcon =
  nginxAssetServerBaseUrl + "svgs/navigateForward.svg";
const captionsIcon = nginxAssetServerBaseUrl + "svgs/captionsIcon.svg";

export default function VisualMediaSettingsPanel({
  contentType,
  instanceId,
  isUser,
  username,
  instance,
  setExternalRerender,
}: {
  contentType: "camera" | "screen";
  instanceId: string;
  isUser: boolean;
  username: string;
  instance: string;
  setExternalRerender: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { userMedia, remoteMedia } = useMediaContext();
  const { mediasoupSocket } = useSocketContext();
  const { currentSettingsActive } = useGeneralContext();
  const { sendSettingsSignal, sendGroupSignal } = useSignalContext();

  const visualMedia = useRef(
    isUser
      ? userMedia.current[contentType][instanceId]
      : remoteMedia.current[username][instance][contentType]?.[instanceId],
  );

  const [closedCaptionsActive, setClosedCaptionsActive] = useState(false);
  const [_, setRerender] = useState(false);
  const filenameRef = useRef<HTMLDivElement>(null);
  const subtitlesLabelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    visualMedia.current = isUser
      ? userMedia.current[contentType][instanceId]
      : remoteMedia.current[username][instance][contentType]?.[instanceId];

    setClosedCaptionsActive(false);

    setRerender((prev) => !prev);
  }, [instanceId]);

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
      <div className="flex h-7 w-full items-center justify-start px-1">
        <FgButton
          className="mr-2 flex h-full items-center justify-center"
          contentFunction={() => (
            <FgSVGElement
              src={closeIcon}
              className="aspect-square h-[55%] fill-fg-white stroke-fg-white"
              attributes={[
                { key: "width", value: "100%" },
                { key: "height", value: "100%" },
              ]}
            />
          )}
          clickFunction={() => {
            const idx = currentSettingsActive.current.findIndex(
              (active) =>
                contentType === active.contentType &&
                instanceId === active.instanceId,
            );

            if (idx !== -1) {
              currentSettingsActive.current.splice(idx, 1);
              sendSettingsSignal({
                type: "sidePanelChanged",
              });
              setExternalRerender((prev) => !prev);
            }
          }}
          hoverContent={
            <FgHoverContentStandard content={"Close settings"} style="light" />
          }
          options={{
            hoverSpacing: 4,
            hoverTimeoutDuration: 3500,
            hoverType: "above",
          }}
        />
        <HoverElement
          externalRef={filenameRef}
          className="w-full truncate px-2 py-1 font-Josefin text-2xl text-fg-white underline decoration-fg-red-light underline-offset-4"
          content={
            <>
              {contentType === "camera"
                ? `${username}'s camera`
                : `${username}'s screen`}
            </>
          }
          hoverContent={
            (filenameRef.current?.scrollWidth ?? 0) >
            (filenameRef.current?.clientWidth ?? 0) ? (
              <FgHoverContentStandard
                style="light"
                content={
                  contentType === "camera"
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
      </div>
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

          setTimeout(() => {
            sendGroupSignal({
              type: "removeGroupElement",
              data: { removeType: contentType, removeId: instanceId },
            });
          }, 0);

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
      <FgButton
        className="h-7 w-full"
        contentFunction={() => (
          <div
            className={`${
              visualMedia.current?.settings.pictureInPicture.value
                ? "bg-fg-white text-fg-tone-black-1"
                : ""
            } group/pictureInPicture flex h-full w-full items-center justify-start text-nowrap rounded px-1 text-lg hover:bg-fg-white hover:text-fg-tone-black-1`}
          >
            <div className="mr-2 flex aspect-square h-[90%] items-center justify-center">
              <div
                className={`flex h-[65%] w-[80%] rounded-md border-3 group-hover/pictureInPicture:border-fg-tone-black-1 ${
                  visualMedia.current?.settings.pictureInPicture.value
                    ? "items-start justify-start border-fg-tone-black-1"
                    : "items-end justify-end border-fg-white"
                }`}
              >
                <div
                  className={`h-[50%] w-[60%] rounded-sm group-hover/pictureInPicture:bg-fg-tone-black-1 ${
                    visualMedia.current?.settings.pictureInPicture.value
                      ? "ml-[10%] mt-[10%] bg-fg-tone-black-1"
                      : "mb-[10%] mr-[10%] bg-fg-white"
                  }`}
                ></div>
              </div>
            </div>
            <div className="truncate">
              {visualMedia.current?.settings.pictureInPicture.value
                ? "Close picture in picture"
                : "Open picture in picture"}
            </div>
          </div>
        )}
        clickFunction={() => {
          visualMedia.current?.handleMiniPlayer();

          setRerender((prev) => !prev);
        }}
        hoverContent={
          <FgHoverContentStandard
            content="Picture in picture (i)"
            style="light"
          />
        }
        options={{
          hoverSpacing: 4,
          hoverTimeoutDuration: 3500,
          hoverType: "above",
        }}
      />
      <FgButton
        className="h-7 w-full"
        contentFunction={() => (
          <div
            className={`${
              visualMedia.current?.settings.captions.value
                ? "bg-fg-white fill-fg-tone-black-1 stroke-fg-tone-black-1 text-fg-tone-black-1"
                : "fill-fg-white stroke-fg-white"
            } flex h-full w-full items-center justify-start text-nowrap rounded px-1 text-lg hover:bg-fg-white hover:fill-fg-tone-black-1 hover:stroke-fg-tone-black-1 hover:text-fg-tone-black-1`}
          >
            <FgSVGElement
              src={captionsIcon}
              className="mr-2 flex aspect-square h-full items-center justify-center"
              attributes={[
                { key: "width", value: "80%" },
                { key: "height", value: "80%" },
              ]}
            />
            <div className="truncate">
              {visualMedia.current?.settings.captions.value
                ? "Disable captions"
                : "Enable captions"}
            </div>
          </div>
        )}
        clickFunction={() => {
          visualMedia.current?.handleClosedCaptions();

          setTimeout(() => {
            setRerender((prev) => !prev);
          }, 0);
        }}
        hoverContent={
          <FgHoverContentStandard content="Captions (c)" style="light" />
        }
        options={{
          hoverSpacing: 4,
          hoverTimeoutDuration: 3500,
          hoverType: "above",
        }}
      />
      {((isUser && userMedia.current.audio) ||
        (!isUser && remoteMedia.current[username][instance].audio)) && (
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
