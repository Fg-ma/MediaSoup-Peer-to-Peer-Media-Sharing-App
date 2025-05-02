import React from "react";
import FgButton from "../../../../../../elements/fgButton/FgButton";
import FgSVGElement from "../../../../../../elements/fgSVGElement/FgSVGElement";
import FgHoverContentStandard from "../../../../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import FgLowerVisualMediaController from "../../../fgLowerVisualMediaControls/lib/FgLowerVisualMediaController";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const closeIcon = nginxAssetServerBaseUrl + "svgs/closeIcon.svg";

export default function CloseButton({
  fgLowerVisualMediaController,
}: {
  fgLowerVisualMediaController: React.MutableRefObject<FgLowerVisualMediaController>;
}) {
  return (
    <FgButton
      clickFunction={() => {
        fgLowerVisualMediaController.current.handleCloseVideo();
      }}
      contentFunction={() => {
        return (
          <FgSVGElement
            src={closeIcon}
            className="flex items-center justify-start"
            attributes={[
              { key: "width", value: "60%" },
              { key: "height", value: "60%" },
              { key: "fill", value: "#f2f2f2" },
              { key: "stroke", value: "#f2f2f2" },
            ]}
          />
        );
      }}
      hoverContent={
        <FgHoverContentStandard content="Close (x)" style="light" />
      }
      className="flex pointer-events-auto aspect-square h-full items-center justify-end"
      options={{ hoverType: "below" }}
    />
  );
}
