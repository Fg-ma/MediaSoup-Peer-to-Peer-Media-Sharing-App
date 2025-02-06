import React from "react";
import FgButton from "../../../../../fgElements/fgButton/FgButton";
import FgSVG from "../../../../../fgElements/fgSVG/FgSVG";
import FgHoverContentStandard from "../../../../../fgElements/fgHoverContentStandard/FgHoverContentStandard";
import LowerController from "../../../lowerControls/lib/LowerController";

const nginxAssetSeverBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const syncIcon = nginxAssetSeverBaseUrl + "svgs/syncIcon.svg";
const desyncIcon = nginxAssetSeverBaseUrl + "svgs/desyncIcon.svg";

export default function SyncButton({
  desync,
  lowerController,
}: {
  desync: boolean;
  lowerController: LowerController;
}) {
  return (
    <FgButton
      clickFunction={() => {
        lowerController.handleDesync();
      }}
      contentFunction={() => {
        const src = desync ? syncIcon : desyncIcon;

        return (
          <FgSVG
            src={src}
            attributes={[
              { key: "width", value: "80%" },
              { key: "height", value: "80%" },
              { key: "fill", value: "white" },
            ]}
          />
        );
      }}
      hoverContent={
        <FgHoverContentStandard
          content={desync ? "Sync content (H)" : "Desync content (H)"}
        />
      }
      className='flex items-center justify-end w-10 aspect-square pointer-events-auto'
      options={{ hoverType: "below" }}
    />
  );
}
