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
      className="pointer-events-auto flex !aspect-square h-full items-center justify-center"
      clickFunction={() => {
        lowerController.handleClose();
      }}
      contentFunction={() => {
        return (
          <FgSVGElement
            src={closeIcon}
            className="h-[85%] w-[85%] fill-fg-white"
            attributes={[
              { key: "width", value: "100%" },
              { key: "height", value: "100%" },
            ]}
          />
        );
      }}
      hoverContent={
        <FgHoverContentStandard content="Close (x)" style="light" />
      }
      options={{ hoverType: "below" }}
    />
  );
}
