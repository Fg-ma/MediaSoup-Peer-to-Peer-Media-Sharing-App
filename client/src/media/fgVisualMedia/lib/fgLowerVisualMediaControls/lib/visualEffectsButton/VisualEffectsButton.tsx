import React from "react";
import FgButton from "../../../../../../elements/fgButton/FgButton";
import FgSVGElement from "../../../../../../elements/fgSVGElement/FgSVGElement";
import FgHoverContentStandard from "../../../../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import FgLowerVisualMediaController from "../FgLowerVisualMediaController";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const effectIcon = nginxAssetServerBaseUrl + "svgs/effectIcon.svg";
const effectOffIcon = nginxAssetServerBaseUrl + "svgs/effectOffIcon.svg";

export default function VisualEffectsButton({
  fgLowerVisualMediaController,
  visualEffectsActive,
  settingsActive,
  scrollingContainerRef,
}: {
  fgLowerVisualMediaController: React.MutableRefObject<FgLowerVisualMediaController>;
  visualEffectsActive: boolean;
  settingsActive: boolean;
  scrollingContainerRef: React.RefObject<HTMLDivElement>;
}) {
  return (
    <FgButton
      className="pointer-events-auto relative flex aspect-square h-full scale-x-[-1] items-center justify-center"
      clickFunction={() => {
        fgLowerVisualMediaController.current.handleVisualEffects();
      }}
      contentFunction={() => {
        const iconSrc = visualEffectsActive ? effectOffIcon : effectIcon;

        return (
          <FgSVGElement
            src={iconSrc}
            className="flex items-center justify-center"
            attributes={[
              { key: "width", value: "85%" },
              { key: "height", value: "85%" },
              { key: "fill", value: "#f2f2f2" },
              { key: "stroke", value: "#f2f2f2" },
            ]}
          />
        );
      }}
      hoverContent={
        !visualEffectsActive && !settingsActive ? (
          <FgHoverContentStandard content="Effects (e)" style="light" />
        ) : undefined
      }
      scrollingContainerRef={scrollingContainerRef}
    />
  );
}
