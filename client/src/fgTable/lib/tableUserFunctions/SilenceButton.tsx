import React, { useState } from "react";
import FgButton from "../../../elements/fgButton/FgButton";
import FgSVGElement from "../../../elements/fgSVGElement/FgSVGElement";
import FgHoverContentStandard from "../../../elements/fgHoverContentStandard/FgHoverContentStandard";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const silenceIcon =
  nginxAssetServerBaseUrl + "svgs/userFunctions/silenceIcon.svg";
const silenceOffIcon =
  nginxAssetServerBaseUrl + "svgs/userFunctions/silenceOffIcon.svg";

export default function SilenceButton({
  userPanelRef,
}: {
  userPanelRef: React.RefObject<HTMLDivElement>;
}) {
  const [isSilenced, setIsSilenced] = useState(false);

  return (
    <FgButton
      clickFunction={() => setIsSilenced((prev) => !prev)}
      contentFunction={() => {
        const src = isSilenced ? silenceOffIcon : silenceIcon;

        return (
          <FgSVGElement
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
          content={isSilenced ? "Unsilence" : "Silence"}
        />
      }
      scrollingContainerRef={userPanelRef}
      options={{ hoverTimeoutDuration: 750, hoverZValue: 5000000000 }}
    />
  );
}
