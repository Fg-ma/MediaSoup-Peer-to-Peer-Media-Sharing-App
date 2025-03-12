import React from "react";
import FgButton from "../../../../../elements/fgButton/FgButton";
import FgSVG from "../../../../../elements/fgSVG/FgSVG";
import FgHoverContentStandard from "../../../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import LowerImageController from "../LowerImageController";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const effectIcon = nginxAssetServerBaseUrl + "svgs/effectIcon.svg";
const effectOffIcon = nginxAssetServerBaseUrl + "svgs/effectOffIcon.svg";

export default function ImageEffectsButton({
  lowerImageController,
  imageEffectsActive,
  settingsActive,
  scrollingContainerRef,
}: {
  lowerImageController: LowerImageController;
  imageEffectsActive: boolean;
  settingsActive: boolean;
  scrollingContainerRef: React.RefObject<HTMLDivElement>;
}) {
  return (
    <FgButton
      clickFunction={() => {
        lowerImageController.handleImageEffects();
      }}
      contentFunction={() => {
        const iconSrc = imageEffectsActive ? effectOffIcon : effectIcon;

        return (
          <FgSVG
            src={iconSrc}
            attributes={[
              { key: "width", value: "100%" },
              { key: "height", value: "100%" },
              { key: "fill", value: "#f2f2f2" },
              { key: "stroke", value: "#f2f2f2" },
            ]}
          />
        );
      }}
      hoverContent={
        !imageEffectsActive && !settingsActive ? (
          <FgHoverContentStandard content='Effects (e)' style='dark' />
        ) : undefined
      }
      scrollingContainerRef={scrollingContainerRef}
      className='flex items-center justify-center h-full aspect-square relative scale-x-[-1] pointer-events-auto'
    />
  );
}
