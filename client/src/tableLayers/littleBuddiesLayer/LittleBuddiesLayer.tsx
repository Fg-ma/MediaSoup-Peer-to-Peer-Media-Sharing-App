// import React, { useEffect, useRef, useState } from "react";
// import { useTableContext } from "../../context/tableContext/TableContext";
// import SpriteSheet from "./lib/SpriteSheet";
// import {
//   LittleBuddiesTypes,
//   spirteSheetsMeta,
//   SpriteType,
// } from "./lib/typeConstant";
// import LittleBuddiesController from "./lib/LittleBuddiesController";

// export default function LittleBuddiesLayer({
//   littleBuddy = "wasp",
// }: {
//   littleBuddy?: LittleBuddiesTypes;
// }) {
//   const { tableBabylonCanvasRef, tableBabylonScene } = useTableContext();
//   const littleBuddiesContainer = useRef<HTMLDivElement>(null);
//   const canvasRef = useRef<HTMLCanvasElement | null>(null);

//   const lastTimeRef = useRef(0);

//   const spriteSheet = useRef<SpriteSheet | null>(null);
//   const sprite = useRef<SpriteType | null>(null);

//   const littleBuddiesController = useRef(
//     new LittleBuddiesController(
//       littleBuddy,
//       littleBuddiesContainer,
//       canvasRef,
//       spriteSheet,
//       lastTimeRef,
//       sprite,
//     ),
//   );

//   const [_, setRerender] = useState(false);

//   useEffect(() => {
//     littleBuddiesController.current.init();

//     window.addEventListener(
//       "keydown",
//       littleBuddiesController.current.handleKeyDown,
//     );
//     window.addEventListener(
//       "keyup",
//       littleBuddiesController.current.handleKeyUp,
//     );

//     return () => {
//       window.removeEventListener(
//         "keydown",
//         littleBuddiesController.current.handleKeyDown,
//       );
//       window.removeEventListener(
//         "keyup",
//         littleBuddiesController.current.handleKeyUp,
//       );
//     };
//   }, []);

//   return (
//     <div
//       ref={littleBuddiesContainer}
//       className="pointer-events-none absolute left-0 top-0 z-little-buddies-layer h-full w-full bg-transparent"
//     >
//       <canvas
//         className={`${sprite.current?.active ? "border border-fg-red" : ""} pointer-events-auto absolute`}
//         ref={canvasRef}
//         width={spirteSheetsMeta[littleBuddy].frameWidth}
//         height={spirteSheetsMeta[littleBuddy].frameHeight}
//         onClick={() => {
//           if (sprite.current) {
//             sprite.current.active = !sprite.current.active;
//             setRerender((prev) => !prev);
//           }
//         }}
//       />
//     </div>
//   );
// }

import React, { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { useTableContext } from "../../context/tableContext/TableContext";
import { useUserInfoContext } from "../../context/userInfoContext/UserInfoContext";
import { LittleBuddiesTypes } from "./lib/typeConstant";

export default function LittleBuddiesLayer({
  littleBuddy = "wasp",
}: {
  littleBuddy?: LittleBuddiesTypes;
}) {
  const { tableBabylonScene } = useTableContext();
  const { userId } = useUserInfoContext();

  useEffect(() => {
    tableBabylonScene.current?.tableLittleBuddies.createLittleBuddy(
      userId.current,
      uuidv4(),
      littleBuddy,
    );
  }, []);

  return <></>;
}
