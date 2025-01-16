import React from "react";
import FgButton from "../../../fgElements/fgButton/FgButton";
import FgSVG from "../../../fgElements/fgSVG/FgSVG";
import FgHoverContentStandard from "../../../fgElements/fgHoverContentStandard/FgHoverContentStandard";

const nginxAssetSeverBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const pingIcon = nginxAssetSeverBaseUrl + "svgs/userFunctions/pingIcon.svg";

export default function PingButton({
  userPanelRef,
}: {
  userPanelRef: React.RefObject<HTMLDivElement>;
}) {
  return (
    <FgButton
      contentFunction={() => (
        <FgSVG
          src={pingIcon}
          attributes={[
            { key: "width", value: "95%" },
            { key: "height", value: "95%" },
            { key: "fill", value: "black" },
            { key: "stroke", value: "black" },
          ]}
        />
      )}
      hoverContent={<FgHoverContentStandard content='Ping' />}
      scrollingContainerRef={userPanelRef}
      options={{ hoverTimeoutDuration: 750 }}
    />
  );
}
