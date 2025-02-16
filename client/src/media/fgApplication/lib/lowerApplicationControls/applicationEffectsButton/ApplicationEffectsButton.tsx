import React from "react";
import FgButton from "../../../../../elements/fgButton/FgButton";
import FgSVG from "../../../../../elements/fgSVG/FgSVG";
import FgHoverContentStandard from "../../../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import LowerApplicationController from "../LowerApplicationController";

const nginxAssetSeverBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const effectIcon = nginxAssetSeverBaseUrl + "svgs/effectIcon.svg";
const effectOffIcon = nginxAssetSeverBaseUrl + "svgs/effectOffIcon.svg";

export default function ApplicationEffectsButton({
  lowerApplicationController,
  applicationEffectsActive,
  scrollingContainerRef,
}: {
  lowerApplicationController: LowerApplicationController;
  applicationEffectsActive: boolean;
  scrollingContainerRef: React.RefObject<HTMLDivElement>;
}) {
  return (
    <FgButton
      clickFunction={() => {
        lowerApplicationController.handleApplicationEffects();
      }}
      contentFunction={() => {
        const iconSrc = applicationEffectsActive ? effectOffIcon : effectIcon;

        return (
          <FgSVG
            src={iconSrc}
            attributes={[
              { key: "width", value: "100%" },
              { key: "height", value: "100%" },
              { key: "fill", value: "white" },
              { key: "stroke", value: "white" },
            ]}
          />
        );
      }}
      hoverContent={
        !applicationEffectsActive ? (
          <FgHoverContentStandard content='Effects (e)' style='dark' />
        ) : undefined
      }
      scrollingContainerRef={scrollingContainerRef}
      className='flex items-center justify-center h-full aspect-square relative scale-x-[-1] pointer-events-auto'
    />
  );
}
