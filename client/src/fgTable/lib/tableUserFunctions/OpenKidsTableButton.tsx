import React, { useState } from "react";
import FgButton from "../../../elements/fgButton/FgButton";
import FgSVG from "../../../elements/fgSVG/FgSVG";
import FgHoverContentStandard from "../../../elements/fgHoverContentStandard/FgHoverContentStandard";

const nginxAssetSeverBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const tableIcon = nginxAssetSeverBaseUrl + "svgs/userFunctions/tableIcon.svg";
const tableOffIcon =
  nginxAssetSeverBaseUrl + "svgs/userFunctions/tableOffIcon.svg";

export default function OpenKidsTableButton({
  userPanelRef,
}: {
  userPanelRef: React.RefObject<HTMLDivElement>;
}) {
  const [isKidsTableOpen, setIsKidsTableOpen] = useState(false);

  return (
    <FgButton
      clickFunction={() => setIsKidsTableOpen((prev) => !prev)}
      contentFunction={() => {
        const src = isKidsTableOpen ? tableOffIcon : tableIcon;

        return (
          <FgSVG
            src={src}
            attributes={[
              { key: "width", value: "95%" },
              { key: "height", value: "95%" },
              { key: "fill", value: "black" },
              { key: "stroke", value: "black" },
            ]}
          />
        );
      }}
      hoverContent={
        <FgHoverContentStandard
          content={isKidsTableOpen ? "Delete kids table" : "Create kids table"}
        />
      }
      scrollingContainerRef={userPanelRef}
      options={{ hoverTimeoutDuration: 750 }}
    />
  );
}
