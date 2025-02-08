import React from "react";
import FgButton from "../../../../../fgElements/fgButton/FgButton";
import FgSVG from "../../../../../fgElements/fgSVG/FgSVG";
import FgHoverContentStandard from "../../../../../fgElements/fgHoverContentStandard/FgHoverContentStandard";
import FgLowerVideoController from "../LowerVideoController";

const nginxAssetSeverBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const effectIcon = nginxAssetSeverBaseUrl + "svgs/effectIcon.svg";
const effectOffIcon = nginxAssetSeverBaseUrl + "svgs/effectOffIcon.svg";

export default function VideoEffectsButton({
  fgLowerVideoController,
  videoEffectsActive,
  settingsActive,
  scrollingContainerRef,
}: {
  fgLowerVideoController: FgLowerVideoController;
  videoEffectsActive: boolean;
  settingsActive: boolean;
  scrollingContainerRef: React.RefObject<HTMLDivElement>;
}) {
  return (
    <FgButton
      clickFunction={() => {
        fgLowerVideoController.handleVideoEffects();
      }}
      contentFunction={() => {
        const iconSrc = videoEffectsActive ? effectOffIcon : effectIcon;

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
        !videoEffectsActive && !settingsActive ? (
          <FgHoverContentStandard content='Effects (e)' style='dark' />
        ) : undefined
      }
      scrollingContainerRef={scrollingContainerRef}
      className='flex items-center justify-center w-10 min-w-10 aspect-square relative scale-x-[-1] pointer-events-auto'
    />
  );
}
