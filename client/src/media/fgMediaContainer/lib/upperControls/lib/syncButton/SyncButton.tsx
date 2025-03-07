import React from "react";
import FgButton from "../../../../../../elements/fgButton/FgButton";
import FgSVG from "../../../../../../elements/fgSVG/FgSVG";
import FgHoverContentStandard from "../../../../../../elements/fgHoverContentStandard/FgHoverContentStandard";
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
      className='flex items-center justify-end h-full !aspect-square pointer-events-auto'
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
              { key: "fill", value: "#f2f2f2" },
            ]}
          />
        );
      }}
      hoverContent={
        <FgHoverContentStandard
          content={desync ? "Sync content (H)" : "Desync content (H)"}
        />
      }
      options={{ hoverType: "below" }}
    />
  );
}
