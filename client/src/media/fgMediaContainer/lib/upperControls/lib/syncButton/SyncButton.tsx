import React from "react";
import FgButton from "../../../../../../elements/fgButton/FgButton";
import FgSVGElement from "../../../../../../elements/fgSVGElement/FgSVGElement";
import FgHoverContentStandard from "../../../../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import LowerController from "../../../lowerControls/lib/LowerController";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const syncIcon = nginxAssetServerBaseUrl + "svgs/syncIcon.svg";
const desyncIcon = nginxAssetServerBaseUrl + "svgs/desyncIcon.svg";

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
          <FgSVGElement
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
