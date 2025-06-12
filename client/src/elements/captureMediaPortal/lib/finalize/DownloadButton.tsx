import React from "react";
import FgButton from "../../../fgButton/FgButton";
import FgSVGElement from "../../../fgSVGElement/FgSVGElement";
import FgHoverContentStandard from "../../../fgHoverContentStandard/FgHoverContentStandard";
import CaptureMediaController from "../CaptureMediaController";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const downloadIcon = nginxAssetServerBaseUrl + "svgs/downloadIcon.svg";

export default function DownloadButton({
  captureMediaController,
}: {
  captureMediaController: CaptureMediaController;
}) {
  return (
    <FgButton
      className="pointer-events-auto z-20 flex aspect-square h-full items-center justify-center"
      clickFunction={(event) => {
        event.stopPropagation();
        captureMediaController.downloadCapture();
      }}
      contentFunction={() => (
        <FgSVGElement
          src={downloadIcon}
          className="flex aspect-square w-[85%] items-center justify-center"
          attributes={[
            { key: "fill", value: "#f2f2f2" },
            { key: "stroke", value: "#f2f2f2" },
            { key: "width", value: "100%" },
            { key: "height", value: "100%" },
          ]}
        />
      )}
      hoverContent={<FgHoverContentStandard content="Download" style="light" />}
      options={{
        hoverSpacing: 4,
        hoverTimeoutDuration: 1750,
        hoverType: "above",
      }}
    />
  );
}
