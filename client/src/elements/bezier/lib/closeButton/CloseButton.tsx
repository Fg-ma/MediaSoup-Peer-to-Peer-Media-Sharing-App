import React from "react";
import FgButton from "../../../../elements/fgButton/FgButton";
import FgSVG from "../../../../elements/fgSVG/FgSVG";
import FgHoverContentStandard from "../../../../elements/fgHoverContentStandard/FgHoverContentStandard";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const closeIcon = nginxAssetServerBaseUrl + "svgs/closeIcon.svg";

export default function CloseButton({
  closeFunction,
}: {
  closeFunction?: () => void;
}) {
  return (
    <FgButton
      className='flex shadow z-20 mt-2 h-full aspect-square rounded-full bg-fg-tone-black-4 bg-opacity-80 items-center justify-center pointer-events-auto'
      clickFunction={closeFunction}
      contentFunction={() => (
        <FgSVG
          src={closeIcon}
          className='w-[50%] aspect-square'
          attributes={[
            { key: "fill", value: "#f2f2f2" },
            { key: "stroke", value: "#f2f2f2" },
            { key: "width", value: "100%" },
            { key: "height", value: "100%" },
          ]}
        />
      )}
      hoverContent={<FgHoverContentStandard content='Close' style='light' />}
      options={{
        hoverSpacing: 4,
        hoverTimeoutDuration: 1750,
        hoverType: "below",
        hoverZValue: 500000000002,
      }}
    />
  );
}
