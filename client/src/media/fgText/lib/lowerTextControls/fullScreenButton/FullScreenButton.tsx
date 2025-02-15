import React, { useState } from "react";
import FgButton from "../../../../../fgElements/fgButton/FgButton";
import FgSVG from "../../../../../fgElements/fgSVG/FgSVG";
import FgHoverContentStandard from "../../../../../fgElements/fgHoverContentStandard/FgHoverContentStandard";
import LowerTextController from "../LowerTextController";

const nginxAssetSeverBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const fullScreenIcon = nginxAssetSeverBaseUrl + "svgs/fullScreenIcon.svg";
const fullScreenOffIcon = nginxAssetSeverBaseUrl + "svgs/fullScreenOffIcon.svg";

export default function FullScreenButton({
  lowerTextController,
  textEffectsActive,
  scrollingContainerRef,
}: {
  lowerTextController: LowerTextController;
  textEffectsActive: boolean;
  scrollingContainerRef: React.RefObject<HTMLDivElement>;
}) {
  const [active, setActive] = useState(false);

  return (
    <FgButton
      clickFunction={() => {
        lowerTextController.handleFullScreen();
        setActive((prev) => !prev);
      }}
      contentFunction={() => {
        const iconSrc = active ? fullScreenOffIcon : fullScreenIcon;

        return (
          <FgSVG
            src={iconSrc}
            attributes={[
              { key: "width", value: "100%" },
              { key: "height", value: "100%" },
              { key: "fill", value: "white" },
            ]}
          />
        );
      }}
      hoverContent={
        !textEffectsActive ? (
          <FgHoverContentStandard content='Full screen (f)' style='dark' />
        ) : undefined
      }
      scrollingContainerRef={scrollingContainerRef}
      className='flex items-center justify-center h-full aspect-square scale-x-[-1] pointer-events-auto'
    />
  );
}
