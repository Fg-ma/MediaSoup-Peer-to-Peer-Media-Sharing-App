import React from "react";
import FgButton from "../../fgButton/FgButton";
import FgSVGElement from "../../fgSVGElement/FgSVGElement";
import TableFunctionsController from "../../../tableFunctions/lib/TableFunctionsController";
import FgHoverContentStandard from "../../fgHoverContentStandard/FgHoverContentStandard";
import CaptureMediaController from "./CaptureMediaController";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const closeIcon = nginxAssetServerBaseUrl + "svgs/closeIcon.svg";

export default function CloseButton({
  delaying,
  finalizeCapture,
  tableFunctionsController,
  captureMediaController,
}: {
  delaying: React.MutableRefObject<boolean>;
  finalizeCapture: boolean;
  tableFunctionsController: React.MutableRefObject<TableFunctionsController>;
  captureMediaController: CaptureMediaController;
}) {
  return (
    <FgButton
      className="pointer-events-auto z-20 flex aspect-square h-full items-center justify-center rounded-full bg-fg-tone-black-4 shadow"
      clickFunction={(event) => {
        event.stopPropagation();

        delaying.current
          ? captureMediaController.clearDelay()
          : finalizeCapture
            ? captureMediaController.handleExitFinialization()
            : tableFunctionsController.current.stopVideo();
      }}
      contentFunction={() => (
        <FgSVGElement
          src={closeIcon}
          className="aspect-square w-[50%]"
          attributes={[
            { key: "fill", value: "#f2f2f2" },
            { key: "stroke", value: "#f2f2f2" },
            { key: "width", value: "100%" },
            { key: "height", value: "100%" },
          ]}
        />
      )}
      hoverContent={
        <FgHoverContentStandard content="Close (x)" style="light" />
      }
      options={{
        hoverSpacing: 4,
        hoverTimeoutDuration: 1750,
        hoverType: "below",
      }}
    />
  );
}
