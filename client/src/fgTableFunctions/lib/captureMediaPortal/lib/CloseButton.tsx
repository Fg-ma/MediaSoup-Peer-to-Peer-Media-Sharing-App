import React from "react";
import FgButton from "../../../../elements/fgButton/FgButton";
import FgSVG from "../../../../elements/fgSVG/FgSVG";
import TableFunctionsController from "../../TableFunctionsController";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const closeIcon = nginxAssetServerBaseUrl + "svgs/closeIcon.svg";

export default function CloseButton({
  tableFunctionsController,
}: {
  tableFunctionsController: TableFunctionsController;
}) {
  return (
    <FgButton
      className='flex shadow h-full aspect-square rounded-full bg-fg-tone-black-4 bg-opacity-80 items-center justify-center'
      clickFunction={tableFunctionsController.stopVideo}
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
    />
  );
}
