import React, { useEffect, useRef, useState } from "react";
import { useMediaContext } from "../../../../../../../context/mediaContext/MediaContext";
import GeneralMediaSelection from "../GeneralMediaSelection";
import SvgEffectsSection from "./lib/SvgEffectsSection";
import { LoadingStateTypes } from "../../../../../../../../../universal/contentTypeConstant";
import LoadingElement from "../../../../../../../elements/loadingElement/LoadingElement";
import DownloadFailed from "../../../../../../../elements/downloadFailed/DownloadFailed";
import DownloadPaused from "../../../../../../../elements/downloadPaused/DownloadPaused";
import SvgSelectionController from "./lib/SvgSelectionController";
import { useSignalContext } from "../../../../../../../context/signalContext/SignalContext";
import NoPreviewAvailable from "../../../../../../../elements/noPreviewAvailable/NoPreviewAvailable";

export default function SvgSelection({
  instanceId,
  tablePanelRef,
}: {
  instanceId: string;
  tablePanelRef: React.RefObject<HTMLDivElement>;
}) {
  const { staticContentMedia } = useMediaContext();
  const { addGroupSignalListener, removeGroupSignalListener } =
    useSignalContext();

  const svgInstanceMedia =
    staticContentMedia.current.svg.tableInstances[instanceId];
  const positioning = svgInstanceMedia?.getPositioning();

  const [largestDim, setLargestDim] = useState<"width" | "height">("width");
  const [loadingState, setLoadingState] = useState<LoadingStateTypes>(
    svgInstanceMedia?.svgMedia.loadingState,
  );
  const [_, setRerender] = useState(false);
  const svgContainerRef = useRef<HTMLDivElement>(null);

  const svgSelectionController = new SvgSelectionController(
    instanceId,
    svgInstanceMedia,
    svgContainerRef,
    setLoadingState,
    setRerender,
  );

  useEffect(() => {
    svgInstanceMedia?.addSvgInstanceListener(
      svgSelectionController.handleInstanceEvents,
    );
    svgInstanceMedia?.svgMedia.addSvgListener(
      svgSelectionController.handleSvgMessages,
    );

    addGroupSignalListener(svgSelectionController.handleGroupSignal);

    return () => {
      svgInstanceMedia?.removeSvgInstanceListener(
        svgSelectionController.handleInstanceEvents,
      );
      svgInstanceMedia.svgMedia.removeSvgListener(
        svgSelectionController.handleSvgMessages,
      );
      removeGroupSignalListener(svgSelectionController.handleGroupSignal);
    };
  }, []);

  useEffect(() => {
    if (loadingState === "downloaded" && svgInstanceMedia?.instanceSvg) {
      if ((svgInstanceMedia.svgMedia.aspect ?? 0) > 1) {
        setLargestDim("width");
      } else {
        setLargestDim("height");
      }

      if (svgInstanceMedia.svgMedia.fileSize < 1024 * 1024 * 20)
        svgContainerRef.current?.appendChild(
          svgInstanceMedia.instanceSvg.cloneNode(true)!,
        );
    }
  }, [loadingState]);

  return (
    svgInstanceMedia && (
      <GeneralMediaSelection
        contentId={svgInstanceMedia.svgMedia.svgId}
        instanceId={instanceId}
        contentType="svg"
        selectionContent={
          loadingState === "downloaded" ? (
            <div
              ref={svgContainerRef}
              className={`${largestDim === "width" ? "w-full max-w-[12rem]" : "h-full max-h-[12rem]"} !w-auto overflow-hidden rounded-md object-contain`}
            >
              {svgInstanceMedia.svgMedia.fileSize > 1024 * 1024 * 20 &&
                svgInstanceMedia.svgMedia.aspect && (
                  <NoPreviewAvailable
                    className={`${largestDim === "width" ? "w-[12rem]" : "h-[12rem]"}`}
                  />
                )}
            </div>
          ) : loadingState === "downloading" ? (
            <LoadingElement
              className="h-[12rem] w-full rounded-md"
              pauseDownload={svgInstanceMedia.svgMedia.downloader?.pause}
            />
          ) : loadingState === "failed" ? (
            <DownloadFailed
              className="h-[12rem] w-full rounded-md"
              onClick={svgInstanceMedia.svgMedia.retryDownload}
            />
          ) : loadingState === "paused" ? (
            <DownloadPaused
              className="h-[12rem] w-full rounded-md"
              onClick={svgInstanceMedia.svgMedia.downloader?.resume}
            />
          ) : (
            <></>
          )
        }
        effectsSection={
          <SvgEffectsSection
            svgInstanceId={instanceId}
            svgMediaInstance={svgInstanceMedia}
          />
        }
        downloadFunction={
          loadingState === "downloaded"
            ? () => {
                svgInstanceMedia.downloadSvg("svg", 256, 256, "Minified");
              }
            : undefined
        }
        filename={svgInstanceMedia.svgMedia.filename}
        mimeType={svgInstanceMedia.svgMedia.mimeType}
        fileSize={svgInstanceMedia.svgMedia.getFileSize()}
        tablePanelRef={tablePanelRef}
        positioning={positioning}
      />
    )
  );
}
