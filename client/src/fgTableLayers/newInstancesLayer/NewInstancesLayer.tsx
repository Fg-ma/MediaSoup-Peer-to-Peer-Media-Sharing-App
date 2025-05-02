import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSignalContext } from "../../context/signalContext/SignalContext";
import { useSocketContext } from "../../context/socketContext/SocketContext";
import { useMediaContext } from "../../context/mediaContext/MediaContext";
import { StaticContentTypes } from "../../../../universal/contentTypeConstant";
import FgImageElement from "../../elements/fgImageElement/FgImageElement";
import NewInstancesLayerController from "./lib/NewInstancesLayerController";
import { InstanceLayerModes } from "./lib/typeConstant";

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
  const { userMedia } = useMediaContext();
  const { tableStaticContentSocket } = useSocketContext();
  const { addNewInstanceSignalListener, removeNewInstanceSignalListener } =
    useSignalContext();

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const hideInstances = useRef(false);
  const newInstances = useRef<InstanceType[]>([]);
  const newInstanceLayerRef = useRef<HTMLDivElement>(null);
  const mode = useRef<InstanceLayerModes>("standard");

  const [_, setRerender] = useState(false);

  const newInstancesLayerController = useRef(
    new NewInstancesLayerController(
      newInstanceLayerRef,
      tableRef,
      newInstances,
      hideInstances,
      mousePosition,
      setMousePosition,
      tableStaticContentSocket,
      setRerender,
      mode,
    ),
  );

  const instanceStructureKey = useMemo(() => {
    return JSON.stringify(
      newInstances.current.map((inst) => inst.instances.length),
    );
  }, [newInstances.current]);

  useEffect(() => {
    addNewInstanceSignalListener(
      newInstancesLayerController.current.handleSignals,
    );

    return () => {
      removeNewInstanceSignalListener(
        newInstancesLayerController.current.handleSignals,
      );
    };
  }, []);

  useEffect(() => {
    if (newInstances.current.length === 0) return;

    document.addEventListener(
      "mousemove",
      newInstancesLayerController.current.handleMouseMove,
    );
    document.addEventListener(
      "wheel",
      newInstancesLayerController.current.handleScroll,
    );
    document.addEventListener(
      "keydown",
      newInstancesLayerController.current.handleKeyDown,
      { capture: true },
    );

    return () => {
      document.removeEventListener(
        "mousemove",
        newInstancesLayerController.current.handleMouseMove,
      );
      document.removeEventListener(
        "wheel",
        newInstancesLayerController.current.handleScroll,
      );
      document.removeEventListener(
        "keydown",
        newInstancesLayerController.current.handleKeyDown,
        { capture: true },
      );
    };
  }, [newInstances.current.length]);

  useEffect(() => {
    if (newInstances.current.length > 0) {
      newInstancesLayerController.current.placeInstances();
    }
  }, [mousePosition, instanceStructureKey]);

  useEffect(() => {
    if (mode.current === "paint") {
      document.addEventListener(
        "pointerdown",
        newInstancesLayerController.current.onStopInstancesDrag,
      );
    }

    return () => {
      if (mode.current === "paint") {
        document.removeEventListener(
          "pointerdown",
          newInstancesLayerController.current.onStopInstancesDrag,
        );
      }
    };
  }, [mode.current]);

  return (
    <div
      ref={newInstanceLayerRef}
      className="pointer-events-none absolute left-0 top-0 z-new-instances-layer h-full w-full bg-transparent"
    >
      {!hideInstances.current &&
        newInstances.current.map((instance) => {
          let imgSrc: string | null = null;
          let alt: string = "";

          if (
            instance.contentType !== "text" &&
            instance.contentType !== "soundClip"
          ) {
            const media =
              userMedia.current[instance.contentType].table[instance.contentId];

            if (media?.blobURL) {
              imgSrc = media.blobURL;
              alt = media.filename;
            }
          }

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
                  {imgSrc && (
                    <FgImageElement
                      className="h-full w-full object-contain"
                      src={imgSrc}
                      alt={alt}
                    />
                  )}
                </div>
              ))}
            </React.Fragment>
          );
        })}
    </div>
  );
}
