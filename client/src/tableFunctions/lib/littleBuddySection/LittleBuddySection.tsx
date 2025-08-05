import React from "react";
import FgButton from "../../../elements/fgButton/FgButton";
import FgSVGElement from "../../../elements/fgSVGElement/FgSVGElement";
import FgHoverContentStandard from "../../../elements/fgHoverContentStandard/FgHoverContentStandard";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const littleBuddyIcon = nginxAssetServerBaseUrl + "svgs/littleBuddyIcon.svg";
const littleBuddyCloseIcon =
  nginxAssetServerBaseUrl + "svgs/littleBuddyCloseIcon.svg";

export default function LittleBuddySection({
  littleBuddyActive,
  setLittleBuddyActive,
}: {
  littleBuddyActive: boolean;
  setLittleBuddyActive: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <FgButton
      clickFunction={() => setLittleBuddyActive((prev) => !prev)}
      className="flex aspect-square h-full items-center justify-center"
      contentFunction={() => {
        return (
          <FgSVGElement
            src={littleBuddyActive ? littleBuddyCloseIcon : littleBuddyIcon}
            className="aspect-square h-full fill-fg-off-white stroke-fg-off-white"
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
            littleBuddyActive ? "Close little buddies" : "Open little buddies"
          }
        />
      }
      options={{ hoverTimeoutDuration: 750 }}
      aria-label={"Little buddies"}
    />
  );
}
