import React from "react";
import FgButton from "../../../../../../elements/fgButton/FgButton";
import FgSVGElement from "../../../../../../elements/fgSVGElement/FgSVGElement";
import FgHoverContentStandard from "../../../../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import LowerController from "../../../lowerControls/lib/LowerController";
import { ContentStateTypes } from "../../../../../../../../universal/contentTypeConstant";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const tableTopReducedIcon =
  nginxAssetServerBaseUrl + "svgs/tableTopReducedIcon.svg";
const tableTopReducedTippedIcon =
  nginxAssetServerBaseUrl + "svgs/tableTopReducedTippedIcon.svg";

export default function TabledButton({
  state,
  lowerController,
}: {
  state: ContentStateTypes[];
  lowerController: LowerController;
}) {
  return (
    <FgButton
      className="pointer-events-auto flex !aspect-square h-full items-center justify-end"
      clickFunction={() => {
        lowerController.handleTable();
      }}
      contentFunction={() => {
        return (
          <FgSVGElement
            src={
              state.includes("tabled")
                ? tableTopReducedTippedIcon
                : tableTopReducedIcon
            }
            attributes={[
              { key: "width", value: "100%" },
              { key: "height", value: "100%" },
            ]}
          />
        );
      }}
      hoverContent={
        <FgHoverContentStandard
          content={state.includes("tabled") ? "Untable (t)" : "Table (t)"}
          style="light"
        />
      }
      options={{ hoverType: "below" }}
    />
  );
}
