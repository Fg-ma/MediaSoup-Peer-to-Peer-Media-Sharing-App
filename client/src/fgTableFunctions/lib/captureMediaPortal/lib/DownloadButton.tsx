import React from "react";
import FgButton from "../../../../elements/fgButton/FgButton";
import FgSVG from "../../../../elements/fgSVG/FgSVG";
import FgHoverContentStandard from "../../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import CaptureMediaController from "./CaptureMediaController";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const downloadIcon = nginxAssetServerBaseUrl + "svgs/downloadIcon.svg";

export default function DownloadButton({
  captureMediaController,
}: {
  captureMediaController: CaptureMediaController;
}) {
  return (
    <FgButton
      className='flex h-full aspect-square items-center justify-center'
      clickFunction={captureMediaController.downloadCapture}
      contentFunction={() => (
        <FgSVG
          src={downloadIcon}
          className='w-[85%] aspect-square flex items-center justify-center'
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
