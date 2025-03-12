import React from "react";
import FgButton from "../../../../../../elements/fgButton/FgButton";
import FgSVG from "../../../../../../elements/fgSVG/FgSVG";
import FgHoverContentStandard from "../../../../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import CaptureMediaController from "../../CaptureMediaController";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const effectIcon = nginxAssetServerBaseUrl + "svgs/effectIcon.svg";
const effectOffIcon = nginxAssetServerBaseUrl + "svgs/effectOffIcon.svg";

export default function EffectsButton({
  captureMediaController,
  captureMediaEffectsActive,
  captureMediaTypeActive,
}: {
  captureMediaController: CaptureMediaController;
  captureMediaEffectsActive: boolean;
  captureMediaTypeActive: boolean;
}) {
  return (
    <FgButton
      className='flex items-center justify-center h-full aspect-square relative pointer-events-auto z-20'
      clickFunction={(event) => {
        event?.stopPropagation();
        captureMediaController.handleEffects();
      }}
      contentFunction={() => (
        <FgSVG
          src={captureMediaEffectsActive ? effectOffIcon : effectIcon}
          attributes={[
            { key: "width", value: "100%" },
            { key: "height", value: "100%" },
            { key: "fill", value: "#f2f2f2" },
            { key: "stroke", value: "#f2f2f2" },
          ]}
        />
      )}
      hoverContent={
        !captureMediaEffectsActive && !captureMediaTypeActive ? (
          <FgHoverContentStandard content='Effects (e)' style='light' />
        ) : undefined
      }
      options={{
        hoverSpacing: 4,
        hoverTimeoutDuration: 1750,
        hoverType: "above",
        hoverZValue: 500000000,
      }}
    />
  );
}
