import React from "react";
import FgButton from "../../fgButton/FgButton";
import FgSVGElement from "../../fgSVGElement/FgSVGElement";
import FgHoverContentStandard from "../../fgHoverContentStandard/FgHoverContentStandard";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const closeIcon = nginxAssetServerBaseUrl + "svgs/closeIcon.svg";

export default function EndGameButton({
  closeGameFunction,
}: {
  closeGameFunction?: () => void;
}) {
  return (
    <FgButton
      className='h-[60%] aspect-square rounded pb-3 pr-2'
      clickFunction={closeGameFunction}
      contentFunction={() => (
        <FgSVGElement
          className='flex items-center justify-center h-full aspect-square'
          src={closeIcon}
          attributes={[
            { key: "width", value: "100%" },
            { key: "height", value: "100%" },
            { key: "stroke", value: "#f2f2f2" },
            { key: "fill", value: "#f2f2f2" },
          ]}
        />
      )}
      hoverContent={<FgHoverContentStandard content='End game (x)' />}
      options={{
        hoverTimeoutDuration: 750,
        hoverType: "above",
        hoverSpacing: 4,
      }}
    />
  );
}
