import React from "react";
import FgButton from "../../../../elements/fgButton/FgButton";
import FgSVG from "../../../../elements/fgSVG/FgSVG";
import TableFunctionsController from "../../TableFunctionsController";
import FgHoverContentStandard from "../../../../elements/fgHoverContentStandard/FgHoverContentStandard";
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
  tableFunctionsController: TableFunctionsController;
  captureMediaController: CaptureMediaController;
}) {
  return (
    <FgButton
      className='flex shadow z-20 h-full aspect-square rounded-full bg-fg-tone-black-4 bg-opacity-80 items-center justify-center pointer-events-auto'
      clickFunction={(event) => {
        event.stopPropagation();

        delaying.current
          ? captureMediaController.clearDelay()
          : finalizeCapture
          ? captureMediaController.handleExitFinialization()
          : tableFunctionsController.stopVideo();
      }}
      contentFunction={() => (
        <FgSVG
          src={closeIcon}
          className='w-[50%] aspect-square'
          attributes={[
            { key: "fill", value: "#f2f2f2" },
            { key: "stroke", value: "#f2f2f2" },
            { key: "width", value: "100%" },
            { key: "height", value: "100%" },
          ]}
        />
      )}
      hoverContent={
        <FgHoverContentStandard content='Close (x)' style='light' />
      }
      options={{
        hoverSpacing: 4,
        hoverTimeoutDuration: 1750,
        hoverType: "below",
        hoverZValue: 500000000,
      }}
    />
  );
}
