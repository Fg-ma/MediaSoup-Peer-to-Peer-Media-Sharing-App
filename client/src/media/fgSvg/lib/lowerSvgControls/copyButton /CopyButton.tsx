import React, { useRef } from "react";
import FgButton from "../../../../../elements/fgButton/FgButton";
import FgHoverContentStandard from "../../../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import FgSVGElement from "../../../../../elements/fgSVGElement/FgSVGElement";
import FgPortal from "../../../../../elements/fgPortal/FgPortal";
import LowerSvgController from "../LowerSvgController";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const copyIcon = nginxAssetServerBaseUrl + "svgs/copyIcon.svg";

export default function CopyButton({
  lowerSvgController,
  copied,
  scrollingContainerRef,
}: {
  lowerSvgController: LowerSvgController;
  copied: boolean;
  scrollingContainerRef: React.RefObject<HTMLDivElement>;
}) {
  const copiedButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <FgButton
        externalRef={copiedButtonRef}
        className='h-[75%] flex aspect-square pointer-events-auto items-center justify-center'
        clickFunction={lowerSvgController.handleCopyToClipBoard}
        contentFunction={() => (
          <FgSVGElement
            src={copyIcon}
            attributes={[
              { key: "fill", value: "#f2f2f2" },
              { key: "stroke", value: "#f2f2f2" },
              { key: "width", value: "100%" },
              { key: "height", value: "100%" },
            ]}
          />
        )}
        hoverContent={
          !copied ? (
            <FgHoverContentStandard
              content='Copy to clipboard (c)'
              style='light'
            />
          ) : undefined
        }
        scrollingContainerRef={scrollingContainerRef}
        options={{
          hoverSpacing: 4,
          hoverTimeoutDuration: 1750,
          hoverType: "above",
          hoverZValue: 500000000002,
        }}
      />
      {copied && (
        <FgPortal
          type='above'
          spacing={4}
          content={<FgHoverContentStandard content='Copied' style='light' />}
          externalRef={copiedButtonRef}
          zValue={500000000002}
        />
      )}
    </>
  );
}
