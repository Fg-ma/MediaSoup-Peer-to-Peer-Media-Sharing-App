import React, { useEffect, useRef, useState } from "react";
import { useSignalContext } from "../../context/signalContext/SignalContext";
import { useSocketContext } from "../../context/socketContext/SocketContext";
import FgImageElement from "../../elements/fgImageElement/FgImageElement";
import PlaceLittleBuddyLayerController from "./lib/PlaceLittleBuddyLayerController";
import { LittleBuddyInstanceType } from "../../elements/littleBuddyPortal/LittleBuddyPortal";
import { spirteSheetsMeta } from "../../tableBabylon/littleBuddies/lib/typeConstant";

export default function PlaceLittleBuddyLayer({
  tableRef,
}: {
  tableRef: React.RefObject<HTMLDivElement>;
}) {
  const { tableStaticContentSocket } = useSocketContext();
  const {
    addPlaceLittleBuddySignalListener,
    removePlaceLittleBuddySignalListener,
  } = useSignalContext();

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const hideInstances = useRef(false);
  const newLittleBuddy = useRef<LittleBuddyInstanceType | undefined>();
  const newInstanceLayerRef = useRef<HTMLDivElement>(null);

  const [_, setRerender] = useState(false);

  const placeLittleBuddyLayerController = new PlaceLittleBuddyLayerController(
    newInstanceLayerRef,
    tableRef,
    newLittleBuddy,
    hideInstances,
    mousePosition,
    setMousePosition,
    tableStaticContentSocket,
    setRerender,
  );

  useEffect(() => {
    addPlaceLittleBuddySignalListener(
      placeLittleBuddyLayerController.handleSignals,
    );

    return () => {
      removePlaceLittleBuddySignalListener(
        placeLittleBuddyLayerController.handleSignals,
      );
    };
  }, []);

  useEffect(() => {
    if (!newLittleBuddy.current) return;

    document.addEventListener(
      "mousemove",
      placeLittleBuddyLayerController.handleMouseMove,
    );

    return () => {
      document.removeEventListener(
        "mousemove",
        placeLittleBuddyLayerController.handleMouseMove,
      );
    };
  }, [newLittleBuddy.current]);

  useEffect(() => {
    if (newLittleBuddy.current) {
      placeLittleBuddyLayerController.placeInstances();
    }
  }, [mousePosition]);

  return (
    <div
      ref={newInstanceLayerRef}
      className={`${newLittleBuddy.current ? "pointer-events-auto" : "pointer-events-none"} absolute left-0 top-0 z-new-instances-layer h-full w-full`}
    >
      {!hideInstances.current &&
        newLittleBuddy.current &&
        (() => {
          const meta = spirteSheetsMeta[newLittleBuddy.current.littleBuddy];

          return (
            <div
              className="absolute rounded border-4 border-dashed border-fg-red border-opacity-80 bg-fg-red-light bg-opacity-45"
              style={{
                width: `${newLittleBuddy.current.width}%`,
                height: `${newLittleBuddy.current.height}%`,
                left: `${newLittleBuddy.current.x}px`,
                top: `${newLittleBuddy.current.y}px`,
              }}
            >
              <FgImageElement
                className="h-full w-full object-contain"
                src={meta.iconUrl}
                alt={meta.title}
              />
            </div>
          );
        })()}
    </div>
  );
}
