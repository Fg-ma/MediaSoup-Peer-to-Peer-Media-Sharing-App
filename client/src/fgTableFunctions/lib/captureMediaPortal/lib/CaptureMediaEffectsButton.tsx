import React from "react";
import FgButton from "../../../../elements/fgButton/FgButton";
import FgSVG from "../../../../elements/fgSVG/FgSVG";
import FgHoverContentStandard from "../../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import CaptureMediaController from "./CaptureMediaController";

const nginxAssetSeverBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const effectIcon = nginxAssetSeverBaseUrl + "svgs/effectIcon.svg";
const effectOffIcon = nginxAssetSeverBaseUrl + "svgs/effectOffIcon.svg";

export default function CaptureMediaEffectsButton({
  captureMediaController,
  captureMediaEffectsActive,
}: {
  captureMediaController: CaptureMediaController;
  captureMediaEffectsActive: boolean;
}) {
  return (
    <FgButton
      className='flex items-center justify-center h-full aspect-square relative pointer-events-auto'
      clickFunction={() => {
        captureMediaController.handleEffects();
      }}
      contentFunction={() => (
        <FgSVG
          src={captureMediaEffectsActive ? effectOffIcon : effectIcon}
          attributes={[
            { key: "width", value: "100%" },
            { key: "height", value: "100%" },
            { key: "fill", value: "white" },
            { key: "stroke", value: "white" },
          ]}
        />
      )}
      hoverContent={
        !captureMediaEffectsActive ? (
          <FgHoverContentStandard content='Effects (e)' style='dark' />
        ) : undefined
      }
    />
  );
}
