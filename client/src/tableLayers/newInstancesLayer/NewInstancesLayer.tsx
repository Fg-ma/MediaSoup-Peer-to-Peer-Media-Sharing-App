import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSignalContext } from "../../context/signalContext/SignalContext";
import { useSocketContext } from "../../context/socketContext/SocketContext";
import { useMediaContext } from "../../context/mediaContext/MediaContext";
import { StaticContentTypes } from "../../../../universal/contentTypeConstant";
import FgImageElement from "../../elements/fgImageElement/FgImageElement";
import NewInstancesLayerController from "./lib/NewInstancesLayerController";
import { InstanceLayerModes } from "./lib/typeConstant";
import FgSVGElement from "../../elements/fgSVGElement/FgSVGElement";
import TableImageMedia from "../../media/fgTableImage/TableImageMedia";
import TableSvgMedia from "../../media/fgTableSvg/TableSvgMedia";
import TableVideoMedia from "../../media/fgTableVideo/TableVideoMedia";
import TableApplicationMedia from "../../media/fgTableApplication/TableApplicationMedia";
import DownloadPaused from "../../elements/downloadPaused/DownloadPaused";
import DownloadFailed from "../../elements/downloadFailed/DownloadFailed";
import LoadingElement from "../../elements/loadingElement/LoadingElement";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const textIcon = nginxAssetServerBaseUrl + "svgs/textIcon.svg";

export type InstanceType = {
  contentType: StaticContentTypes;
  contentId: string;
  instances: {
    width: number;
    height: number;
    x: number;
    y: number;
  }[];
};

export default function NewInstancesLayer({
  tableRef,
}: {
  tableRef: React.RefObject<HTMLDivElement>;
}) {
  const { staticContentMedia } = useMediaContext();
  const { tableStaticContentSocket } = useSocketContext();
  const { addNewInstanceSignalListener, removeNewInstanceSignalListener } =
    useSignalContext();

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const hideInstances = useRef(false);
  const newInstances = useRef<InstanceType[]>([]);
  const newInstanceLayerRef = useRef<HTMLDivElement>(null);
  const mode = useRef<InstanceLayerModes>("standard");

  const [_, setRerender] = useState(false);

  const newInstancesLayerController = new NewInstancesLayerController(
    newInstanceLayerRef,
    tableRef,
    newInstances,
    hideInstances,
    mousePosition,
    setMousePosition,
    tableStaticContentSocket,
    setRerender,
    mode,
  );

  const instanceStructureKey = useMemo(() => {
    return JSON.stringify(
      newInstances.current.map((inst) => inst.instances.length),
    );
  }, [newInstances.current]);

  useEffect(() => {
    addNewInstanceSignalListener(newInstancesLayerController.handleSignals);

    return () => {
      removeNewInstanceSignalListener(
        newInstancesLayerController.handleSignals,
      );
    };
  }, []);

  useEffect(() => {
    if (newInstances.current.length === 0) return;

    document.addEventListener(
      "mousemove",
      newInstancesLayerController.handleMouseMove,
    );
    document.addEventListener(
      "wheel",
      newInstancesLayerController.handleScroll,
    );
    document.addEventListener(
      "keydown",
      newInstancesLayerController.handleKeyDown,
      { capture: true },
    );

    return () => {
      document.removeEventListener(
        "mousemove",
        newInstancesLayerController.handleMouseMove,
      );
      document.removeEventListener(
        "wheel",
        newInstancesLayerController.handleScroll,
      );
      document.removeEventListener(
        "keydown",
        newInstancesLayerController.handleKeyDown,
        { capture: true },
      );
    };
  }, [newInstances.current.length]);

  useEffect(() => {
    if (newInstances.current.length > 0) {
      newInstancesLayerController.placeInstances();
    }
  }, [mousePosition, instanceStructureKey]);

  useEffect(() => {
    if (mode.current === "paint") {
      document.addEventListener(
        "pointerdown",
        newInstancesLayerController.onStopInstancesDrag,
      );
    }

    return () => {
      if (mode.current === "paint") {
        document.removeEventListener(
          "pointerdown",
          newInstancesLayerController.onStopInstancesDrag,
        );
      }
    };
  }, [mode.current]);

  return (
    <div
      ref={newInstanceLayerRef}
      className={`${newInstances.current.length !== 0 ? "pointer-events-auto" : "pointer-events-none"} absolute left-0 top-0 z-new-instances-layer h-full w-full`}
    >
      {!hideInstances.current &&
        newInstances.current.map((instance) => {
          const media =
            staticContentMedia.current[instance.contentType].table[
              instance.contentId
            ];

          return (
            <React.Fragment key={instance.contentId}>
              {instance.instances.map((ins, i) => (
                <div
                  key={instance.contentId + "_" + i}
                  className="absolute rounded border-4 border-dashed border-fg-red border-opacity-80 bg-fg-red-light bg-opacity-45"
                  style={{
                    width: `${ins.width}%`,
                    height: `${ins.height}%`,
                    left: `${ins.x}px`,
                    top: `${ins.y}px`,
                  }}
                >
                  {(media instanceof TableImageMedia ||
                    media instanceof TableSvgMedia ||
                    media instanceof TableVideoMedia ||
                    media instanceof TableApplicationMedia) &&
                  media.loadingState === "downloaded" ? (
                    media instanceof TableVideoMedia ? (
                      <img
                        src={media.thumbnail.src}
                        alt={media.thumbnail.alt}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      media.blobURL && (
                        <FgImageElement
                          className="h-full w-full object-contain"
                          src={media.blobURL}
                          alt={media.filename}
                        />
                      )
                    )
                  ) : media.loadingState === "downloading" ? (
                    <LoadingElement className="h-full w-full rounded" />
                  ) : media.loadingState === "failed" ? (
                    <DownloadFailed className="h-full w-full rounded" />
                  ) : (
                    media.loadingState === "paused" && (
                      <DownloadPaused className="h-full w-full rounded" />
                    )
                  )}
                  {instance.contentType === "text" && (
                    <div className="flex aspect-square w-full flex-col items-center justify-center">
                      <div className="h-8 w-full truncate font-K2D text-xl text-fg-white">
                        {media.filename}
                      </div>
                      <FgSVGElement
                        className="mt-2 aspect-square fill-fg-white"
                        style={{ height: "calc(100% - 2.5rem)" }}
                        src={textIcon}
                        attributes={[
                          { key: "width", value: "100%" },
                          { key: "height", value: "100%" },
                        ]}
                      />
                    </div>
                  )}
                </div>
              ))}
            </React.Fragment>
          );
        })}
    </div>
  );
}
