import React from "react";
import FgButton from "../../../fgButton/FgButton";
import FgSVGElement from "../../../fgSVGElement/FgSVGElement";
import CaptureMediaController from "../CaptureMediaController";
import FgHoverContentStandard from "../../../fgHoverContentStandard/FgHoverContentStandard";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const recordOffIcon = nginxAssetServerBaseUrl + "svgs/recordOffIcon.svg";

export default function CaptureButton({
  recording,
  captureMediaController,
}: {
  recording: React.MutableRefObject<boolean>;
  captureMediaController: CaptureMediaController;
}) {
  return (
    <FgButton
      className="pointer-events-auto z-20 aspect-square h-full"
      clickFunction={(event) => {
        event?.stopPropagation();
        captureMediaController.handleCapture();
      }}
      contentFunction={() => (
        <FgSVGElement
          src={recordOffIcon}
          attributes={[
            { key: "fill", value: "#f2f2f2" },
            { key: "stroke", value: "#f2f2f2" },
            { key: "width", value: "100%" },
            { key: "height", value: "100%" },
            recording.current
              ? {
                  key: "fill",
                  value: "#d40213",
                  id: "buttonInside",
                }
              : {
                  key: "fill",
                  value: "#f2f2f2",
                  id: "buttonInside",
                },
          ]}
        />
      )}
      hoverContent={
        <FgHoverContentStandard content="Capture (k)" style="light" />
      }
      options={{
        hoverSpacing: 4,
        hoverTimeoutDuration: 1750,
        hoverType: "above",
      }}
    />
  );
}
