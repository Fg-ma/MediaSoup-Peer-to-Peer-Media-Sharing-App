import React, { useState } from "react";
import FgButton from "../../../../../../fgElements/fgButton/FgButton";
import FgSVG from "../../../../../../fgElements/fgSVG/FgSVG";
import FgHoverContentStandard from "../../../../../../fgElements/fgHoverContentStandard/FgHoverContentStandard";
import FgLowerVideoController from "../FgLowerVideoController";

const nginxAssetSeverBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const fullScreenIcon = nginxAssetSeverBaseUrl + "svgs/fullScreenIcon.svg";
const fullScreenOffIcon = nginxAssetSeverBaseUrl + "svgs/fullScreenOffIcon.svg";

export default function FullScreenButton({
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
  const [active, setActive] = useState(false);

  return (
    <FgButton
      clickFunction={() => {
        fgLowerVideoController.handleFullScreen();
        setActive((prev) => !prev);
      }}
      contentFunction={() => {
        const iconSrc = active ? fullScreenOffIcon : fullScreenIcon;

        return (
          <FgSVG
            src={iconSrc}
            attributes={[
              { key: "width", value: "36px" },
              { key: "height", value: "36px" },
              { key: "fill", value: "white" },
            ]}
          />
        );
      }}
      hoverContent={
        !videoEffectsActive && !settingsActive ? (
          <FgHoverContentStandard content='Full screen (f)' style='dark' />
        ) : undefined
      }
      scrollingContainerRef={scrollingContainerRef}
      className='flex items-center justify-center w-10 aspect-square scale-x-[-1] pointer-events-auto'
    />
  );
}
