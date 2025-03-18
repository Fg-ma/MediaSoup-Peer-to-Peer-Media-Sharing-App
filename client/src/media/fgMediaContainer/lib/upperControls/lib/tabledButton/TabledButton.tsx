import React from "react";
import FgButton from "../../../../../../elements/fgButton/FgButton";
import FgSVGElement from "../../../../../../elements/fgSVGElement/FgSVGElement";
import FgHoverContentStandard from "../../../../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import LowerController from "../../../lowerControls/lib/LowerController";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const tableTopReducedIcon =
  nginxAssetServerBaseUrl + "svgs/tableTopReducedIcon.svg";
const tableTopReducedTippedIcon =
  nginxAssetServerBaseUrl + "svgs/tableTopReducedTippedIcon.svg";

export default function TabledButton({
  tabled,
  lowerController,
}: {
  tabled: boolean;
  lowerController: LowerController;
}) {
  return (
    <FgButton
      className='flex items-center justify-end h-full !aspect-square pointer-events-auto'
      clickFunction={() => {
        lowerController.handleTable();
      }}
      contentFunction={() => {
        return (
          <FgSVGElement
            src={tabled ? tableTopReducedTippedIcon : tableTopReducedIcon}
            attributes={[
              { key: "width", value: "90%" },
              { key: "height", value: "90%" },
            ]}
          />
        );
      }}
      hoverContent={
        <FgHoverContentStandard
          content={tabled ? "Untable (t)" : "Table (t)"}
          style='light'
        />
      }
      options={{ hoverType: "below" }}
    />
  );
}
