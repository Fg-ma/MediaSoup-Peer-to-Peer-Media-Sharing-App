import React from "react";
import FgButton from "../../../fgElements/fgButton/FgButton";
import FgSVG from "../../../fgElements/fgSVG/FgSVG";

const nginxAssetSeverBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const gridIcon = nginxAssetSeverBaseUrl + "svgs/games/snake/gridIcon.svg";
const gridOffIcon = nginxAssetSeverBaseUrl + "svgs/games/snake/gridOffIcon.svg";

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
          <FgSVG
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
    />
  );
}
