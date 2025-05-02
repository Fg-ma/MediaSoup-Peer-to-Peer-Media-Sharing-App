import React from "react";
import FgButton from "../../../../../elements/fgButton/FgButton";
import FgSVGElement from "../../../../../elements/fgSVGElement/FgSVGElement";
import FgHoverContentStandard from "../../../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import LowerApplicationController from "../LowerApplicationController";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const effectIcon = nginxAssetServerBaseUrl + "svgs/effectIcon.svg";
const effectOffIcon = nginxAssetServerBaseUrl + "svgs/effectOffIcon.svg";

export default function ApplicationEffectsButton({
  lowerApplicationController,
  applicationEffectsActive,
  scrollingContainerRef,
}: {
  lowerApplicationController: React.MutableRefObject<LowerApplicationController>;
  applicationEffectsActive: boolean;
  scrollingContainerRef: React.RefObject<HTMLDivElement>;
}) {
  return (
    <FgButton
      clickFunction={() => {
        lowerApplicationController.current.handleApplicationEffects();
      }}
      contentFunction={() => {
        const iconSrc = applicationEffectsActive ? effectOffIcon : effectIcon;

        return (
          <FgSVGElement
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
        !applicationEffectsActive ? (
          <FgHoverContentStandard content="Effects (e)" style="light" />
        ) : undefined
      }
      scrollingContainerRef={scrollingContainerRef}
      className="pointer-events-auto relative flex aspect-square h-full scale-x-[-1] items-center justify-center"
    />
  );
}
