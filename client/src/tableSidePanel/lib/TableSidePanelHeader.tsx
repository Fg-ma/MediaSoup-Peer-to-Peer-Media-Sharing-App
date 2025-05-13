import React from "react";
import FgButton from "../../elements/fgButton/FgButton";
import FgDropdownButton from "../../elements/fgDropdownButton/FgDropdownButton";
import { TablePanels } from "../TableSidePanel";
import FgSVGElement from "../../elements/fgSVGElement/FgSVGElement";
import FgHoverContentStandard from "../../elements/fgHoverContentStandard/FgHoverContentStandard";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const closeIcon = nginxAssetServerBaseUrl + "svgs/closeIcon.svg";

const activePanelTitles: { [tablePanel in TablePanels]: string } = {
  general: "General",
  settings: "Settings",
  upload: "Uploads",
  download: "Downloads",
};

export default function TableSidePanelHeader({
  tableSidePanelHeaderRef,
  activePanel,
  setTableSidePanelActive,
  setExternalRerender,
}: {
  tableSidePanelHeaderRef: React.RefObject<HTMLDivElement>;
  activePanel: React.MutableRefObject<TablePanels>;
  setTableSidePanelActive: React.Dispatch<React.SetStateAction<boolean>>;
  setExternalRerender: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <div
      ref={tableSidePanelHeaderRef}
      className="flex h-14 w-full items-center justify-between border-b-2 border-fg-tone-black-3 bg-fg-tone-black-5 p-2"
    >
      <FgDropdownButton
        kind="popup"
        label={activePanelTitles[activePanel.current]}
        className="h-10 w-36 py-1 font-Josefin text-xl"
        elements={Object.entries(activePanelTitles).map(([key, title]) => (
          <div
            key={key}
            className={`${activePanel.current === key ? "bg-fg-tone-black-8" : ""} h-max w-[95%] rounded font-K2D hover:bg-fg-tone-black-8`}
            onClick={() => {
              activePanel.current = key as TablePanels;
              setExternalRerender((prev) => !prev);
            }}
          >
            {title}
          </div>
        ))}
      />
      <FgButton
        className="flex aspect-square h-[75%] items-center justify-center"
        clickFunction={() => setTableSidePanelActive(false)}
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
