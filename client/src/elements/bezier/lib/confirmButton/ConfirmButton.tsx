import React from "react";
import FgButton from "../../../../elements/fgButton/FgButton";
import FgHoverContentStandard from "../../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import FgSVGElement from "../../../fgSVGElement/FgSVGElement";
import BezierController from "../BezierController";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const checkIcon = nginxAssetServerBaseUrl + "svgs/checkIcon.svg";

export default function ConfirmButton({
  bezierController,
  largestDim,
  needsName,
  setGetNamePopupActive,
}: {
  bezierController: BezierController;
  largestDim: "width" | "height";
  needsName: boolean;
  setGetNamePopupActive: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <FgButton
      className={`${
        largestDim === "width" ? "w-full" : "h-full"
      } flex aspect-square pointer-events-auto items-center justify-center bg-fg-red-light rounded-full`}
      clickFunction={(event) => {
        event.stopPropagation();
        if (!needsName) {
          bezierController.confirmBezierCurve();
        } else {
          setGetNamePopupActive((prev) => !prev);
        }
      }}
      contentFunction={() => (
        <FgSVGElement
          src={checkIcon}
          className='h-[70%] aspect-square'
          attributes={[
            { key: "fill", value: "#f2f2f2" },
            { key: "stroke", value: "#f2f2f2" },
            { key: "width", value: "100%" },
            { key: "height", value: "100%" },
          ]}
        />
      )}
      hoverContent={<FgHoverContentStandard content='Confirm' style='light' />}
      options={{
        hoverSpacing: 4,
        hoverTimeoutDuration: 1750,
        hoverType: "above",
        hoverZValue: 500000000002,
      }}
    />
  );
}
