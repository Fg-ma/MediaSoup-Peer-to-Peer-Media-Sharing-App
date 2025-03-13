import React from "react";
import FgButton from "../../../../elements/fgButton/FgButton";
import FgSVG from "../../../../elements/fgSVG/FgSVG";
import FgHoverContentStandard from "../../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import BezierController from "../BezierController";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const closeIcon = nginxAssetServerBaseUrl + "svgs/closeIcon.svg";
const freeControlsIcon = nginxAssetServerBaseUrl + "svgs/freeControlsIcon.svg";
const inlineControlsIcon =
  nginxAssetServerBaseUrl + "svgs/inlineControlsIcon.svg";
const inlineSymmetricControlsIcon =
  nginxAssetServerBaseUrl + "svgs/inlineSymmetricControlsIcon.svg";

export default function PointControlsSection({
  bezierController,
}: {
  bezierController: BezierController;
}) {
  return (
    <div className='flex items-center justify-center space-x-2 h-full w-max pointer-events-none'>
      <FgButton
        className='flex h-full aspect-square pointer-events-auto items-center justify-center'
        clickFunction={(event) => {
          event.stopPropagation();
          bezierController.deleteSelectedAndHovering();
        }}
        contentFunction={() => (
          <FgSVG
            src={closeIcon}
            className='h-[40%] w-full stroke-fg-white fill-fg-white'
            attributes={[
              { key: "width", value: "100%" },
              { key: "height", value: "100%" },
            ]}
          />
        )}
        hoverContent={<FgHoverContentStandard content='Delete' style='light' />}
        options={{
          hoverTimeoutDuration: 1750,
          hoverType: "below",
          hoverZValue: 500000000,
        }}
      />
      <FgButton
        className='h-full aspect-square pointer-events-auto'
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
        hoverContent={<FgHoverContentStandard content='Free' style='light' />}
        options={{
          hoverTimeoutDuration: 1750,
          hoverType: "below",
          hoverZValue: 500000000,
        }}
      />
      <FgButton
        className='h-full aspect-square pointer-events-auto'
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
          <FgHoverContentStandard content='Symmetric inline' style='light' />
        }
        options={{
          hoverTimeoutDuration: 1750,
          hoverType: "below",
          hoverZValue: 500000000,
        }}
      />
      <FgButton
        className='h-full aspect-square pointer-events-auto'
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
        hoverContent={<FgHoverContentStandard content='Inline' style='light' />}
        options={{
          hoverTimeoutDuration: 1750,
          hoverType: "below",
          hoverZValue: 500000000,
        }}
      />
    </div>
  );
}
