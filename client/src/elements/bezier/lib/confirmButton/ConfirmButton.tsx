import React from "react";
import FgButton from "../../../../elements/fgButton/FgButton";
import FgHoverContentStandard from "../../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import FgSVG from "../../../../elements/fgSVG/FgSVG";
import BezierController from "../BezierController";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const checkIcon = nginxAssetServerBaseUrl + "svgs/checkIcon.svg";

export default function ConfirmButton({
  bezierController,
}: {
  bezierController: BezierController;
}) {
  return (
    <FgButton
      className='flex h-full aspect-square pointer-events-auto items-center justify-center bg-fg-red-light rounded-full'
      clickFunction={(event) => {
        event.stopPropagation();
        bezierController.confirmBezierCurve();
      }}
      contentFunction={() => (
        <FgSVG
          src={checkIcon}
          className='flex h-[70%] aspect-square items-center justify-center'
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
