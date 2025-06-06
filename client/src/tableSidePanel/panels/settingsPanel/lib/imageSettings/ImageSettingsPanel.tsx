import React, { useEffect, useRef, useState } from "react";
import { useMediaContext } from "../../../../../context/mediaContext/MediaContext";
import { useGeneralContext } from "../../../../../context/generalContext/GeneralContext";
import { useSignalContext } from "../../../../../context/signalContext/SignalContext";
import { useSocketContext } from "../../../../../context/socketContext/SocketContext";
import FgButton from "../../../../../elements/fgButton/FgButton";
import FgSVGElement from "../../../../../elements/fgSVGElement/FgSVGElement";
import FgHoverContentStandard from "../../../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import ImageSettingsController from "./lib/ImageSettingsController";
import DownloadTypePage from "./lib/DownloadTypePage";
import HoverElement from "../../../../../elements/hoverElement/HoverElement";
import FgPortal from "../../../../../elements/fgPortal/FgPortal";
import TUI from "../../../../../TUI/TUI";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const closeIcon = nginxAssetServerBaseUrl + "svgs/closeIcon.svg";
const editIcon = nginxAssetServerBaseUrl + "svgs/editIcon.svg";
const syncIcon = nginxAssetServerBaseUrl + "svgs/syncIcon.svg";
const desyncIcon = nginxAssetServerBaseUrl + "svgs/desyncIcon.svg";
const backgroundIcon = nginxAssetServerBaseUrl + "svgs/backgroundIcon.svg";
const navigateForward = nginxAssetServerBaseUrl + "svgs/navigateForward.svg";

export default function ImageSettingsPanel({
  instanceId,
  setExternalRerender,
}: {
  instanceId: string;
  setExternalRerender: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { staticContentMedia } = useMediaContext();
  const { currentSettingsActive } = useGeneralContext();
  const { sendSettingsSignal, sendGroupSignal } = useSignalContext();
  const { tableStaticContentSocket } = useSocketContext();

  const imageMediaInstance = useRef(
    staticContentMedia.current.image.tableInstances[instanceId],
  );

  const [downloadTypePageActive, setDownloadTypePageActive] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [_, setRerender] = useState(false);
  const filenameRef = useRef<HTMLDivElement>(null);

  const imageSettingsController = new ImageSettingsController(
    imageMediaInstance,
    setDownloadTypePageActive,
    setRerender,
    tableStaticContentSocket,
    sendGroupSignal,
    setIsEditing,
  );

  useEffect(() => {
    imageMediaInstance.current =
      staticContentMedia.current.image.tableInstances[instanceId];

    setDownloadTypePageActive(false);

    setRerender((prev) => !prev);
  }, [instanceId]);

  return (
    <>
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
                  "image" === active.contentType &&
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
              <FgHoverContentStandard
                content={"Close settings"}
                style="light"
              />
            }
            options={{
              hoverSpacing: 4,
              hoverTimeoutDuration: 3500,
              hoverType: "above",
            }}
          />
          <HoverElement
            externalRef={filenameRef}
            className="truncate py-1 font-Josefin text-2xl text-fg-white underline decoration-fg-red-light underline-offset-4"
            style={{ width: "calc(100% - 2.25rem)" }}
            content={<>{imageMediaInstance.current.imageMedia.filename}</>}
            hoverContent={
              (filenameRef.current?.scrollWidth ?? 0) >
              (filenameRef.current?.clientWidth ?? 0) ? (
                <FgHoverContentStandard
                  style="light"
                  content={imageMediaInstance.current.imageMedia.filename}
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
                imageMediaInstance.current.settings.synced.value
                  ? "bg-fg-white fill-fg-tone-black-1 stroke-fg-tone-black-1 text-fg-tone-black-1"
                  : "fill-fg-white stroke-fg-white"
              } flex h-full w-full items-center justify-start text-nowrap rounded px-2 text-lg hover:bg-fg-white hover:fill-fg-tone-black-1 hover:stroke-fg-tone-black-1 hover:text-fg-tone-black-1`}
            >
              <FgSVGElement
                src={
                  imageMediaInstance.current.settings.synced.value
                    ? desyncIcon
                    : syncIcon
                }
                className="mr-2 flex aspect-square h-full items-center justify-center"
                attributes={[
                  { key: "width", value: "80%" },
                  { key: "height", value: "80%" },
                ]}
              />
              <div className="truncate">
                {imageMediaInstance.current.settings.synced.value
                  ? "Desync"
                  : "Sync"}
              </div>
            </div>
          )}
          clickFunction={imageSettingsController.handleSync}
          hoverContent={
            <FgHoverContentStandard
              content={
                imageMediaInstance.current.settings.synced.value
                  ? "Desync (h)"
                  : "Sync (h)"
              }
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
                imageMediaInstance.current.settings.background.value
                  ? "bg-fg-white fill-fg-tone-black-1 stroke-fg-tone-black-1 text-fg-tone-black-1"
                  : "fill-fg-white stroke-fg-white"
              } flex h-full w-full items-center justify-start text-nowrap rounded px-2 text-lg hover:bg-fg-white hover:fill-fg-tone-black-1 hover:stroke-fg-tone-black-1 hover:text-fg-tone-black-1`}
            >
              <FgSVGElement
                src={backgroundIcon}
                className="mr-2 flex aspect-square h-full items-center justify-center"
                attributes={[
                  { key: "width", value: "80%" },
                  { key: "height", value: "80%" },
                ]}
              />
              <div className="truncate">
                {imageMediaInstance.current.settings.background.value
                  ? "Remove from background"
                  : "Set as background"}
              </div>
            </div>
          )}
          clickFunction={imageSettingsController.handleSetAsBackground}
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
            <div className="flex h-full w-full items-center justify-start text-nowrap rounded fill-fg-white stroke-fg-white px-2 text-lg hover:bg-fg-white hover:fill-fg-tone-black-1 hover:stroke-fg-tone-black-1 hover:text-fg-tone-black-1">
              <FgSVGElement
                src={editIcon}
                className="mr-2 flex aspect-square h-full items-center justify-center"
                attributes={[
                  { key: "width", value: "80%" },
                  { key: "height", value: "80%" },
                ]}
              />
              <div className="truncate">Edit</div>
            </div>
          )}
          clickFunction={imageSettingsController.handleEdit}
          hoverContent={
            <FgHoverContentStandard content="Edit (m)" style="light" />
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
            <div className="flex h-full w-full items-center justify-start text-nowrap rounded fill-fg-white stroke-fg-white px-2 text-lg hover:bg-fg-white hover:fill-fg-tone-black-1 hover:stroke-fg-tone-black-1 hover:text-fg-tone-black-1">
              <FgSVGElement
                src={navigateForward}
                className={`${downloadTypePageActive ? "-scale-x-100" : ""} mr-2 flex aspect-square h-[80%] rotate-90 items-center justify-center`}
                attributes={[
                  { key: "width", value: "100%" },
                  { key: "height", value: "100%" },
                ]}
              />
              <div className="truncate">Download type</div>
            </div>
          )}
          clickFunction={imageSettingsController.handleDownloadTypePageActive}
          hoverContent={
            <FgHoverContentStandard
              content={
                downloadTypePageActive
                  ? "Close download options"
                  : "Open download options"
              }
              style="light"
            />
          }
          options={{
            hoverSpacing: 4,
            hoverTimeoutDuration: 3500,
            hoverType: "above",
          }}
        />
        {downloadTypePageActive && (
          <DownloadTypePage imageMediaInstance={imageMediaInstance} />
        )}
      </div>
      {isEditing && imageMediaInstance.current.imageMedia.blobURL && (
        <FgPortal
          type="staticTopDomain"
          top={0}
          left={0}
          zValue={490000}
          className="h-full w-full"
          content={
            <TUI
              initialUrl={imageMediaInstance.current.imageMedia.blobURL}
              initialFilename={imageMediaInstance.current.imageMedia.filename}
              closeCallback={() => {
                setIsEditing(false);
              }}
              confirmCallback={() => {
                setIsEditing(false);
              }}
            />
          }
          options={{ animate: false }}
        />
      )}
    </>
  );
}
