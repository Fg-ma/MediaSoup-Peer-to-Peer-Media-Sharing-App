import React from "react";
import FgButton from "../../../../../elements/fgButton/FgButton";
import FgSVGElement from "../../../../../elements/fgSVGElement/FgSVGElement";
import FgHoverContentStandard from "../../../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import LowerSvgController from "../LowerSvgController";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const effectIcon = nginxAssetServerBaseUrl + "svgs/effectIcon.svg";
const effectOffIcon = nginxAssetServerBaseUrl + "svgs/effectOffIcon.svg";

export default function SvgEffectsButton({
  lowerSvgController,
  svgEffectsActive,
  settingsActive,
  scrollingContainerRef,
}: {
  lowerSvgController: LowerSvgController;
  svgEffectsActive: boolean;
  settingsActive: boolean;
  scrollingContainerRef: React.RefObject<HTMLDivElement>;
}) {
  return (
    <FgButton
      clickFunction={() => {
        lowerSvgController.handleSvgEffects();
      }}
      contentFunction={() => (
        <FgSVGElement
          src={svgEffectsActive ? effectOffIcon : effectIcon}
          attributes={[
            { key: "width", value: "100%" },
            { key: "height", value: "100%" },
            { key: "fill", value: "#f2f2f2" },
            { key: "stroke", value: "#f2f2f2" },
          ]}
        />
      )}
      hoverContent={
        !svgEffectsActive && !settingsActive ? (
          <FgHoverContentStandard content='Effects (e)' style='light' />
        ) : undefined
      }
      scrollingContainerRef={scrollingContainerRef}
      className='flex items-center justify-center h-full aspect-square relative scale-x-[-1] pointer-events-auto'
    />
  );
}
