import React, { useEffect, useRef, useState } from "react";
import { useMediaContext } from "../../../../../../../context/mediaContext/MediaContext";
import FgSVGElement from "../../../../../../../elements/fgSVGElement/FgSVGElement";
import GeneralMediaSelection from "../GeneralMediaSelection";
import SvgEffectsSection from "./lib/SvgEffectsSection";
import { SvgInstanceListenerTypes } from "src/media/fgTableSvg/TableSvgMediaInstance";

export default function SvgSelection({
  contentId,
  tablePanelRef,
}: {
  contentId: string;
  tablePanelRef: React.RefObject<HTMLDivElement>;
}) {
  const { userMedia } = useMediaContext();

  const [largestDim, setLargestDim] = useState<"width" | "height">("width");
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const svgMirror = useRef<SVGSVGElement | undefined>(undefined);

  const svgInstanceMedia = userMedia.current.svg.tableInstances[contentId];
  const positioning = svgInstanceMedia?.getPositioning();

  const handleInstanceEvents = (event: SvgInstanceListenerTypes) => {
    if (event.type === "effectsChanged") {
      if (svgMirror.current && svgMirror.current.parentElement) {
        svgMirror.current.parentElement.removeChild(svgMirror.current);
      }

      if (svgInstanceMedia.instanceSvg) {
        svgMirror.current = svgInstanceMedia.instanceSvg.cloneNode(
          true,
        ) as SVGSVGElement;
        svgMirror.current.setAttribute("height", "100%");
        svgMirror.current.setAttribute("width", "auto");
        svgMirror.current.setAttribute("maxHeight", "12rem");
        svgContainerRef.current?.appendChild(svgMirror.current);
      }
    }
  };

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

    svgInstanceMedia?.addSvgInstanceListener(handleInstanceEvents);

    return () => {
      svgInstanceMedia?.removeSvgInstanceListener(handleInstanceEvents);
    };
  }, []);

  return (
    svgInstanceMedia && (
      <GeneralMediaSelection
        contentId={contentId}
        contentType="svg"
        selectionContent={
          <div
            ref={svgContainerRef}
            className={`${largestDim === "width" ? "w-full max-w-[12rem]" : "h-full max-h-[12rem]"} !w-auto overflow-hidden rounded-md object-contain`}
          ></div>
        }
        effectsSection={
          <SvgEffectsSection
            svgInstanceId={contentId}
            svgMediaInstance={svgInstanceMedia}
          />
        }
        downloadFunction={() => {
          svgInstanceMedia.downloadSvg("svg", 256, 256, "Minified");
        }}
        filename={svgInstanceMedia.svgMedia.filename}
        mimeType={svgInstanceMedia.svgMedia.mimeType}
        fileSize={svgInstanceMedia.svgMedia.getFileSize()}
        tablePanelRef={tablePanelRef}
        positioning={positioning}
      />
    )
  );
}
