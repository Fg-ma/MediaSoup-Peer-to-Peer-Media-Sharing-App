import React from "react";
import FgButton from "../../fgElements/fgButton/FgButton";
import FgSVG from "../../fgElements/fgSVG/FgSVG";

const nginxAssetSeverBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const additionIcon = nginxAssetSeverBaseUrl + "svgs/additionIcon.svg";

export default function MoreTableFunctionsButton() {
  return (
    <FgButton
      className='h-full aspect-square bg-transparent'
      contentFunction={() => {
        return (
          <FgSVG
            src={additionIcon}
            className='h-full aspect-square'
            attributes={[
              { key: "width", value: "100%" },
              { key: "height", value: "100%" },
              { key: "fill", value: "white" },
            ]}
          />
        );
      }}
    />
  );
}
