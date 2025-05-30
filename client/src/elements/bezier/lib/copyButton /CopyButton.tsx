import React, { useRef } from "react";
import FgButton from "../../../fgButton/FgButton";
import FgHoverContentStandard from "../../../fgHoverContentStandard/FgHoverContentStandard";
import FgSVGElement from "../../../fgSVGElement/FgSVGElement";
import BezierController from "../BezierController";
import FgPortal from "../../../fgPortal/FgPortal";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const copyIcon = nginxAssetServerBaseUrl + "svgs/copyIcon.svg";

export default function CopyButton({
  bezierController,
  copied,
  largestDim,
}: {
  bezierController: BezierController;
  copied: boolean;
  largestDim: "width" | "height";
}) {
  const copiedButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <FgButton
        externalRef={copiedButtonRef}
        className={`${
          largestDim === "width" ? "w-[75%]" : "h-[75%]"
        } pointer-events-auto flex aspect-square items-center justify-center`}
        clickFunction={(event) => {
          event.stopPropagation();
          bezierController.copyToClipBoardBezierCurve();
        }}
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
              content="Copy to clipboard (c)"
              style="light"
            />
          ) : undefined
        }
        options={{
          hoverSpacing: 4,
          hoverTimeoutDuration: 1750,
          hoverType: "above",
        }}
      />
      {copied && (
        <FgPortal
          type="above"
          spacing={4}
          content={<FgHoverContentStandard content="Copied" style="light" />}
          externalRef={copiedButtonRef}
        />
      )}
    </>
  );
}
