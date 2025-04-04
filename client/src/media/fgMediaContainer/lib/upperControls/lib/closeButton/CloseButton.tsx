import React from "react";
import FgButton from "../../../../../../elements/fgButton/FgButton";
import FgSVGElement from "../../../../../../elements/fgSVGElement/FgSVGElement";
import FgHoverContentStandard from "../../../../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import LowerController from "../../../lowerControls/lib/LowerController";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const closeIcon = nginxAssetServerBaseUrl + "svgs/closeIcon.svg";

export default function CloseButton({
  lowerController,
}: {
  lowerController: LowerController;
}) {
  return (
    <FgButton
      className='flex items-center justify-end h-full !aspect-square pointer-events-auto'
      clickFunction={() => {
        lowerController.handleClose();
      }}
      contentFunction={() => {
        return (
          <FgSVGElement
            src={closeIcon}
            attributes={[
              { key: "width", value: "60%" },
              { key: "height", value: "60%" },
              { key: "fill", value: "#f2f2f2" },
            ]}
          />
        );
      }}
      hoverContent={
        <FgHoverContentStandard content='Close (x)' style='light' />
      }
      options={{ hoverType: "below" }}
    />
  );
}
