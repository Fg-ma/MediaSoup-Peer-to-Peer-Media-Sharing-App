import React, { useEffect, useRef, useState } from "react";
import {
  Signals,
  useSignalContext,
} from "../../context/signalContext/SignalContext";

type InstanceType = {
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
  const { addSignalListener, removeSignalListener } = useSignalContext();

  const [newInstances, setNewInstances] = useState<InstanceType[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hideInstances, setHideInstances] = useState(false);
  const newInstanceLayerRef = useRef<HTMLDivElement>(null);

  const handleSignals = (event: Signals) => {
    if (!event) return;

    switch (event.type) {
      case "startInstancesDrag":
        {
          const { instances } = event.data;

          setNewInstances((prev) => [
            ...prev,
            ...instances.map((instance) => ({
              contentId: instance.contentId,
              width: instance.width,
              height: instance.height,
              x: 0,
              y: 0,
            })),
          ]);
        }
        break;
      case "stopInstancesDrag":
        {
          const { contentIds } = event.data;

          setNewInstances((prev) =>
            prev.filter((instance) => !contentIds.includes(instance.contentId)),
          );
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
    if (newInstances.length === 0) return;

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [newInstances.length]);

  const placeInstances = () => {
    if (!newInstanceLayerRef.current) return;
    const containerRect = newInstanceLayerRef.current.getBoundingClientRect();
    const instances = [...newInstances];
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

    setNewInstances(newPositions);
  };

  useEffect(() => {
    if (newInstances.length > 0) {
      placeInstances();
    }
  }, [mousePosition, newInstances.length]);

  return (
    <div
      ref={newInstanceLayerRef}
      className="pointer-events-none absolute left-0 top-0 z-[10000] h-full w-full bg-transparent"
    >
      {!hideInstances &&
        newInstances.map((instance) => (
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
