import React, { useEffect, useRef, useState } from "react";
import { useMediaContext } from "../../../../../context/mediaContext/MediaContext";
import { ContentTypes } from "../../../../../../../universal/contentTypeConstant";
import FgButton from "../../../../../elements/fgButton/FgButton";
import FgSVGElement from "../../../../../elements/fgSVGElement/FgSVGElement";
import FgHoverContentStandard from "../../../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import DownloadOptionsPage from "./lib/DownloadOptionsPage";
import VideoSettingsController from "./lib/VideoSettingsController";
import { downloadTypeSelections } from "src/media/fgTableVideo/lib/typeConstant";
import { closedCaptionsSelections } from "./lib/ClosedCaptionsPage";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const downloadIcon = nginxAssetServerBaseUrl + "svgs/downloadIcon.svg";
const editIcon = nginxAssetServerBaseUrl + "svgs/editIcon.svg";
const copyIcon = nginxAssetServerBaseUrl + "svgs/copyIcon.svg";
const syncIcon = nginxAssetServerBaseUrl + "svgs/syncIcon.svg";
const desyncIcon = nginxAssetServerBaseUrl + "svgs/desyncIcon.svg";
const backgroundIcon = nginxAssetServerBaseUrl + "svgs/backgroundIcon.svg";
const navigateForward = nginxAssetServerBaseUrl + "svgs/navigateForward.svg";

export default function VideoSettingsPanel({
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

  const videoMediaInstance = useRef(
    staticContentMedia.current.video.tableInstances[
      currentSettingsActive.current.instanceId
    ],
  );

  const [downloadOptionsActive, setDownloadOptionsActive] = useState(false);
  const [_, setRerender] = useState(false);

  const videoSettingsController = new VideoSettingsController(
    videoMediaInstance,
    setDownloadOptionsActive,
    setRerender,
  );

  useEffect(() => {
    if (!currentSettingsActive.current) return;

    videoMediaInstance.current =
      staticContentMedia.current.video.tableInstances[
        currentSettingsActive.current.instanceId
      ];

    setDownloadOptionsActive(false);

    setRerender((prev) => !prev);
  }, [currentSettingsActive.current.instanceId]);

  return (
    <div
      className="mx-6 my-4 flex h-max flex-col items-center justify-center space-y-1 rounded border border-fg-white bg-fg-tone-black-8 px-2 py-2 font-K2D text-fg-white"
      style={{ width: "calc(100% - 3rem)" }}
    >
      <div className="w-full truncate px-2 py-1 font-Josefin text-2xl text-fg-white underline decoration-fg-red-light underline-offset-4">
        {videoMediaInstance.current.videoMedia.filename}
      </div>
      <FgButton
        className="h-7 w-full"
        contentFunction={() => (
          <div
            className={`${
              videoMediaInstance.current.settings.background.value
                ? "bg-fg-white text-fg-tone-black-1"
                : ""
            } flex w-full items-center justify-start text-nowrap rounded px-2 text-lg hover:bg-fg-white hover:text-fg-tone-black-1`}
          >
            Set as background (b)
          </div>
        )}
        clickFunction={lowerVideoController.current.handleSetAsBackground}
      />
      <FgButton
        className="w-full"
        contentFunction={() => (
          <div className="flex w-full items-center justify-between text-nowrap rounded px-2 hover:bg-fg-white hover:text-fg-tone-black-1">
            <div>Download</div>
            <div>
              {
                downloadTypeSelections[
                  videoMediaInstance.current.settings.downloadType.value
                ]
              }
            </div>
          </div>
        )}
        clickFunction={handleDownloadTypeActive}
      />
      <FgButton
        className="w-full"
        contentFunction={() => (
          <div className="flex w-full items-center justify-between text-nowrap rounded px-2 hover:bg-fg-white hover:text-fg-tone-black-1">
            <div>Video speed</div>
            <div>{`${parseFloat(
              videoMediaInstance.current.settings.videoSpeed.value.toFixed(2),
            )}x`}</div>
          </div>
        )}
        clickFunction={handleVideoSpeedActive}
      />
      <FgButton
        className="w-full"
        contentFunction={() => (
          <div className="flex w-full items-center justify-between text-nowrap rounded px-2 hover:bg-fg-white hover:text-fg-tone-black-1">
            <div>Subtitles</div>
            <div>
              {
                closedCaptionsSelections[
                  videoMediaInstance.current.settings.closedCaption.value
                ]
              }
            </div>
          </div>
        )}
        clickFunction={handleClosedCaptionsActive}
      />
    </div>
  );
}
