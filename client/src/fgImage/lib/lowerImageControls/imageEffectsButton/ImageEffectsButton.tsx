import React from "react";
import FgButton from "../../../../fgElements/fgButton/FgButton";
import FgSVG from "../../../../fgElements/fgSVG/FgSVG";
import FgHoverContentStandard from "../../../../fgElements/fgHoverContentStandard/FgHoverContentStandard";
import LowerImageController from "../LowerImageController";

const nginxAssetSeverBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const effectIcon = nginxAssetSeverBaseUrl + "svgs/effectIcon.svg";
const effectOffIcon = nginxAssetSeverBaseUrl + "svgs/effectOffIcon.svg";

export default function ImageEffectsButton({
  lowerImageController,
  imageEffectsActive,
  scrollingContainerRef,
}: {
  lowerImageController: LowerImageController;
  imageEffectsActive: boolean;
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
              { key: "width", value: "95%" },
              { key: "height", value: "95%" },
              { key: "fill", value: "white" },
              { key: "stroke", value: "white" },
            ]}
          />
        );
      }}
      hoverContent={
        !imageEffectsActive ? (
          <FgHoverContentStandard content='Effects (e)' style='dark' />
        ) : undefined
      }
      scrollingContainerRef={scrollingContainerRef}
      className='flex items-center justify-center w-10 min-w-10 aspect-square relative scale-x-[-1] pointer-events-auto'
    />
  );
}
