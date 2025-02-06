import React from "react";
import FgButton from "../../../../../fgElements/fgButton/FgButton";
import FgSVG from "../../../../../fgElements/fgSVG/FgSVG";
import FgHoverContentStandard from "../../../../../fgElements/fgHoverContentStandard/FgHoverContentStandard";
import LowerController from "../../../lowerControls/lib/LowerController";

const nginxAssetSeverBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const closeIcon = nginxAssetSeverBaseUrl + "svgs/closeIcon.svg";

export default function CloseButton({
  lowerController,
}: {
  lowerController: LowerController;
}) {
  return (
    <FgButton
      clickFunction={() => {
        lowerController.handleClose();
      }}
      contentFunction={() => {
        return (
          <FgSVG
            src={closeIcon}
            attributes={[
              { key: "width", value: "60%" },
              { key: "height", value: "60%" },
              { key: "fill", value: "white" },
            ]}
          />
        );
      }}
      hoverContent={<FgHoverContentStandard content='Close (x)' />}
      className='flex items-center justify-end w-10 aspect-square pointer-events-auto'
      options={{ hoverType: "below" }}
    />
  );
}
