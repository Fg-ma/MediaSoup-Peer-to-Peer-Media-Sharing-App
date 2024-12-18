import React, { useEffect, useRef } from "react";
import FgImage from "../../../../fgImage/FgImage";
import "./gamePlayerIcon.css";

import placeHolderImage_1280x1262 from "../../../../../../public/backgroundImages/space/apollo_1280x1262.png";
import placeHolderImage_64x63 from "../../../../../../public/backgroundImages/space/apollo_64x63.png";

export default function GamePlayerIcon({
  primaryColor = "red",
  secondaryColor = "blue",
  shadowColor = { r: 0, g: 0, b: 0 },
}: {
  primaryColor?: string;
  secondaryColor?: string;
  shadowColor?: { r: number; g: number; b: number };
}) {
  const gamePlayerIcon = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gamePlayerIcon.current?.setAttribute("--primary-color", primaryColor);
    gamePlayerIcon.current?.setAttribute("--secondary-color", secondaryColor);
  }, [primaryColor, secondaryColor]);

  return (
    <div
      className='game-player-icon relative w-full aspect-square rounded-full overflow-hidden'
      style={{
        boxShadow: `0px 3px 5px rgba(${shadowColor.r}, ${shadowColor.g}, ${shadowColor.b}, 0.6)`,
      }}
    >
      <div className='game-player-icon-border'></div>
      <FgImage
        src={placeHolderImage_1280x1262}
        srcLoading={placeHolderImage_64x63}
        style={{ width: "100%", height: "100%", userSelect: "none" }}
      />
    </div>
  );
}
