import React, { useState } from "react";
import FgImageElement from "../../../../fgImageElement/FgImageElement";
import "./gamePlayerIcon.css";

const nginxAssetSeverBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const placeHolderImage_1280x1262 =
  nginxAssetSeverBaseUrl + "backgroundImages/space/apollo_1280x1262.png";
const placeHolderImage_64x63 =
  nginxAssetSeverBaseUrl + "backgroundImages/space/apollo_64x63.png";

export default function GamePlayerIcon({
  primaryColor,
  secondaryColor,
  shadowColor = { r: 0, g: 0, b: 0 },
}: {
  primaryColor?: string;
  secondaryColor?: string;
  shadowColor?: { r: number; g: number; b: number };
}) {
  const [hover, setHover] = useState(false);

  return (
    <div
      className='game-player-icon relative w-full aspect-square rounded-full overflow-hidden'
      style={{
        boxShadow: `0px 3px 5px rgba(${shadowColor.r}, ${shadowColor.g}, ${shadowColor.b}, 0.6)`,
      }}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
    >
      <div
        className='game-player-icon-border absolute inset-0'
        style={{
          background: primaryColor
            ? secondaryColor
              ? hover
                ? `linear-gradient(
            105deg,
            ${primaryColor} 42.5%,
            ${secondaryColor} 57.5%
          )`
                : `linear-gradient(
            90deg,
            ${primaryColor} 42.5%,
            ${secondaryColor} 57.5%
          )`
              : primaryColor
            : "rgb(230 230 230)",
          transition: "background 0.5s linear",
        }}
      ></div>
      <FgImageElement
        src={placeHolderImage_1280x1262}
        srcLoading={placeHolderImage_64x63}
        style={{ width: "100%", height: "100%", userSelect: "none" }}
      />
    </div>
  );
}
