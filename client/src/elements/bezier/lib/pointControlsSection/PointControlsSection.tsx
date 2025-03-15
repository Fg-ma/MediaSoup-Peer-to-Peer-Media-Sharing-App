import React from "react";
import FgButton from "../../../../elements/fgButton/FgButton";
import FgSVG from "../../../../elements/fgSVG/FgSVG";
import FgHoverContentStandard from "../../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import BezierController from "../BezierController";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const trashIcon = nginxAssetServerBaseUrl + "svgs/trashIcon.svg";
const freeControlsIcon = nginxAssetServerBaseUrl + "svgs/freeControlsIcon.svg";
const inlineControlsIcon =
  nginxAssetServerBaseUrl + "svgs/inlineControlsIcon.svg";
const inlineSymmetricControlsIcon =
  nginxAssetServerBaseUrl + "svgs/inlineSymmetricControlsIcon.svg";

export default function PointControlsSection({
  bezierController,
  largestDim,
}: {
  bezierController: BezierController;
  largestDim: "width" | "height";
}) {
  return (
    <div
      className={`${
        largestDim === "width"
          ? "bottom-0 right-full mr-2 flex-col space-y-2 w-[10%] h-max max-w-16 min-w-8"
          : "top-full right-0 mt-2 space-x-2 h-[10%] w-max max-h-16 min-h-8"
      } absolute flex items-center justify-center pointer-events-none`}
    >
      <FgButton
        className={`${
          largestDim === "width" ? "w-full" : "h-full"
        } aspect-square pointer-events-auto flex items-center justify-center`}
        clickFunction={(event) => {
          event.stopPropagation();
          bezierController.deleteSelectedAndHovering();
        }}
        contentFunction={() => (
          <FgSVG
            src={trashIcon}
            className='h-[60%] w-full stroke-fg-white'
            attributes={[
              { key: "width", value: "100%" },
              { key: "height", value: "100%" },
            ]}
          />
        )}
        hoverContent={
          <FgHoverContentStandard content='Delete (x)' style='light' />
        }
        options={{
          hoverTimeoutDuration: 1750,
          hoverType: "below",
          hoverZValue: 500000000002,
        }}
      />
      <FgButton
        className={`${
          largestDim === "width" ? "w-full" : "h-full"
        } aspect-square pointer-events-auto`}
        clickFunction={(event) => {
          event.stopPropagation();
          bezierController.swapControlType("inline");
        }}
        contentFunction={() => (
          <FgSVG
            src={inlineControlsIcon}
            className='h-full w-full stroke-fg-white'
            attributes={[
              { key: "width", value: "100%" },
              { key: "height", value: "100%" },
            ]}
          />
        )}
        hoverContent={
          <FgHoverContentStandard content='Inline (3)' style='light' />
        }
        options={{
          hoverTimeoutDuration: 1750,
          hoverType: "below",
          hoverZValue: 500000000002,
        }}
      />
      <FgButton
        className={`${
          largestDim === "width" ? "w-full" : "h-full"
        } aspect-square pointer-events-auto`}
        clickFunction={(event) => {
          event.stopPropagation();
          bezierController.swapControlType("inlineSymmetric");
        }}
        contentFunction={() => (
          <FgSVG
            src={inlineSymmetricControlsIcon}
            className='h-full w-full stroke-fg-white'
            attributes={[
              { key: "width", value: "100%" },
              { key: "height", value: "100%" },
            ]}
          />
        )}
        hoverContent={
          <FgHoverContentStandard
            content='Symmetric inline (2)'
            style='light'
          />
        }
        options={{
          hoverTimeoutDuration: 1750,
          hoverType: "below",
          hoverZValue: 500000000002,
        }}
      />
      <FgButton
        className={`${
          largestDim === "width" ? "w-full" : "h-full"
        } aspect-square pointer-events-auto`}
        clickFunction={(event) => {
          event.stopPropagation();
          bezierController.swapControlType("free");
        }}
        contentFunction={() => (
          <FgSVG
            src={freeControlsIcon}
            className='h-full w-full stroke-fg-white'
            attributes={[
              { key: "width", value: "100%" },
              { key: "height", value: "100%" },
            ]}
          />
        )}
        hoverContent={
          <FgHoverContentStandard content='Free (1)' style='light' />
        }
        options={{
          hoverTimeoutDuration: 1750,
          hoverType: "below",
          hoverZValue: 500000000002,
        }}
      />
    </div>
  );
}
