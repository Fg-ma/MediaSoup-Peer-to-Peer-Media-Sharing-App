import React from "react";
import { useSignalContext } from "../../context/signalContext/SignalContext";
import FgButton from "../../elements/fgButton/FgButton";
import FgDropdownButton from "../../elements/fgDropdownButton/FgDropdownButton";
import { TableSidePanels } from "../TableSidePanel";
import FgSVGElement from "../../elements/fgSVGElement/FgSVGElement";
import FgHoverContentStandard from "../../elements/fgHoverContentStandard/FgHoverContentStandard";
import { ContentTypes } from "../../../../universal/contentTypeConstant";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const closeIcon = nginxAssetServerBaseUrl + "svgs/closeIcon.svg";
const swapIcon = nginxAssetServerBaseUrl + "svgs/swapIcon.svg";

const activePanelTitles: { [tablePanel in TableSidePanels]: string } = {
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
  sidePanelPosition,
  setSidePanelPosition,
  currentSettingsActive,
}: {
  tableSidePanelHeaderRef: React.RefObject<HTMLDivElement>;
  activePanel: React.MutableRefObject<TableSidePanels>;
  setTableSidePanelActive: React.Dispatch<React.SetStateAction<boolean>>;
  setExternalRerender: React.Dispatch<React.SetStateAction<boolean>>;
  sidePanelPosition: "left" | "right";
  setSidePanelPosition: React.Dispatch<React.SetStateAction<"left" | "right">>;
  currentSettingsActive: React.MutableRefObject<
    | {
        contentType: ContentTypes;
        instanceId: string;
      }
    | undefined
  >;
}) {
  const { sendSettingsSignal } = useSignalContext();

  return (
    <div
      ref={tableSidePanelHeaderRef}
      className="flex h-14 w-full items-center justify-between border-b-2 border-fg-tone-black-3 bg-fg-tone-black-5 p-2"
    >
      <FgDropdownButton
        kind="popup"
        label={activePanelTitles[activePanel.current]}
        className="mr-1 h-10 max-w-36 grow px-1 py-1 font-Josefin text-xl"
        elements={Object.entries(activePanelTitles).map(([key, title]) => (
          <div
            key={key}
            className={`${activePanel.current === key ? "bg-fg-tone-black-8" : ""} h-max w-[95%] truncate rounded font-K2D hover:bg-fg-tone-black-8`}
            onClick={() => {
              activePanel.current = key as TableSidePanels;
              setExternalRerender((prev) => !prev);
              currentSettingsActive.current = undefined;
              sendSettingsSignal({
                type: "sidePanelChanged",
                header: {
                  activePanel: activePanel.current,
                  currentSettingsActive: currentSettingsActive.current,
                },
              });
            }}
          >
            {title}
          </div>
        ))}
      />
      <div className="flex h-full w-max items-center justify-center space-x-1">
        <FgButton
          className="flex aspect-square h-full items-center justify-center"
          clickFunction={() =>
            setSidePanelPosition((prev) => (prev === "left" ? "right" : "left"))
          }
          contentFunction={() => (
            <FgSVGElement
              src={swapIcon}
              className={`${sidePanelPosition === "left" ? "-scale-x-100" : ""} fill-fg-white stroke-fg-white`}
              attributes={[
                { key: "height", value: "100%" },
                { key: "width", value: "100%" },
              ]}
            />
          )}
          hoverContent={
            <FgHoverContentStandard content="Swap panel side" style="light" />
          }
          options={{
            hoverSpacing: 4,
            hoverTimeoutDuration: 750,
            hoverType: "above",
          }}
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
          hoverContent={
            <FgHoverContentStandard content="Close" style="light" />
          }
          options={{
            hoverSpacing: 4,
            hoverTimeoutDuration: 750,
            hoverType: "above",
          }}
        />
      </div>
    </div>
  );
}
