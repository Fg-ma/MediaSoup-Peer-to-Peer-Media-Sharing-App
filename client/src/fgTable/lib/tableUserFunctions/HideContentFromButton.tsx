import React, { useState } from "react";
import FgButton from "../../../elements/fgButton/FgButton";
import FgSVG from "../../../elements/fgSVG/FgSVG";
import FgHoverContentStandard from "../../../elements/fgHoverContentStandard/FgHoverContentStandard";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const hideContentIcon =
  nginxAssetServerBaseUrl + "svgs/userFunctions/hideContentIcon.svg";
const hideContentOffIcon =
  nginxAssetServerBaseUrl + "svgs/userFunctions/hideContentOffIcon.svg";

export default function HideContentFromButton({
  userPanelRef,
}: {
  userPanelRef: React.RefObject<HTMLDivElement>;
}) {
  const [isHiddenFrom, setIsHiddenFrom] = useState(false);

  return (
    <FgButton
      clickFunction={() => setIsHiddenFrom((prev) => !prev)}
      contentFunction={() => {
        const src = isHiddenFrom ? hideContentOffIcon : hideContentIcon;

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
          content={isHiddenFrom ? "Hide content from" : "Reveal content to"}
        />
      }
      scrollingContainerRef={userPanelRef}
      options={{ hoverTimeoutDuration: 750, hoverZValue: 5000000000 }}
    />
  );
}
