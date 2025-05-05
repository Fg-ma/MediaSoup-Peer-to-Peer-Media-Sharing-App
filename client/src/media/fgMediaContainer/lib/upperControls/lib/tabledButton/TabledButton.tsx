import React from "react";
import FgButton from "../../../../../../elements/fgButton/FgButton";
import FgSVGElement from "../../../../../../elements/fgSVGElement/FgSVGElement";
import FgHoverContentStandard from "../../../../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import LowerController from "../../../lowerControls/lib/LowerController";
import { TableContentStateTypes } from "../../../../../../../../universal/contentTypeConstant";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const tableTopReducedIcon =
  nginxAssetServerBaseUrl + "svgs/tableTopReducedIcon.svg";
const tableTopReducedTippedIcon =
  nginxAssetServerBaseUrl + "svgs/tableTopReducedTippedIcon.svg";

export default function TabledButton({
  state,
  lowerController,
}: {
  state: React.MutableRefObject<TableContentStateTypes[]>;
  lowerController: React.MutableRefObject<LowerController>;
}) {
  return (
    <FgButton
      className="pointer-events-auto flex !aspect-square h-full items-center justify-end"
      clickFunction={lowerController.current.handleTable}
      contentFunction={() => {
        return (
          <FgSVGElement
            src={
              state.current.includes("tabled")
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
          content={
            state.current.includes("tabled") ? "Untable (t)" : "Table (t)"
          }
          style="light"
        />
      }
      options={{ hoverType: "below" }}
    />
  );
}
