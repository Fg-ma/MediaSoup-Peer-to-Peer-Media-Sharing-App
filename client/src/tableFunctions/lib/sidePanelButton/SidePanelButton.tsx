import React from "react";
import FgSVGElement from "../../../elements/fgSVGElement/FgSVGElement";
import FgButton from "../../../elements/fgButton/FgButton";
import FgHoverContentStandard from "../../../elements/fgHoverContentStandard/FgHoverContentStandard";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const openSidePanelIcon =
  nginxAssetServerBaseUrl + "svgs/openSidePanelIcon.svg";
const closeSidePanelIcon =
  nginxAssetServerBaseUrl + "svgs/closeSidePanelIcon.svg";

export default function SidePanelButton({
  tableSidePanelActive,
  setTableSidePanelActive,
  sidePanelPosition,
  setSidePanelPosition,
}: {
  tableSidePanelActive: boolean;
  setTableSidePanelActive: React.Dispatch<React.SetStateAction<boolean>>;
  sidePanelPosition: "left" | "right";
  setSidePanelPosition: React.Dispatch<React.SetStateAction<"left" | "right">>;
}) {
  return (
    <FgButton
      contentFunction={() => (
        <FgSVGElement
          src={tableSidePanelActive ? closeSidePanelIcon : openSidePanelIcon}
          className="flex items-center justify-center stroke-fg-white"
          attributes={[
            { key: "width", value: "85%" },
            { key: "height", value: "85%" },
          ]}
        />
      )}
      clickFunction={(event) => {
        if (event.ctrlKey && sidePanelPosition === "left") {
          setSidePanelPosition("right");
        } else if (sidePanelPosition === "right") {
          setSidePanelPosition("left");
        }

        setTableSidePanelActive((prev) => !prev);
      }}
      hoverContent={
        <FgHoverContentStandard
          content={
            tableSidePanelActive ? "Close side panel" : "Open side panel"
          }
        />
      }
      options={{ hoverTimeoutDuration: 100 }}
      aria-label={tableSidePanelActive ? "Close side panel" : "Open side panel"}
    />
  );
}
