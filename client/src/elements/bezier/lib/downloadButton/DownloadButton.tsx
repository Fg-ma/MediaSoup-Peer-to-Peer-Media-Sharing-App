import React from "react";
import FgButton from "../../../fgButton/FgButton";
import FgHoverContentStandard from "../../../fgHoverContentStandard/FgHoverContentStandard";
import FgSVG from "../../../fgSVG/FgSVG";
import BezierController from "../BezierController";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const downloadIcon = nginxAssetServerBaseUrl + "svgs/downloadIcon.svg";

export default function DownloadButton({
  bezierController,
}: {
  bezierController: BezierController;
}) {
  return (
    <FgButton
      className='flex h-full aspect-square pointer-events-auto items-center justify-center'
      clickFunction={(event) => {
        event.stopPropagation();
        bezierController.downloadBezierCurve();
      }}
      contentFunction={() => (
        <FgSVG
          src={downloadIcon}
          className='flex h-[75%] aspect-square items-center justify-center'
          attributes={[
            { key: "fill", value: "#f2f2f2" },
            { key: "stroke", value: "#f2f2f2" },
            { key: "width", value: "100%" },
            { key: "height", value: "100%" },
          ]}
        />
      )}
      hoverContent={<FgHoverContentStandard content='Download' style='light' />}
      options={{
        hoverSpacing: 4,
        hoverTimeoutDuration: 1750,
        hoverType: "above",
        hoverZValue: 500000000,
      }}
    />
  );
}
