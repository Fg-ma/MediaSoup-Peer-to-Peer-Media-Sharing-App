import React from "react";
import FgButton from "../../../../elements/fgButton/FgButton";
import FgSVGElement from "../../../fgSVGElement/FgSVGElement";
import FgHoverContentStandard from "../../../../elements/fgHoverContentStandard/FgHoverContentStandard";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const closeIcon = nginxAssetServerBaseUrl + "svgs/closeIcon.svg";

export default function CloseButton({
  closeFunction,
  largestDim,
}: {
  closeFunction?: () => void;
  largestDim: "width" | "height";
}) {
  return (
    <FgButton
      className={`${
        largestDim === "width" ? "w-full" : "h-full"
      } pointer-events-auto z-20 flex aspect-square items-center justify-center rounded-full bg-fg-tone-black-4 bg-opacity-80 shadow`}
      clickFunction={closeFunction}
      contentFunction={() => (
        <FgSVGElement
          src={closeIcon}
          className="aspect-square w-[50%]"
          attributes={[
            { key: "fill", value: "#f2f2f2" },
            { key: "stroke", value: "#f2f2f2" },
            { key: "width", value: "100%" },
            { key: "height", value: "100%" },
          ]}
        />
      )}
      hoverContent={<FgHoverContentStandard content="Close" style="light" />}
      options={{
        hoverSpacing: 4,
        hoverTimeoutDuration: 1750,
        hoverType: "below",
      }}
    />
  );
}
