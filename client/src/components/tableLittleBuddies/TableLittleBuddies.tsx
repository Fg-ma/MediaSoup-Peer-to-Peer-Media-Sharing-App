import React, { useEffect, useRef } from "react";
import SpriteSheet from "./lib/SpriteSheet";
import {
  LittleBuddiesTypes,
  spirteSheetsMeta,
  SpriteType,
} from "./lib/typeConstant";
import TableLittleBuddiesController from "./lib/TableLittleBuddiesController";

export default function TableLittleBuddies({
  littleBuddy = "whiteDemon",
}: {
  littleBuddy: LittleBuddiesTypes;
}) {
  const tableLittleBuddiesContainer = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const lastTimeRef = useRef(0);

  const spriteSheet = useRef<SpriteSheet | null>(null);
  const sprite = useRef<SpriteType | null>(null);

  const tableLittleBuddiesController = useRef(
    new TableLittleBuddiesController(
      littleBuddy,
      tableLittleBuddiesContainer,
      canvasRef,
      spriteSheet,
      lastTimeRef,
      sprite,
    ),
  );

  useEffect(() => {
    tableLittleBuddiesController.current.init();

    window.addEventListener(
      "keydown",
      tableLittleBuddiesController.current.handleKeyDown,
    );
    window.addEventListener(
      "keyup",
      tableLittleBuddiesController.current.handleKeyUp,
    );

    return () => {
      window.removeEventListener(
        "keydown",
        tableLittleBuddiesController.current.handleKeyDown,
      );
      window.removeEventListener(
        "keyup",
        tableLittleBuddiesController.current.handleKeyUp,
      );
    };
  }, []);

  return (
    <div
      ref={tableLittleBuddiesContainer}
      className="flex absolute left-0 top-0 z-popup-labels h-full w-full bg-fg-white"
    >
      <canvas
        className="absolute"
        ref={canvasRef}
        width={spirteSheetsMeta[littleBuddy].frameWidth}
        height={spirteSheetsMeta[littleBuddy].frameHeight}
      />
    </div>
  );
}
