import React, { useEffect, useRef, useState } from "react";
import { useMediaContext } from "../../../../../context/mediaContext/MediaContext";
import { ContentTypes } from "../../../../../../../universal/contentTypeConstant";
import FgButton from "../../../../../elements/fgButton/FgButton";
import FgSVGElement from "../../../../../elements/fgSVGElement/FgSVGElement";
import FgHoverContentStandard from "../../../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import ImageSettingsController from "./lib/ImageSettingsController";
import DownloadTypePage from "./lib/DownloadTypePage";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const syncIcon = nginxAssetServerBaseUrl + "svgs/syncIcon.svg";
const desyncIcon = nginxAssetServerBaseUrl + "svgs/desyncIcon.svg";
const backgroundIcon = nginxAssetServerBaseUrl + "svgs/backgroundIcon.svg";
const navigateForward = nginxAssetServerBaseUrl + "svgs/navigateForward.svg";

export default function ImageSettingsPanel({
  currentSettingsActive,
}: {
  currentSettingsActive: React.MutableRefObject<
    | {
        contentType: ContentTypes;
        instanceId: string;
      }
    | undefined
  >;
}) {
  if (!currentSettingsActive.current) return null;

  const { staticContentMedia } = useMediaContext();

  const imageMediaInstance = useRef(
    staticContentMedia.current.image.tableInstances[
      currentSettingsActive.current.instanceId
    ],
  );

  const [downloadTypePageActive, setDownloadTypePageActive] = useState(false);
  const [_, setRerender] = useState(false);

  const imageSettingsController = new ImageSettingsController(
    imageMediaInstance,
    setDownloadTypePageActive,
    setRerender,
  );

  useEffect(() => {
    if (!currentSettingsActive.current) return;

    imageMediaInstance.current =
      staticContentMedia.current.image.tableInstances[
        currentSettingsActive.current.instanceId
      ];

    setDownloadTypePageActive(false);

    setRerender((prev) => !prev);
  }, [currentSettingsActive.current.instanceId]);

  return (
    <div
      className="mx-6 my-4 flex h-max flex-col items-center justify-center space-y-1 rounded border border-fg-white bg-fg-tone-black-8 px-2 py-2 font-K2D text-fg-white"
      style={{ width: "calc(100% - 3rem)" }}
    >
      <div className="w-full truncate px-2 py-1 font-Josefin text-2xl text-fg-white underline decoration-fg-red-light underline-offset-4">
        {imageMediaInstance.current.imageMedia.filename}
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
  );
}
