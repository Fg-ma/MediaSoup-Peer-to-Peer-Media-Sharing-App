import React, { useState } from "react";
import FgButton from "../../../fgElements/fgButton/FgButton";
import FgSVG from "../../../fgElements/fgSVG/FgSVG";
import FgHoverContentStandard from "../../../fgElements/fgHoverContentStandard/FgHoverContentStandard";

const nginxAssetSeverBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const silenceIcon =
  nginxAssetSeverBaseUrl + "svgs/userFunctions/silenceIcon.svg";
const silenceOffIcon =
  nginxAssetSeverBaseUrl + "svgs/userFunctions/silenceOffIcon.svg";

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
          content={isSilenced ? "Unsilence" : "Silence"}
        />
      }
      scrollingContainerRef={userPanelRef}
      options={{ hoverTimeoutDuration: 750 }}
    />
  );
}
