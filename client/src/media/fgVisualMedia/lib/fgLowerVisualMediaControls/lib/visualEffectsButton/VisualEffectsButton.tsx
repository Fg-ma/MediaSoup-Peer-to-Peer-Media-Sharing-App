import React from "react";
import FgButton from "../../../../../../elements/fgButton/FgButton";
import FgSVG from "../../../../../../elements/fgSVG/FgSVG";
import FgHoverContentStandard from "../../../../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import FgLowerVisualMediaController from "../FgLowerVisualMediaController";

const nginxAssetSeverBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const effectIcon = nginxAssetSeverBaseUrl + "svgs/effectIcon.svg";
const effectOffIcon = nginxAssetSeverBaseUrl + "svgs/effectOffIcon.svg";

export default function VisualEffectsButton({
  fgLowerVisualMediaController,
  visualEffectsActive,
  settingsActive,
  scrollingContainerRef,
}: {
  fgLowerVisualMediaController: FgLowerVisualMediaController;
  visualEffectsActive: boolean;
  settingsActive: boolean;
  scrollingContainerRef: React.RefObject<HTMLDivElement>;
}) {
  return (
    <FgButton
      clickFunction={() => {
        fgLowerVisualMediaController.handleVisualEffects();
      }}
      contentFunction={() => {
        const iconSrc = visualEffectsActive ? effectOffIcon : effectIcon;

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
        !visualEffectsActive && !settingsActive ? (
          <FgHoverContentStandard content='Effects (e)' style='dark' />
        ) : undefined
      }
      scrollingContainerRef={scrollingContainerRef}
      className='flex items-center justify-center w-10 min-w-10 aspect-square relative scale-x-[-1] pointer-events-auto'
    />
  );
}
