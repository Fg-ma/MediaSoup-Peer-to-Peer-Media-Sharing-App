import React, { useEffect, useRef, useState } from "react";
import FgButton from "../../../../elements/fgButton/FgButton";
import FgSVGElement from "../../../../elements/fgSVGElement/FgSVGElement";
import LoadingBar from "../../../../elements/loadingBar/LoadingBar";
import FgHoverContentStandard from "../../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import HoverElement from "../../../../elements/hoverElement/HoverElement";
import MoreInfoSection from "./MoreInfoSection";
import Downloader from "../../../../tools/downloader/Downloader";
import { DownloadListenerTypes } from "../../../../tools/downloader/lib/typeConstant";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const pauseIcon = nginxAssetServerBaseUrl + "svgs/pauseIcon.svg";
const playIcon = nginxAssetServerBaseUrl + "svgs/playIcon.svg";
const closeIcon = nginxAssetServerBaseUrl + "svgs/closeIcon.svg";
const infoIcon = nginxAssetServerBaseUrl + "svgs/infoIcon.svg";

export default function DownloadingSection({
  download,
  tablePanelRef,
}: {
  download: Downloader;
  tablePanelRef: React.RefObject<HTMLDivElement>;
}) {
  const [moreInfoSectionActive, setMoreInfoSectionActive] = useState(false);
  const [_, setRerender] = useState(false);
  const rightLoadingInfoRef = useRef<HTMLDivElement>(null);
  const filenameRef = useRef<HTMLDivElement>(null);

  const handleDownloadListener = (message: DownloadListenerTypes) => {
    switch (message.type) {
      case "downloadProgress":
        setRerender((prev) => !prev);
        break;
      case "downloadPaused":
        setRerender((prev) => !prev);
        break;
      case "downloadResumed":
        setRerender((prev) => !prev);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    download.addDownloadListener(handleDownloadListener);

    return () => {
      download.removeDownloadListener(handleDownloadListener);
    };
  }, []);

  return (
    <div className="flex h-max w-full flex-col items-start justify-center space-y-2 border-y-2 border-fg-tone-black-3 bg-fg-tone-black-5 py-4">
      <div className="flex h-8 w-full items-center justify-between pl-[1.875rem] pr-8">
        <div
          className="flex h-full grow items-center justify-start space-x-2"
          style={{
            width: `calc(100% - ${rightLoadingInfoRef.current?.clientWidth ?? 0}px)`,
          }}
        >
          <HoverElement
            externalRef={filenameRef}
            className="h-full grow truncate font-K2D text-xl text-fg-white"
            content={<>{download.filename}</>}
            hoverContent={
              (filenameRef.current?.scrollWidth ?? 0) >
              (filenameRef.current?.clientWidth ?? 0) ? (
                <FgHoverContentStandard
                  style="light"
                  content={download.filename}
                />
              ) : undefined
            }
            options={{
              hoverSpacing: 4,
              hoverType: "above",
              hoverTimeoutDuration: 500,
            }}
          />
        </div>
        <div
          ref={rightLoadingInfoRef}
          className="flex h-full w-max items-center justify-center space-x-1"
        >
          <FgButton
            className="flex aspect-square h-[90%] items-center justify-center"
            contentFunction={() => (
              <FgSVGElement
                src={download.paused ? playIcon : pauseIcon}
                className="fill-fg-white stroke-fg-white"
                attributes={[
                  { key: "height", value: "100%" },
                  { key: "width", value: "100%" },
                ]}
              />
            )}
            clickFunction={() => {
              if (download.paused) {
                download.resume();
              } else {
                download.pause();
              }
            }}
            scrollingContainerRef={tablePanelRef}
            hoverContent={
              <FgHoverContentStandard
                content={download.paused ? "Resume download" : "Pause download"}
                style="light"
              />
            }
            options={{
              hoverSpacing: 4,
              hoverTimeoutDuration: 750,
              hoverType: "above",
            }}
          />
          <FgButton
            className="flex aspect-square h-[60%] items-center justify-center"
            contentFunction={() => (
              <FgSVGElement
                src={closeIcon}
                className="fill-fg-white stroke-fg-white"
                attributes={[
                  { key: "height", value: "100%" },
                  { key: "width", value: "100%" },
                ]}
              />
            )}
            clickFunction={download.cancel}
            scrollingContainerRef={tablePanelRef}
            hoverContent={
              <FgHoverContentStandard content="Cancel download" style="light" />
            }
            options={{
              hoverSpacing: 4,
              hoverTimeoutDuration: 750,
              hoverType: "above",
            }}
          />
        </div>
      </div>
      <div className="flex w-full max-w-80 items-center justify-center space-x-2 px-7">
        <LoadingBar className="h-3 w-full" progress={download.progress * 100} />
        <FgButton
          className="flex aspect-square h-5 items-center justify-center"
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
      {moreInfoSectionActive && <MoreInfoSection download={download} />}
    </div>
  );
}
