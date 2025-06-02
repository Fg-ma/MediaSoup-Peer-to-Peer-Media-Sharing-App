import React, { useState } from "react";
import FgButton from "../../../elements/fgButton/FgButton";
import FgSVGElement from "../../../elements/fgSVGElement/FgSVGElement";
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
          <FgSVGElement
            src={src}
            className="fill-fg-white stroke-fg-white"
            attributes={[
              { key: "width", value: "95%" },
              { key: "height", value: "95%" },
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
      options={{ hoverTimeoutDuration: 750 }}
    />
  );
}
