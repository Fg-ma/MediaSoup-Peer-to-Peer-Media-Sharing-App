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
      className='flex z-20 h-full aspect-square rounded-full items-center justify-center bg-fg-red-light bg-opacity-80 pointer-events-auto'
      clickFunction={(event) => {
        event.stopPropagation();
        captureMediaController.confirmCapture();
      }}
      contentFunction={() => (
        <FgSVGElement
          src={checkIcon}
          className='w-[75%] aspect-square flex items-center justify-center'
          attributes={[
            { key: "fill", value: "#f2f2f2" },
            { key: "stroke", value: "#f2f2f2" },
            { key: "width", value: "100%" },
            { key: "height", value: "100%" },
          ]}
        />
      )}
      hoverContent={
        <FgHoverContentStandard content='Confirm and upload' style='light' />
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
