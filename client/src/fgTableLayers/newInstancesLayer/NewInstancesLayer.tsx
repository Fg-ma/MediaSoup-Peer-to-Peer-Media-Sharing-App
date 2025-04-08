import React, { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  Signals,
  useSignalContext,
} from "../../context/signalContext/SignalContext";
import { useSocketContext } from "../../context/socketContext/SocketContext";
import { StaticContentTypes } from "../../../../universal/contentTypeConstant";

type InstanceType = {
  contentType: StaticContentTypes;
  contentId: string;
  width: number;
  height: number;
  x: number;
  y: number;
};

export default function NewInstancesLayer({
  tableRef,
}: {
  tableRef: React.RefObject<HTMLDivElement>;
}) {
  const { tableStaticContentSocket } = useSocketContext();
  const { addSignalListener, removeSignalListener } = useSignalContext();

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hideInstances, setHideInstances] = useState(false);
  const newInstances = useRef<InstanceType[]>([]);
  const newInstanceLayerRef = useRef<HTMLDivElement>(null);

  const [_, setRerender] = useState(false);

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
              width: instance.width,
              height: instance.height,
              x: 0,
              y: 0,
            })),
          ];
          setRerender((prev) => !prev);
        }
        break;
      case "stopInstancesDrag":
        {
          const instancesToUpload = newInstances.current.reduce(
            (acc, instance) => {
              const existing = acc.find(
                (item) =>
                  item.contentType === instance.contentType &&
                  item.contentId === instance.contentId,
              );

              if (existing) {
                existing.instances.push({
                  positioning: {
                    position: {
                      left:
                        (instance.x /
                          (newInstanceLayerRef.current?.clientWidth ?? 1)) *
                        100,
                      top:
                        (instance.y /
                          (newInstanceLayerRef.current?.clientHeight ?? 1)) *
                        100,
                    },
                    scale: {
                      x: instance.width,
                      y: instance.height,
                    },
                    rotation: 0,
                  },
                });
              } else {
                acc.push({
                  contentType: instance.contentType,
                  contentId: instance.contentId,
                  instances: [
                    {
                      positioning: {
                        position: {
                          left:
                            (instance.x /
                              (newInstanceLayerRef.current?.clientWidth ?? 1)) *
                            100,
                          top:
                            (instance.y /
                              (newInstanceLayerRef.current?.clientHeight ??
                                1)) *
                            100,
                        },
                        scale: {
                          x: instance.width,
                          y: instance.height,
                        },
                        rotation: 0,
                      },
                    },
                  ],
                });
              }

              return acc;
            },
            [] as {
              contentType: StaticContentTypes;
              contentId: string;
              instances: {
                positioning: {
                  position: { left: number; top: number };
                  scale: { x: number; y: number };
                  rotation: number;
                };
              }[];
            }[],
          );

          tableStaticContentSocket.current?.createNewInstances(
            instancesToUpload.map((instance) => ({
              contentType: instance.contentType,
              contentId: instance.contentId,
              instances: instance.instances.map((inst) => ({
                instanceId: uuidv4(),
                positioning: inst.positioning,
              })),
            })),
          );

          newInstances.current = [];
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
        setHideInstances(true);
      } else {
        setHideInstances(false);
      }

      setMousePosition({
        x: Math.max(minX, Math.min(maxX, x)),
        y: Math.max(minY, Math.min(maxY, y)),
      });
    }
  };

  useEffect(() => {
    if (newInstances.current.length === 0) return;

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
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
      const widthPx = (containerRect.width * instance.width) / 100;
      const heightPx = (containerRect.height * instance.height) / 100;

      if (currentX + widthPx > containerRect.width) {
        currentX = gridLeft;
        gridBottom = currentRowTop - GAP;
        currentRowMaxHeight = 0;
        currentRowTop = gridBottom;
      }

      const boxY = gridBottom - heightPx;
      const boxX = currentX;

      newPositions.push({
        ...instance,
        x: Math.min(containerRect.width - widthPx, boxX),
        y: Math.max(0, boxY),
      });

      currentX += widthPx + GAP;

      currentRowMaxHeight = Math.max(currentRowMaxHeight, heightPx);
      currentRowTop = gridBottom - currentRowMaxHeight;
    });

    newInstances.current = newPositions;
    setRerender((prev) => !prev);
  };

  useEffect(() => {
    if (newInstances.current.length > 0) {
      placeInstances();
    }
  }, [mousePosition, newInstances.current.length]);

  return (
    <div
      ref={newInstanceLayerRef}
      className="pointer-events-none absolute left-0 top-0 z-[10000] h-full w-full bg-transparent"
    >
      {!hideInstances &&
        newInstances.current.map((instance) => (
          <div
            key={instance.contentId}
            className="absolute rounded border-4 border-dashed border-fg-red border-opacity-80 bg-fg-red-light bg-opacity-45"
            style={{
              width: `${instance.width}%`,
              height: `${instance.height}%`,
              left: `${instance.x}px`,
              top: `${instance.y}px`,
            }}
          ></div>
        ))}
    </div>
  );
}
