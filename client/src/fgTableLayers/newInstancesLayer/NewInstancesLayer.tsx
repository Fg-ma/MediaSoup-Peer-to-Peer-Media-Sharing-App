import React, { useEffect, useMemo, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  Signals,
  useSignalContext,
} from "../../context/signalContext/SignalContext";
import { useSocketContext } from "../../context/socketContext/SocketContext";
import { useMediaContext } from "../../context/mediaContext/MediaContext";
import { StaticContentTypes } from "../../../../universal/contentTypeConstant";
import FgImageElement from "../../elements/fgImageElement/FgImageElement";

type InstanceType = {
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
  const { addSignalListener, removeSignalListener } = useSignalContext();

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const hideInstances = useRef(false);
  const newInstances = useRef<InstanceType[]>([]);
  const newInstanceLayerRef = useRef<HTMLDivElement>(null);

  const [_, setRerender] = useState(false);

  const instanceStructureKey = useMemo(() => {
    return JSON.stringify(
      newInstances.current.map((inst) => inst.instances.length),
    );
  }, [newInstances.current]);

  const handleSignals = (event: Signals) => {
    if (!event) return;

    switch (event.type) {
      case "startInstancesDrag":
        {
          const { instances } = event.data;

          newInstances.current = [
            ...newInstances.current,
            ...instances.map((instance) => ({
              contentType: instance.contentType,
              contentId: instance.contentId,
              instances: [
                ...instance.instances.map((ins) => ({
                  width: ins.width,
                  height: ins.height,
                  x: 0,
                  y: 0,
                })),
              ],
            })),
          ];
          setRerender((prev) => !prev);
        }
        break;
      case "stopInstancesDrag":
        {
          if (hideInstances.current) {
            newInstances.current = [];
            hideInstances.current = false;
            setRerender((prev) => !prev);
            return;
          }

          const instancesToUpload = newInstances.current.map((instance) => ({
            contentType: instance.contentType,
            contentId: instance.contentId,
            instances: instance.instances.map((ins) => ({
              instanceId: uuidv4(),
              positioning: {
                position: {
                  left:
                    (ins.x / (newInstanceLayerRef.current?.clientWidth ?? 1)) *
                    100,
                  top:
                    (ins.y / (newInstanceLayerRef.current?.clientHeight ?? 1)) *
                    100,
                },
                scale: {
                  x: ins.width,
                  y: ins.height,
                },
                rotation: 0,
              },
            })),
          }));

          tableStaticContentSocket.current?.createNewInstances(
            instancesToUpload,
          );

          newInstances.current = [];
          hideInstances.current = false;
          setRerender((prev) => !prev);
        }
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    addSignalListener(handleSignals);

    return () => {
      removeSignalListener(handleSignals);
    };
  }, []);

  const handleMouseMove = (event: MouseEvent) => {
    let minX = 0,
      maxX = 0,
      minY = 0,
      maxY = 0;

    if (newInstanceLayerRef.current && tableRef.current) {
      const box = newInstanceLayerRef.current.getBoundingClientRect();
      const cutoffBox = tableRef.current.getBoundingClientRect();
      minX = 0;
      minY = 0;
      maxX = box.width;
      maxY = box.height;

      const x = event.clientX - box.left;
      const y = event.clientY - box.top;

      if (
        event.clientY > cutoffBox.top + cutoffBox.height ||
        event.clientY < cutoffBox.top ||
        event.clientX > cutoffBox.left + cutoffBox.width ||
        event.clientX < cutoffBox.left
      ) {
        hideInstances.current = true;
      } else {
        hideInstances.current = false;
      }

      setMousePosition({
        x: Math.max(minX, Math.min(maxX, x)),
        y: Math.max(minY, Math.min(maxY, y)),
      });
    }
  };

  const handleScroll = (event: WheelEvent) => {
    if (event.shiftKey) {
      const delta = event.deltaY;

      if (delta < 0) {
        newInstances.current = newInstances.current.map((instance) => ({
          ...instance,
          instances:
            instance.instances.length < 10
              ? [
                  ...instance.instances,
                  {
                    width: instance.instances[0].width,
                    height: instance.instances[0].height,
                    x: 0,
                    y: 0,
                  },
                ]
              : instance.instances,
        }));
      } else {
        newInstances.current = newInstances.current.map((instance) => ({
          ...instance,
          instances:
            instance.instances.length >= 2
              ? instance.instances.slice(0, -1)
              : instance.instances,
        }));
      }

      setRerender((prev) => !prev);
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.shiftKey) {
      switch (event.key.toLowerCase()) {
        case "x":
          newInstances.current = newInstances.current.map((instance) => ({
            ...instance,
            instances:
              instance.instances.length > 1
                ? [
                    {
                      width: instance.instances[0].width,
                      height: instance.instances[0].height,
                      x: 0,
                      y: 0,
                    },
                  ]
                : instance.instances,
          }));
          setRerender((prev) => !prev);
          break;
        case "m":
          newInstances.current = newInstances.current.map((instance) => {
            const diff = 10 - instance.instances.length;

            return {
              ...instance,
              instances:
                diff > 0
                  ? [
                      ...instance.instances,
                      ...Array.from({ length: diff }).map(() => ({
                        width: instance.instances[0].width,
                        height: instance.instances[0].height,
                        x: 0,
                        y: 0,
                      })),
                    ]
                  : instance.instances,
            };
          });
          setRerender((prev) => !prev);
          break;
        default:
          break;
      }
    }
  };

  useEffect(() => {
    if (newInstances.current.length === 0) return;

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("wheel", handleScroll);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("wheel", handleScroll);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [newInstances.current.length]);

  const placeInstances = () => {
    if (!newInstanceLayerRef.current) return;
    const containerRect = newInstanceLayerRef.current.getBoundingClientRect();
    const instances = [...newInstances.current];
    const GAP = 4;

    const gridLeft = mousePosition.x;
    let gridBottom = mousePosition.y;

    let currentX = gridLeft;
    let currentRowMaxHeight = 0;
    let currentRowTop = gridBottom;

    const newPositions: InstanceType[] = [];

    instances.forEach((instance) => {
      const newIns: { width: number; height: number; x: number; y: number }[] =
        [];

      instance.instances.forEach((ins) => {
        const widthPx = (containerRect.width * ins.width) / 100;
        const heightPx = (containerRect.height * ins.height) / 100;

        if (currentX + widthPx > containerRect.width) {
          currentX = gridLeft;
          gridBottom = currentRowTop - GAP;
          currentRowMaxHeight = 0;
          currentRowTop = gridBottom;
        }

        const boxY = gridBottom - heightPx;
        const boxX = currentX;

        newIns.push({
          ...ins,
          x: Math.min(containerRect.width - widthPx, boxX),
          y: Math.max(0, boxY),
        });

        currentX += widthPx + GAP;

        currentRowMaxHeight = Math.max(currentRowMaxHeight, heightPx);
        currentRowTop = gridBottom - currentRowMaxHeight;
      });

      newPositions.push({
        ...instance,
        instances: newIns,
      });
    });

    newInstances.current = newPositions;
    setRerender((prev) => !prev);
  };

  useEffect(() => {
    if (newInstances.current.length > 0) {
      placeInstances();
    }
  }, [mousePosition, instanceStructureKey]);

  return (
    <div
      ref={newInstanceLayerRef}
      className="pointer-events-none absolute left-0 top-0 z-[10000] h-full w-full bg-transparent"
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
              userMedia.current[instance.contentType].all[instance.contentId];

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
