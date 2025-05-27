import React from "react";
import FgButton from "../../../../../elements/fgButton/FgButton";
import FgSVGElement from "../../../../../elements/fgSVGElement/FgSVGElement";
import FgHoverContentStandard from "../../../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import LowerTextController from "../LowerTextController";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const saveIcon = nginxAssetServerBaseUrl + "svgs/saveIcon.svg";

export default function SaveSection({
  settingsActive,
  lowerTextController,
  scrollingContainerRef,
}: {
  settingsActive: boolean;
  lowerTextController: React.MutableRefObject<LowerTextController>;
  scrollingContainerRef: React.RefObject<HTMLDivElement>;
}) {
  return (
    <div className="h-full">
      <FgButton
        clickFunction={() => {
          lowerTextController.current.handleSave();
        }}
        contentFunction={() => (
          <FgSVGElement
            src={saveIcon}
            attributes={[
              { key: "width", value: "85%" },
              { key: "height", value: "85%" },
              { key: "fill", value: "#f2f2f2" },
              { key: "stroke", value: "#f2f2f2" },
            ]}
          />
        )}
        hoverContent={
          !settingsActive ? (
            <FgHoverContentStandard content="Save (ctrl+s)" style="light" />
          ) : undefined
        }
        scrollingContainerRef={scrollingContainerRef}
        className="pointer-events-auto flex aspect-square h-full scale-x-[-1] items-center justify-center"
      />
    </div>
  );
}
