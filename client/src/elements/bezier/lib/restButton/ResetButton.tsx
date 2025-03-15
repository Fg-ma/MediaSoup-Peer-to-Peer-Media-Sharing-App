import React, { useRef } from "react";
import FgButton from "../../../fgButton/FgButton";
import FgHoverContentStandard from "../../../fgHoverContentStandard/FgHoverContentStandard";
import FgSVG from "../../../fgSVG/FgSVG";
import BezierController from "../BezierController";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const resetIcon = nginxAssetServerBaseUrl + "svgs/resetIcon.svg";

export default function ResetButton({
  bezierController,
}: {
  bezierController: BezierController;
}) {
  const copiedButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <FgButton
      externalRef={copiedButtonRef}
      className='flex h-full aspect-square pointer-events-auto items-center justify-center'
      clickFunction={(event) => {
        event.stopPropagation();
        bezierController.handleReset();
      }}
      contentFunction={() => (
        <FgSVG
          src={resetIcon}
          className='flex h-[75%] aspect-square items-center justify-center'
          attributes={[
            { key: "fill", value: "#f2f2f2" },
            { key: "stroke", value: "#f2f2f2" },
            { key: "width", value: "100%" },
            { key: "height", value: "100%" },
          ]}
        />
      )}
      hoverContent={<FgHoverContentStandard content='Reset' style='light' />}
      options={{
        hoverSpacing: 4,
        hoverTimeoutDuration: 1750,
        hoverType: "above",
        hoverZValue: 500000000002,
      }}
    />
  );
}
