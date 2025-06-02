import React from "react";
import FgButton from "../../../../../elements/fgButton/FgButton";
import FgSVGElement from "../../../../../elements/fgSVGElement/FgSVGElement";
import FgHoverContentStandard from "../../../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import CaptureMediaController from "../CaptureMediaController";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const checkIcon = nginxAssetServerBaseUrl + "svgs/checkIcon.svg";

export default function ConfirmButton({
  captureMediaController,
}: {
  captureMediaController: CaptureMediaController;
}) {
  return (
    <FgButton
      className="pointer-events-auto z-20 flex aspect-square h-full items-center justify-center rounded-full bg-fg-red-light"
      clickFunction={(event) => {
        event.stopPropagation();
        captureMediaController.confirmCapture();
      }}
      contentFunction={() => (
        <FgSVGElement
          src={checkIcon}
          className="flex aspect-square w-[75%] items-center justify-center"
          attributes={[
            { key: "fill", value: "#f2f2f2" },
            { key: "stroke", value: "#f2f2f2" },
            { key: "width", value: "100%" },
            { key: "height", value: "100%" },
          ]}
        />
      )}
      hoverContent={
        <FgHoverContentStandard content="Confirm and upload" style="light" />
      }
      options={{
        hoverSpacing: 4,
        hoverTimeoutDuration: 1750,
        hoverType: "above",
      }}
    />
  );
}
