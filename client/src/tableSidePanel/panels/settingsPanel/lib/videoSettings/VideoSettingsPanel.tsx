import React, { useEffect, useRef, useState } from "react";
import { useMediaContext } from "../../../../../context/mediaContext/MediaContext";
import { ContentTypes } from "../../../../../../../universal/contentTypeConstant";
import FgButton from "../../../../../elements/fgButton/FgButton";
import VideoSettingsController from "./lib/VideoSettingsController";
import { downloadTypeSelections } from "../../../../../media/fgTableVideo/lib/typeConstant";
import ClosedCaptionsPage, {
  closedCaptionsSelections,
} from "./lib/ClosedCaptionsPage";
import FgSVGElement from "../../../../../elements/fgSVGElement/FgSVGElement";
import FgHoverContentStandard from "../../../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import DownloadTypePage from "./lib/DownloadTypePage";
import VideoSpeedPage from "./lib/VideoSpeedPage";
import HoverElement from "../../../../../elements/hoverElement/HoverElement";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const downloadIcon = nginxAssetServerBaseUrl + "svgs/downloadIcon.svg";
const syncIcon = nginxAssetServerBaseUrl + "svgs/syncIcon.svg";
const desyncIcon = nginxAssetServerBaseUrl + "svgs/desyncIcon.svg";
const backgroundIcon = nginxAssetServerBaseUrl + "svgs/backgroundIcon.svg";
const navigateForwardIcon =
  nginxAssetServerBaseUrl + "svgs/navigateForward.svg";

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

  const [downloadTypeActive, setDownloadTypeActive] = useState(false);
  const [videoSpeedActive, setVideoSpeedActive] = useState(false);
  const [closedCaptionsActive, setClosedCaptionsActive] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const filenameRef = useRef<HTMLDivElement>(null);
  const downloadLabelRef = useRef<HTMLDivElement>(null);
  const videoSpeedLabelRef = useRef<HTMLDivElement>(null);
  const subtitlesLabelRef = useRef<HTMLDivElement>(null);

  const [_, setRerender] = useState(false);

  const videoSettingsController = new VideoSettingsController(
    videoMediaInstance,
    setRerender,
  );

  useEffect(() => {
    if (!currentSettingsActive.current) return;

    videoMediaInstance.current =
      staticContentMedia.current.video.tableInstances[
        currentSettingsActive.current.instanceId
      ];

    setDownloadTypeActive(false);
    setVideoSpeedActive(false);
    setClosedCaptionsActive(false);

    setRerender((prev) => !prev);
  }, [currentSettingsActive.current.instanceId]);

  return (
    <div
      ref={containerRef}
      className="mx-6 my-4 flex h-max max-w-[320px] flex-col items-center justify-center space-y-1 rounded border border-fg-white bg-fg-tone-black-8 px-2 py-2 font-K2D text-fg-white"
      style={{ width: "calc(100% - 3rem)" }}
    >
      <HoverElement
        externalRef={filenameRef}
        className="w-full truncate px-2 py-1 font-Josefin text-2xl text-fg-white underline decoration-fg-red-light underline-offset-4"
        content={<>{videoMediaInstance.current.videoMedia.filename}</>}
        hoverContent={
          (filenameRef.current?.scrollWidth ?? 0) >
          (filenameRef.current?.clientWidth ?? 0) ? (
            <FgHoverContentStandard
              style="light"
              content={videoMediaInstance.current.videoMedia.filename}
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
              videoMediaInstance.current.settings.synced.value
                ? "bg-fg-white fill-fg-tone-black-1 stroke-fg-tone-black-1 text-fg-tone-black-1"
                : "fill-fg-white stroke-fg-white"
            } flex h-full w-full items-center justify-start text-nowrap rounded px-1 text-lg hover:bg-fg-white hover:fill-fg-tone-black-1 hover:stroke-fg-tone-black-1 hover:text-fg-tone-black-1`}
          >
            <FgSVGElement
              src={
                videoMediaInstance.current.settings.synced.value
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
              {videoMediaInstance.current.settings.synced.value
                ? "Desync"
                : "Sync"}
            </div>
          </div>
        )}
        clickFunction={videoSettingsController.handleSync}
        hoverContent={
          <FgHoverContentStandard
            content={
              videoMediaInstance.current.settings.synced.value
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
              videoMediaInstance.current.settings.background.value
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
        clickFunction={videoSettingsController.handleSetAsBackground}
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
          <div className="flex h-full w-full items-center justify-between text-nowrap rounded fill-fg-white stroke-fg-white px-1 text-fg-white hover:bg-fg-white hover:fill-fg-tone-black-1 hover:stroke-fg-tone-black-1 hover:text-fg-tone-black-1">
            <div
              ref={downloadLabelRef}
              className="flex h-full items-center justify-center"
            >
              <FgSVGElement
                src={downloadIcon}
                className="mr-2 flex aspect-square h-full items-center justify-center"
                attributes={[
                  { key: "width", value: "85%" },
                  { key: "height", value: "85%" },
                ]}
              />
              Download
            </div>
            {(containerRef.current?.clientWidth ?? 172) >= 172 ? (
              <div
                className="flex space-x-1"
                style={{
                  width: `calc(100% - ${downloadLabelRef.current?.clientWidth ?? 0}px - 1rem)`,
                }}
              >
                <div
                  className="truncate text-end"
                  style={{ width: "calc(100% - 1.25rem)" }}
                >
                  {
                    downloadTypeSelections[
                      videoMediaInstance.current.settings.downloadType.value
                    ]
                  }
                </div>
                <FgSVGElement
                  src={navigateForwardIcon}
                  className={`${downloadTypeActive ? "-scale-x-100" : ""} rotate-90`}
                  attributes={[
                    { key: "width", value: "1.25rem" },
                    { key: "height", value: "1.25rem" },
                  ]}
                />
              </div>
            ) : (
              <div></div>
            )}
          </div>
        )}
        clickFunction={() => setDownloadTypeActive((prev) => !prev)}
      />
      {downloadTypeActive && (
        <DownloadTypePage
          videoMediaInstance={videoMediaInstance}
          setRerender={setRerender}
        />
      )}
      <FgButton
        className="h-7 w-full"
        contentFunction={() => (
          <div className="flex w-full items-center justify-between text-nowrap rounded fill-fg-white stroke-fg-white px-1 text-fg-white hover:bg-fg-white hover:fill-fg-tone-black-1 hover:stroke-fg-tone-black-1 hover:text-fg-tone-black-1">
            <div ref={videoSpeedLabelRef}>Video speed</div>

            {(containerRef.current?.clientWidth ?? 158) >= 158 ? (
              <div
                className="flex space-x-1"
                style={{
                  width: `calc(100% - ${videoSpeedLabelRef.current?.clientWidth ?? 0}px - 1rem)`,
                }}
              >
                <div
                  className="truncate text-end"
                  style={{ width: "calc(100% - 1.25rem)" }}
                >
                  {`${parseFloat(
                    videoMediaInstance.current.settings.videoSpeed.value.toFixed(
                      2,
                    ),
                  )}x`}
                </div>
                <FgSVGElement
                  src={navigateForwardIcon}
                  className={`${videoSpeedActive ? "-scale-x-100" : ""} rotate-90`}
                  attributes={[
                    { key: "width", value: "1.25rem" },
                    { key: "height", value: "1.25rem" },
                  ]}
                />
              </div>
            ) : (
              <div></div>
            )}
          </div>
        )}
        clickFunction={() => setVideoSpeedActive((prev) => !prev)}
      />
      {videoSpeedActive && (
        <VideoSpeedPage
          videoMediaInstance={videoMediaInstance}
          setRerender={setRerender}
        />
      )}
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
                    videoMediaInstance.current.settings.closedCaption.value
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
      {closedCaptionsActive && (
        <ClosedCaptionsPage
          videoMediaInstance={videoMediaInstance}
          setRerender={setRerender}
        />
      )}
    </div>
  );
}
