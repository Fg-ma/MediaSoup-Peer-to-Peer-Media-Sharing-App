import React from "react";
import FgButton from "../../../fgButton/FgButton";
import FgHoverContentStandard from "../../../fgHoverContentStandard/FgHoverContentStandard";
import FgSVGElement from "../../../fgSVGElement/FgSVGElement";
import BezierController from "../BezierController";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const downloadIcon = nginxAssetServerBaseUrl + "svgs/downloadIcon.svg";

export default function DownloadButton({
  bezierController,
  largestDim,
}: {
  bezierController: BezierController;
  largestDim: "width" | "height";
}) {
  return (
    <FgButton
      className={`${
        largestDim === "width" ? "w-[75%]" : "h-[75%]"
      } flex aspect-square pointer-events-auto items-center justify-center`}
      clickFunction={(event) => {
        event.stopPropagation();
        bezierController.downloadBezierCurve();
      }}
      contentFunction={() => (
        <FgSVGElement
          src={downloadIcon}
          attributes={[
            { key: "fill", value: "#f2f2f2" },
            { key: "stroke", value: "#f2f2f2" },
            { key: "width", value: "100%" },
            { key: "height", value: "100%" },
          ]}
        />
      )}
      hoverContent={
        <FgHoverContentStandard content='Download (d)' style='light' />
      }
      options={{
        hoverSpacing: 4,
        hoverTimeoutDuration: 1750,
        hoverType: "above",
        hoverZValue: 500000000002,
      }}
    />
  );
}
