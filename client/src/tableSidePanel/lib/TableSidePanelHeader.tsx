import React from "react";
import FgButton from "../../elements/fgButton/FgButton";
import FgDropdownButton from "../../elements/fgDropdownButton/FgDropdownButton";
import { TablePanels } from "../TableSidePanel";
import FgSVGElement from "../../elements/fgSVGElement/FgSVGElement";
import FgHoverContentStandard from "../../elements/fgHoverContentStandard/FgHoverContentStandard";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const closeIcon = nginxAssetServerBaseUrl + "svgs/closeIcon.svg";

const activePanelTitles: { [tablePanel in TablePanels]: string } = {
  loading: "Loading",
  settings: "Settings",
};

export default function TableSidePanelHeader({
  tableSidePanelRef,
  activePanel,
  setActivePanel,
}: {
  tableSidePanelRef: React.RefObject<HTMLDivElement>;
  activePanel: TablePanels;
  setActivePanel: React.Dispatch<React.SetStateAction<TablePanels | undefined>>;
}) {
  return (
    <div
      ref={tableSidePanelRef}
      className="flex h-14 w-full items-center justify-between border-b-2 border-fg-tone-black-3 bg-fg-tone-black-5 p-2"
    >
      <FgDropdownButton
        kind="popup"
        label={activePanelTitles[activePanel]}
        className="w-36 py-1 font-Josefin text-xl"
        elements={[]}
      />
      <FgButton
        className="flex aspect-square h-[75%] items-center justify-center"
        clickFunction={() => setActivePanel(undefined)}
        contentFunction={() => (
          <FgSVGElement
            src={closeIcon}
            className="fill-fg-white stroke-fg-white"
            attributes={[
              { key: "height", value: "100%" },
              { key: "width", value: "100%" },
            ]}
          />
        )}
        hoverContent={<FgHoverContentStandard content="Close" style="light" />}
        options={{
          hoverSpacing: 4,
          hoverTimeoutDuration: 750,
          hoverType: "above",
        }}
      />
    </div>
  );
}
