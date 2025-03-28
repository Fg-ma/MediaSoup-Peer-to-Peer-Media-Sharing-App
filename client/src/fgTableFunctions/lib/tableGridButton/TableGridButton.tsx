import React from "react";
import FgButton from "../../../elements/fgButton/FgButton";
import FgSVGElement from "../../../elements/fgSVGElement/FgSVGElement";
import FgHoverContentStandard from "../../../elements/fgHoverContentStandard/FgHoverContentStandard";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const gridIcon = nginxAssetServerBaseUrl + "svgs/games/snake/gridIcon.svg";
const gridOffIcon =
  nginxAssetServerBaseUrl + "svgs/games/snake/gridOffIcon.svg";

export default function TableGridButton({
  gridActive,
  setGridActive,
}: {
  gridActive: boolean;
  setGridActive: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <FgButton
      className='h-full aspect-square'
      clickFunction={() => setGridActive((prev) => !prev)}
      contentFunction={() => {
        const src = gridActive ? gridOffIcon : gridIcon;

        return (
          <FgSVGElement
            src={src}
            attributes={[
              { key: "width", value: "100%" },
              { key: "height", value: "100%" },
              { key: "fill", value: "black" },
              { key: "stroke", value: "black" },
            ]}
          />
        );
      }}
      hoverContent={
        <FgHoverContentStandard
          content={gridActive ? "Deactivate grid" : "Activate grid"}
        />
      }
      options={{ hoverTimeoutDuration: 750, hoverZValue: 500000000000 }}
      aria-label={"Toggle table grid"}
    />
  );
}
