import React from "react";
import FgButton from "../../../../../../elements/fgButton/FgButton";
import FgSVG from "../../../../../../elements/fgSVG/FgSVG";
import FgHoverContentStandard from "../../../../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import FgLowerVisualMediaController from "../../../fgLowerVisualMediaControls/lib/FgLowerVisualMediaController";

const nginxAssetSeverBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const closeIcon = nginxAssetSeverBaseUrl + "svgs/closeIcon.svg";

export default function CloseButton({
  fgLowerVisualMediaController,
}: {
  fgLowerVisualMediaController: FgLowerVisualMediaController;
}) {
  return (
    <FgButton
      clickFunction={() => {
        fgLowerVisualMediaController.handleCloseVideo();
      }}
      contentFunction={() => {
        return (
          <FgSVG
            src={closeIcon}
            className='flex items-center justify-start'
            attributes={[
              { key: "width", value: "60%" },
              { key: "height", value: "60%" },
              { key: "fill", value: "#f2f2f2" },
              { key: "stroke", value: "#f2f2f2" },
            ]}
          />
        );
      }}
      hoverContent={<FgHoverContentStandard content='Close (x)' />}
      className='flex items-center justify-end h-full aspect-square pointer-events-auto'
      options={{ hoverType: "below" }}
    />
  );
}
