import React, { useEffect, useRef, useState } from "react";
import { useMediaContext } from "../../../../../../../context/mediaContext/MediaContext";
import GeneralMediaSelection from "../GeneralMediaSelection";
import SvgEffectsSection from "./lib/SvgEffectsSection";
import { SvgInstanceListenerTypes } from "../../../../../../../media/fgTableSvg/TableSvgMediaInstance";
import { LoadingStateTypes } from "../../../../../../../../../universal/contentTypeConstant";
import LoadingElement from "../../../../../../../elements/loadingElement/LoadingElement";
import DownloadFailed from "../../../../../../../elements/downloadFailed/DownloadFailed";
import DownloadPaused from "../../../../../../../elements/downloadPaused/DownloadPaused";
import SvgSelectionController from "./lib/SvgSelectionController";

export default function SvgSelection({
  contentId,
  tablePanelRef,
}: {
  contentId: string;
  tablePanelRef: React.RefObject<HTMLDivElement>;
}) {
  const { userMedia } = useMediaContext();
  const svgInstanceMedia = userMedia.current.svg.tableInstances[contentId];
  const positioning = svgInstanceMedia?.getPositioning();

  const [largestDim, setLargestDim] = useState<"width" | "height">("width");
  const [loadingState, setLoadingState] = useState<LoadingStateTypes>(
    svgInstanceMedia?.svgMedia.loadingState,
  );
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const svgMirror = useRef<SVGSVGElement | undefined>(undefined);

  const svgSelectionController = new SvgSelectionController(
    svgInstanceMedia,
    svgMirror,
    svgContainerRef,
    setLoadingState,
  );

  useEffect(() => {
    if (svgInstanceMedia?.instanceSvg) {
      svgMirror.current = svgInstanceMedia.instanceSvg.cloneNode(
        true,
      ) as SVGSVGElement;
      if ((svgInstanceMedia.svgMedia.aspect ?? 0) > 1) {
        svgMirror.current.setAttribute("width", "100%");
        svgMirror.current.setAttribute("maxWidth", "12rem");
        setLargestDim("width");
      } else {
        svgMirror.current.setAttribute("height", "100%");
        svgMirror.current.setAttribute("maxHeight", "12rem");
        setLargestDim("height");
      }
      svgContainerRef.current?.appendChild(svgMirror.current);
    }

    svgInstanceMedia?.addSvgInstanceListener(
      svgSelectionController.handleInstanceEvents,
    );
    svgInstanceMedia?.svgMedia.addSvgListener(
      svgSelectionController.handleSvgMessages,
    );

    return () => {
      svgInstanceMedia?.removeSvgInstanceListener(
        svgSelectionController.handleInstanceEvents,
      );
      svgInstanceMedia.svgMedia.removeSvgListener(
        svgSelectionController.handleSvgMessages,
      );
    };
  }, []);

  return (
    svgInstanceMedia && (
      <GeneralMediaSelection
        contentId={contentId}
        contentType="svg"
        selectionContent={
          loadingState === "downloaded" ? (
            <div
              ref={svgContainerRef}
              className={`${largestDim === "width" ? "w-full max-w-[12rem]" : "h-full max-h-[12rem]"} !w-auto overflow-hidden rounded-md object-contain`}
            ></div>
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
            svgInstanceId={contentId}
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
